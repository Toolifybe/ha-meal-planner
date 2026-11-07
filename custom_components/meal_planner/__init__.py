"""Meal Planner integration for Home Assistant."""
import asyncio
import html
import json
import logging
import os
import re
import shutil
import uuid
from datetime import datetime

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse, callback
from homeassistant.util import dt as dt_util

DOMAIN = "meal_planner"
EVENT = "meal_planner_updated"
_LOGGER = logging.getLogger(__name__)

RECIPES_FILE = "meal_planner_recipes.json"
PLANNING_FILE = "meal_planner_planning.json"
SHOPPING_FILE = "meal_planner_shopping.json"
FIXED_PRODUCTS_FILE = "meal_planner_fixed_products.json"

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
MEAL_TYPES = ["breakfast", "lunch", "dinner"]

RECIPE_FIELDS = ("name", "description", "category", "tags", "prep_time",
                 "cook_time", "servings", "difficulty", "image",
                 "source_url", "ingredients", "steps", "last_cooked",
                 "rating", "favourite")
ITEM_FIELDS = ("name", "amount", "unit", "shop_category", "checked")


# ─── Storage ──────────────────────────────────────────────────────────
class DataFileError(Exception):
    """A data file exists but cannot be read. Never overwrite it."""


def _read(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _load_json(path: str, default):
    """Load a data file.

    A missing file gives the default. A broken file is NOT treated as empty
    (that used to wipe all data on the next save): it is copied aside, the
    last good backup (.bak) is used, and if that fails too an error is raised
    so nothing gets overwritten.
    """
    if not os.path.exists(path):
        return default
    try:
        data = _read(path)
        if isinstance(data, type(default)):
            return data
        raise ValueError(f"unexpected type {type(data).__name__}")
    except (ValueError, OSError) as err:
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        try:
            shutil.copy2(path, f"{path}.corrupt-{stamp}")
        except OSError:
            pass
        bak = path + ".bak"
        if os.path.exists(bak):
            try:
                data = _read(bak)
                if isinstance(data, type(default)):
                    _LOGGER.warning("Meal Planner: %s was damaged (%s), backup used", path, err)
                    return data
            except (ValueError, OSError):
                pass
        _LOGGER.error("Meal Planner: %s cannot be read (%s); nothing will be overwritten", path, err)
        raise DataFileError(f"{os.path.basename(path)} is damaged") from err


def _save_json(path: str, data):
    """Write atomically: temp file first, keep the previous version as .bak."""
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    if os.path.exists(path):
        try:
            shutil.copy2(path, path + ".bak")
        except OSError:
            pass
    os.replace(tmp, path)


def _copy_frontend(hass: HomeAssistant):
    src = os.path.join(os.path.dirname(__file__), "frontend", "meal-planner-card.js")
    dst_dir = hass.config.path("www", "community", "ha-meal-planner")
    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, "meal-planner-card.js")
    if os.path.exists(src):
        shutil.copy2(src, dst)
        _LOGGER.info("Meal Planner: frontend JS copied to %s", dst)


class Store:
    """Read-modify-write on the JSON files, one change at a time."""

    def __init__(self, hass: HomeAssistant):
        self.hass = hass
        self.lock = asyncio.Lock()
        self.recipes = hass.config.path(RECIPES_FILE)
        self.planning = hass.config.path(PLANNING_FILE)
        self.shopping = hass.config.path(SHOPPING_FILE)
        self.fixed = hass.config.path(FIXED_PRODUCTS_FILE)

    async def load(self, path, default):
        return await self.hass.async_add_executor_job(_load_json, path, default)

    async def update(self, path, default, fn):
        """Load, let fn change the data in place, save. Returns fn's result."""
        async with self.lock:
            data = await self.load(path, default)
            result = fn(data)
            await self.hass.async_add_executor_job(_save_json, path, data)
            return result

    def fire(self, what, week=None):
        self.hass.bus.async_fire(EVENT, {"what": what, "week": week})


def _store(request) -> Store:
    return request.app["hass"].data[DOMAIN]


def _error_json(view, err):
    return view.json({"error": str(err)}, status_code=500)


def _new_recipe(data: dict) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "name": str(data.get("name", "")).strip(),
        "description": data.get("description", ""),
        "category": data.get("category", "avondeten"),
        "tags": data.get("tags", []),
        "prep_time": data.get("prep_time", 0),
        "cook_time": data.get("cook_time", 0),
        "servings": data.get("servings", 4),
        "difficulty": data.get("difficulty", "medium"),
        "image": data.get("image", None),
        "source_url": data.get("source_url", ""),
        "ingredients": data.get("ingredients", []),
        "steps": data.get("steps", []),
        "created_at": dt_util.now().isoformat(),
        "last_cooked": None,
        "rating": data.get("rating", 0),
        "favourite": data.get("favourite", False),
    }


async def _todays_dinner(store: Store) -> dict:
    now = dt_util.now()  # HA's time zone, not the server's
    iso = now.isocalendar()
    week = f"{iso[0]}-W{iso[1]:02d}"
    day = DAYS[now.weekday()]
    all_planning = await store.load(store.planning, {})
    recipes = await store.load(store.recipes, [])
    day_data = all_planning.get(week, _empty_week()).get("days", {}).get(day, {}) or {}
    dinner_id = day_data.get("dinner")
    recipe = next((r for r in recipes if r.get("id") == dinner_id), None) if dinner_id else None
    return {
        "day": day,
        "date": now.date().isoformat(),
        "week": week,
        "recipe": recipe,
        "nocook": day_data.get("nocook") or None,
        "note": day_data.get("note") or "",
    }


# ─── Setup ────────────────────────────────────────────────────────────
@websocket_api.websocket_command({vol.Required("type"): "meal_planner/subscribe"})
@callback
def _ws_subscribe(hass, connection, msg):
    """Live updates for every logged-in user.

    Plain subscribe_events only allows admins to listen to custom events,
    so a readonly dashboard for a family member never got updates.
    """
    @callback
    def forward(event):
        connection.send_message(websocket_api.event_message(msg["id"], event.data))

    connection.subscriptions[msg["id"]] = hass.bus.async_listen(EVENT, forward)
    connection.send_result(msg["id"])


async def async_setup(hass: HomeAssistant, config: dict):
    await hass.async_add_executor_job(_copy_frontend, hass)

    store = Store(hass)
    hass.data[DOMAIN] = store

    for view in (RecipesView(), RecipeDetailView(), PlanningView(), ShoppingView(),
                 ShoppingItemsView(), ShoppingItemView(), TodaysDinnerView(),
                 FixedProductsView(), ImportRecipeView()):
        hass.http.register_view(view)

    websocket_api.async_register_command(hass, _ws_subscribe)

    async def handle_add_recipe(call: ServiceCall):
        recipe = _new_recipe(dict(call.data))
        if not recipe["name"]:
            return
        await store.update(store.recipes, [], lambda recipes: recipes.append(recipe))
        store.fire("recipes")

    async def handle_todays_dinner(call: ServiceCall):
        return await _todays_dinner(store)

    hass.services.async_register(
        DOMAIN, "add_recipe", handle_add_recipe,
        schema=vol.Schema({
            vol.Required("name"): str,
            vol.Optional("description", default=""): str,
        }),
    )
    hass.services.async_register(
        DOMAIN, "get_todays_dinner", handle_todays_dinner,
        supports_response=SupportsResponse.ONLY,
    )
    return True


# ─── Recipes ──────────────────────────────────────────────────────────
class RecipesView(HomeAssistantView):
    url = "/api/meal_planner/recipes"
    name = "api:meal_planner:recipes"
    requires_auth = True

    async def get(self, request):
        store = _store(request)
        try:
            return self.json(await store.load(store.recipes, []))
        except DataFileError as err:
            return _error_json(self, err)

    async def post(self, request):
        store = _store(request)
        recipe = _new_recipe(await request.json())
        try:
            await store.update(store.recipes, [], lambda recipes: recipes.append(recipe))
        except DataFileError as err:
            return _error_json(self, err)
        store.fire("recipes")
        return self.json(recipe)


class RecipeDetailView(HomeAssistantView):
    url = "/api/meal_planner/recipes/{recipe_id}"
    name = "api:meal_planner:recipe_detail"
    requires_auth = True

    async def put(self, request, recipe_id):
        store = _store(request)
        body = await request.json()

        def change(recipes):
            for recipe in recipes:
                if recipe.get("id") == recipe_id:
                    for field in RECIPE_FIELDS:
                        if field in body:
                            recipe[field] = body[field]
                    return recipe
            return None

        try:
            recipe = await store.update(store.recipes, [], change)
        except DataFileError as err:
            return _error_json(self, err)
        if recipe is None:
            return self.json({"error": "not found"}, status_code=404)
        store.fire("recipes")
        return self.json(recipe)

    async def delete(self, request, recipe_id):
        store = _store(request)

        def change(recipes):
            recipes[:] = [r for r in recipes if r.get("id") != recipe_id]

        try:
            await store.update(store.recipes, [], change)
        except DataFileError as err:
            return _error_json(self, err)
        store.fire("recipes")
        return self.json({"ok": True})


# ─── Planning ─────────────────────────────────────────────────────────
def _empty_week():
    return {"days": {day: {"breakfast": None, "lunch": None, "dinner": None, "servings": 4}
                     for day in DAYS}}


class PlanningView(HomeAssistantView):
    url = "/api/meal_planner/planning/{week}"
    name = "api:meal_planner:planning"
    requires_auth = True

    async def get(self, request, week):
        store = _store(request)
        try:
            all_planning = await store.load(store.planning, {})
        except DataFileError as err:
            return _error_json(self, err)
        return self.json(all_planning.get(week, _empty_week()))

    async def put(self, request, week):
        store = _store(request)
        body = await request.json()
        if not isinstance(body, dict) or not isinstance(body.get("days"), dict):
            return self.json({"error": "invalid planning"}, status_code=400)

        def change(all_planning):
            all_planning[week] = body

        try:
            await store.update(store.planning, {}, change)
        except DataFileError as err:
            return _error_json(self, err)
        store.fire("planning", week)
        return self.json(body)


# ─── Shopping ─────────────────────────────────────────────────────────
def _key(name):
    return str(name or "").lower().strip()


def _empty_shopping(week):
    return {"week": week, "items": [], "extra_items": [], "removed": []}


class ShoppingView(HomeAssistantView):
    url = "/api/meal_planner/shopping/{week}"
    name = "api:meal_planner:shopping"
    requires_auth = True

    async def get(self, request, week):
        store = _store(request)
        try:
            all_shopping = await store.load(store.shopping, {})
        except DataFileError as err:
            return _error_json(self, err)
        return self.json(all_shopping.get(week, _empty_shopping(week)))

    async def post(self, request, week):
        """Generate the shopping list from the week planning."""
        store = _store(request)
        try:
            recipes = await store.load(store.recipes, [])
            all_planning = await store.load(store.planning, {})
        except DataFileError as err:
            return _error_json(self, err)

        week_plan = all_planning.get(week, _empty_week())
        recipes_map = {r.get("id"): r for r in recipes}

        merged = {}
        for day_data in (week_plan.get("days") or {}).values():
            if not isinstance(day_data, dict):
                continue
            try:
                servings = float(day_data.get("servings") or 4)
            except (TypeError, ValueError):
                servings = 4
            for meal_type in MEAL_TYPES:
                recipe = recipes_map.get(day_data.get(meal_type))
                if not recipe:
                    continue
                try:
                    factor = servings / float(recipe.get("servings") or 4)
                except (TypeError, ValueError, ZeroDivisionError):
                    factor = 1
                for ing in recipe.get("ingredients", []):
                    name = str(ing.get("name") or "").strip()
                    if not name:
                        continue
                    unit = str(ing.get("unit") or "").strip()
                    try:
                        amount = float(ing.get("amount") or 0) * factor
                    except (TypeError, ValueError):
                        amount = 0
                    key = (_key(name), unit.lower())
                    if key in merged:
                        merged[key]["amount"] += amount
                    else:
                        merged[key] = {
                            "name": name,
                            "amount": amount,
                            "unit": unit,
                            "shop_category": ing.get("shop_category") or "overige",
                        }

        def change(all_shopping):
            existing = all_shopping.get(week) or _empty_shopping(week)
            removed = set(existing.get("removed", []))
            previous = {}
            for item in existing.get("items", []):
                previous.setdefault((_key(item.get("name")), str(item.get("unit") or "").lower()), item)
                previous.setdefault((_key(item.get("name")), None), item)
            items = []
            for key, item in merged.items():
                if key[0] in removed:
                    continue  # removed by hand earlier: stays removed
                old = previous.get(key) or previous.get((key[0], None))
                item["amount"] = round(item["amount"], 1)
                item["id"] = old["id"] if old and old.get("id") else str(uuid.uuid4())
                item["checked"] = bool(old and old.get("checked"))
                items.append(item)
            shopping = {
                "week": week,
                "generated_at": dt_util.now().isoformat(),
                "items": items,
                "extra_items": existing.get("extra_items", []),
                "removed": sorted(removed),
            }
            all_shopping[week] = shopping
            return shopping

        try:
            shopping = await store.update(store.shopping, {}, change)
        except DataFileError as err:
            return _error_json(self, err)
        store.fire("shopping", week)
        return self.json(shopping)

    async def put(self, request, week):
        """Replace the whole week (kept for older card versions)."""
        store = _store(request)
        body = await request.json()

        def change(all_shopping):
            all_shopping[week] = body

        try:
            await store.update(store.shopping, {}, change)
        except DataFileError as err:
            return _error_json(self, err)
        store.fire("shopping", week)
        return self.json(body)


class ShoppingItemsView(HomeAssistantView):
    """Add extra items without overwriting what others changed meanwhile."""

    url = "/api/meal_planner/shopping/{week}/items"
    name = "api:meal_planner:shopping_items"
    requires_auth = True

    async def post(self, request, week):
        store = _store(request)
        body = await request.json()
        new_items = body.get("items", []) if isinstance(body, dict) else []

        def change(all_shopping):
            shopping = all_shopping.setdefault(week, _empty_shopping(week))
            extra = shopping.setdefault("extra_items", [])
            names = {_key(i.get("name")) for i in extra}
            for raw in new_items:
                name = str(raw.get("name") or "").strip()
                if not name or (body.get("skip_existing") and _key(name) in names):
                    continue
                item = {f: raw[f] for f in ITEM_FIELDS if f in raw}
                item.update({"id": "e_" + uuid.uuid4().hex[:12], "name": name,
                             "checked": bool(raw.get("checked", False))})
                item.setdefault("amount", 0)
                item.setdefault("unit", "")
                item.setdefault("shop_category", "overige")
                extra.append(item)
                names.add(_key(name))
            return shopping

        try:
            shopping = await store.update(store.shopping, {}, change)
        except DataFileError as err:
            return _error_json(self, err)
        store.fire("shopping", week)
        return self.json(shopping)


class ShoppingItemView(HomeAssistantView):
    url = "/api/meal_planner/shopping/{week}/item/{item_id}"
    name = "api:meal_planner:shopping_item"
    requires_auth = True

    async def put(self, request, week, item_id):
        """Change one item (e.g. tick it off) without touching the others."""
        store = _store(request)
        body = await request.json()

        def change(all_shopping):
            shopping = all_shopping.setdefault(week, _empty_shopping(week))
            for lst in ("items", "extra_items"):
                for item in shopping.get(lst, []):
                    if item.get("id") == item_id:
                        for field in ITEM_FIELDS:
                            if field in body:
                                item[field] = body[field]
            return shopping

        try:
            shopping = await store.update(store.shopping, {}, change)
        except DataFileError as err:
            return _error_json(self, err)
        store.fire("shopping", week)
        return self.json(shopping)

    async def delete(self, request, week, item_id):
        """Remove one item. Generated items are remembered as removed."""
        store = _store(request)

        def change(all_shopping):
            shopping = all_shopping.setdefault(week, _empty_shopping(week))
            removed = set(shopping.get("removed", []))
            for item in shopping.get("items", []):
                if item.get("id") == item_id:
                    removed.add(_key(item.get("name")))
            shopping["items"] = [i for i in shopping.get("items", []) if i.get("id") != item_id]
            shopping["extra_items"] = [i for i in shopping.get("extra_items", []) if i.get("id") != item_id]
            shopping["removed"] = sorted(removed)
            return shopping

        try:
            shopping = await store.update(store.shopping, {}, change)
        except DataFileError as err:
            return _error_json(self, err)
        store.fire("shopping", week)
        return self.json(shopping)


# ─── Recipe import ────────────────────────────────────────────────────
_FRACTIONS = {"½": "1/2", "¼": "1/4", "¾": "3/4", "⅓": "1/3", "⅔": "2/3", "⅛": "1/8"}
_UNITS = sorted({
    "kg", "kilo", "g", "gr", "gram", "mg", "l", "liter", "dl", "cl", "ml",
    "el", "eetlepel", "eetlepels", "tl", "theelepel", "theelepels", "kl", "koffielepel", "koffielepels",
    "snuifje", "snuifjes", "snufje", "scheut", "scheutje", "scheutjes",
    "stuk", "stuks", "snede", "sneden", "plak", "plakken", "plakje", "plakjes",
    "takje", "takjes", "teen", "tenen", "teentje", "teentjes", "bosje", "bosjes", "bos",
    "blik", "blikje", "blikjes", "pak", "pakje", "pakjes", "zak", "zakje", "zakjes",
    "pot", "potje", "potjes", "kop", "kopje", "kopjes", "handje", "handvol", "bol", "bollen",
    "cup", "cups", "tbsp", "tsp", "oz", "lb",
}, key=len, reverse=True)
_NUM = r"\d+(?:[.,]\d+)?(?:\s+\d+/\d+)?|\d+/\d+"
_AMOUNT = rf"(?P<a>{_NUM})(?:\s*(?:-|–|tot|à)\s*(?P<b>{_NUM}))?"
_ING_UNIT = re.compile(rf"^{_AMOUNT}\s*(?P<unit>{'|'.join(_UNITS)})\.?(?=\s|$)\s*(?P<name>.*)$", re.IGNORECASE)
_ING_COUNT = re.compile(rf"^{_AMOUNT}\s+(?P<name>.+)$")


def _to_number(text):
    """'1,5' → 1.5, '1/2' → 0.5, '1 1/2' → 1.5."""
    total = 0.0
    for part in text.replace(",", ".").split():
        if "/" in part:
            num, den = part.split("/", 1)
            total += float(num) / float(den) if float(den) else 0
        else:
            total += float(part)
    return total


def _parse_ingredient(text):
    """Parse an ingredient line like '500 g gehakt' into structured data."""
    text = text.strip()
    for sym, frac in _FRACTIONS.items():
        text = re.sub(rf"(\d)\s*{sym}", rf"\1 {frac}", text).replace(sym, frac)
    for pattern, unit in ((_ING_UNIT, None), (_ING_COUNT, "stuk")):
        m = pattern.match(text)
        if not m or not m.group("name").strip():
            continue
        try:
            # a range like 2-3: take the highest, so you buy enough
            amount = _to_number(m.group("b") or m.group("a"))
        except (ValueError, ZeroDivisionError):
            amount = 0
        return {
            "name": m.group("name").strip(),
            "amount": round(amount, 2),
            "unit": unit or m.group("unit").lower(),
            "shop_category": "overige",
        }
    return {"name": text, "amount": 0, "unit": "", "shop_category": "overige"}


def _clean(text):
    """Plain text only: strip HTML tags, decode entities."""
    text = re.sub(r"<[^>]*>", " ", str(text or ""))
    text = re.sub(r"\s+", " ", html.unescape(text)).strip()
    return re.sub(r"\s+([.,;:!?])", r"\1", text)


def _is_recipe(node):
    t = node.get("@type")
    return t == "Recipe" or (isinstance(t, list) and "Recipe" in t)


def _find_recipe(node, depth=0):
    """Find the Recipe object anywhere in a JSON-LD block (@graph, lists, mainEntity...)."""
    if depth > 6:
        return None
    if isinstance(node, dict):
        if _is_recipe(node):
            return node
        children = node.values()
    elif isinstance(node, list):
        children = node
    else:
        return None
    for child in children:
        found = _find_recipe(child, depth + 1)
        if found:
            return found
    return None


def _collect_steps(node, out):
    """Steps can be strings, HowToStep, or HowToSection with sub-steps."""
    if isinstance(node, str):
        text = _clean(node)
        if text:
            out.append(text)
    elif isinstance(node, list):
        for child in node:
            _collect_steps(child, out)
    elif isinstance(node, dict):
        if node.get("itemListElement"):
            _collect_steps(node["itemListElement"], out)
        else:
            text = _clean(node.get("text") or node.get("name") or "")
            if text:
                out.append(text)


def _parse_duration(iso_duration):
    """Parse ISO 8601 duration like PT45M or PT1H30M to minutes."""
    if not isinstance(iso_duration, str):
        return 0
    match = re.match(r"P(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?", iso_duration)
    if not match:
        return 0
    return int(match.group(1) or 0) * 60 + int(match.group(2) or 0)


def _parse_recipe_page(raw, url):
    blocks = re.findall(
        r"""<script[^>]+type=["']application/ld\+json["'][^>]*>(.*?)</script>""",
        raw, re.DOTALL | re.IGNORECASE)
    recipe_data = None
    for block in blocks:
        try:
            recipe_data = _find_recipe(json.loads(block.strip()))
        except ValueError:
            continue
        if recipe_data:
            break
    if not recipe_data:
        raise ValueError("Geen recept gevonden op deze pagina. Probeer een directe receptpagina.")

    image = None
    img = recipe_data.get("image")
    if isinstance(img, list) and img:
        img = img[0]
    if isinstance(img, str):
        image = img
    elif isinstance(img, dict):
        image = img.get("url")
    if not (isinstance(image, str) and image.startswith(("http://", "https://"))):
        image = None

    ingredients = []
    for line in recipe_data.get("recipeIngredient") or []:
        line = _clean(line)
        if line:
            ingredients.append(_parse_ingredient(line))

    steps = []
    _collect_steps(recipe_data.get("recipeInstructions") or [], steps)

    prep = _parse_duration(recipe_data.get("prepTime"))
    cook = _parse_duration(recipe_data.get("cookTime"))
    if not prep and not cook:
        cook = _parse_duration(recipe_data.get("totalTime"))

    description = _clean(recipe_data.get("description"))
    return {
        "name": _clean(recipe_data.get("name")),
        "description": description[:200],
        "category": "avondeten",
        "servings": 4,
        "prep_time": prep,
        "cook_time": cook,
        "difficulty": "medium",
        "source_url": url,
        "image": image,
        "tags": [],
        "ingredients": ingredients,
        "steps": steps,
    }


class ImportRecipeView(HomeAssistantView):
    url = "/api/meal_planner/import_recipe"
    name = "api:meal_planner:import_recipe"
    requires_auth = True

    async def post(self, request):
        import aiohttp
        from homeassistant.helpers.aiohttp_client import async_get_clientsession

        hass = request.app["hass"]
        body = await request.json()
        url = str(body.get("url", "")).strip()
        if not url.startswith(("http://", "https://")):
            return self.json({"error": "Geef een volledige link op (https://...)"})
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "nl-BE,nl;q=0.9,en;q=0.8",
        }
        try:
            session = async_get_clientsession(hass)
            async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status != 200:
                    return self.json({"error": f"Pagina niet bereikbaar (HTTP {resp.status})"})
                raw = await resp.text(errors="replace")
            return self.json(_parse_recipe_page(raw, url))
        except ValueError as err:
            return self.json({"error": str(err)})
        except Exception as err:  # network errors, timeouts
            _LOGGER.warning("Meal Planner: import of %s failed: %s", url, err)
            return self.json({"error": "Kon de pagina niet ophalen. Probeer een andere URL."})


# ─── Fixed products ───────────────────────────────────────────────────
class FixedProductsView(HomeAssistantView):
    url = "/api/meal_planner/fixed_products"
    name = "api:meal_planner:fixed_products"
    requires_auth = True

    async def get(self, request):
        store = _store(request)
        try:
            return self.json(await store.load(store.fixed, []))
        except DataFileError as err:
            return _error_json(self, err)

    async def put(self, request):
        store = _store(request)
        body = await request.json()
        if not isinstance(body, list):
            return self.json({"error": "invalid list"}, status_code=400)

        def change(products):
            products[:] = body

        try:
            await store.update(store.fixed, [], change)
        except DataFileError as err:
            return _error_json(self, err)
        store.fire("fixed")
        return self.json(body)


# ─── Today ────────────────────────────────────────────────────────────
class TodaysDinnerView(HomeAssistantView):
    url = "/api/meal_planner/today"
    name = "api:meal_planner:today"
    requires_auth = True

    async def get(self, request):
        try:
            return self.json(await _todays_dinner(_store(request)))
        except DataFileError as err:
            return _error_json(self, err)
