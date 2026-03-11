"""Meal Planner integration for Home Assistant."""
import json
import os
import re
import shutil
import uuid
import logging
from datetime import datetime
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant, ServiceCall

DOMAIN = "meal_planner"
_LOGGER = logging.getLogger(__name__)

RECIPES_FILE = "meal_planner_recipes.json"
PLANNING_FILE = "meal_planner_planning.json"
SHOPPING_FILE = "meal_planner_shopping.json"
FIXED_PRODUCTS_FILE = "meal_planner_fixed_products.json"

SHOP_CATEGORIES = [
    "groenten & fruit", "vlees & vis", "zuivel & eieren",
    "brood & bakkerij", "pasta & rijst", "conserven & sauzen",
    "diepvries", "dranken", "snoep & koek", "overige"
]

DAYS_NL = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
MEAL_TYPES = ["breakfast", "lunch", "dinner"]


def _get_path(hass: HomeAssistant, filename: str) -> str:
    return hass.config.path(filename)


def _load_json(path: str, default):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return default


def _save_json(path: str, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _copy_frontend(hass: HomeAssistant):
    src = os.path.join(os.path.dirname(__file__), "frontend", "meal-planner-card.js")
    dst_dir = hass.config.path("www", "community", "ha-meal-planner")
    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, "meal-planner-card.js")
    if os.path.exists(src):
        shutil.copy2(src, dst)
        _LOGGER.info("Meal Planner: frontend JS copied to %s", dst)


async def async_setup(hass: HomeAssistant, config: dict):
    await hass.async_add_executor_job(_copy_frontend, hass)

    recipes_path = _get_path(hass, RECIPES_FILE)
    planning_path = _get_path(hass, PLANNING_FILE)
    shopping_path = _get_path(hass, SHOPPING_FILE)
    fixed_path = _get_path(hass, FIXED_PRODUCTS_FILE)

    hass.http.register_view(RecipesView(recipes_path))
    hass.http.register_view(RecipeDetailView(recipes_path))
    hass.http.register_view(PlanningView(planning_path))
    hass.http.register_view(ShoppingView(shopping_path, recipes_path, planning_path, fixed_path))
    hass.http.register_view(ShoppingItemView(shopping_path))
    hass.http.register_view(TodaysDinnerView(planning_path, recipes_path))
    hass.http.register_view(FixedProductsView(fixed_path))
    hass.http.register_view(ImportRecipeView())

    async def handle_add_recipe(call: ServiceCall):
        recipes = await hass.async_add_executor_job(_load_json, recipes_path, [])
        recipe = {
            "id": str(uuid.uuid4()),
            "name": call.data.get("name", ""),
            "description": call.data.get("description", ""),
            "category": "avondeten",
            "tags": [],
            "prep_time": 0,
            "cook_time": 0,
            "servings": 4,
            "difficulty": "medium",
            "image": None,
            "source_url": "",
            "ingredients": [],
            "steps": [],
            "created_at": datetime.now().isoformat(),
            "last_cooked": None,
            "rating": body.get("rating", 0),
            "favourite": body.get("favourite", False),
        }
        recipes.append(recipe)
        await hass.async_add_executor_job(_save_json, recipes_path, recipes)
        hass.bus.fire("meal_planner_updated", {})

    hass.services.async_register(DOMAIN, "add_recipe", handle_add_recipe)
    return True


class RecipesView(HomeAssistantView):
    url = "/api/meal_planner/recipes"
    name = "api:meal_planner:recipes"
    requires_auth = True

    def __init__(self, path):
        self._path = path

    async def get(self, request):
        recipes = await request.app["hass"].async_add_executor_job(_load_json, self._path, [])
        return self.json(recipes)

    async def post(self, request):
        hass = request.app["hass"]
        body = await request.json()
        recipes = await hass.async_add_executor_job(_load_json, self._path, [])
        now = datetime.now().isoformat()
        recipe = {
            "id": str(uuid.uuid4()),
            "name": body.get("name", ""),
            "description": body.get("description", ""),
            "category": body.get("category", "avondeten"),
            "tags": body.get("tags", []),
            "prep_time": body.get("prep_time", 0),
            "cook_time": body.get("cook_time", 0),
            "servings": body.get("servings", 4),
            "difficulty": body.get("difficulty", "medium"),
            "image": body.get("image", None),
            "source_url": body.get("source_url", ""),
            "ingredients": body.get("ingredients", []),
            "steps": body.get("steps", []),
            "created_at": now,
            "last_cooked": None,
            "rating": body.get("rating", 0),
            "favourite": body.get("favourite", False),
        }
        recipes.append(recipe)
        await hass.async_add_executor_job(_save_json, self._path, recipes)
        hass.bus.fire("meal_planner_updated", {})
        return self.json(recipe)


class RecipeDetailView(HomeAssistantView):
    url = "/api/meal_planner/recipes/{recipe_id}"
    name = "api:meal_planner:recipe_detail"
    requires_auth = True

    def __init__(self, path):
        self._path = path

    async def put(self, request, recipe_id):
        hass = request.app["hass"]
        body = await request.json()
        recipes = await hass.async_add_executor_job(_load_json, self._path, [])
        for i, r in enumerate(recipes):
            if r["id"] == recipe_id:
                for field in ("name", "description", "category", "tags", "prep_time",
                              "cook_time", "servings", "difficulty", "image",
                              "source_url", "ingredients", "steps", "last_cooked",
                              "rating", "favourite"):
                    if field in body:
                        recipes[i][field] = body[field]
                await hass.async_add_executor_job(_save_json, self._path, recipes)
                hass.bus.fire("meal_planner_updated", {})
                return self.json(recipes[i])
        return self.json({"error": "not found"}, status_code=404)

    async def delete(self, request, recipe_id):
        hass = request.app["hass"]
        recipes = await hass.async_add_executor_job(_load_json, self._path, [])
        recipes = [r for r in recipes if r["id"] != recipe_id]
        await hass.async_add_executor_job(_save_json, self._path, recipes)
        hass.bus.fire("meal_planner_updated", {})
        return self.json({"ok": True})


class PlanningView(HomeAssistantView):
    url = "/api/meal_planner/planning/{week}"
    name = "api:meal_planner:planning"
    requires_auth = True

    def __init__(self, path):
        self._path = path

    async def get(self, request, week):
        hass = request.app["hass"]
        all_planning = await hass.async_add_executor_job(_load_json, self._path, {})
        week_plan = all_planning.get(week, _empty_week())
        return self.json(week_plan)

    async def put(self, request, week):
        hass = request.app["hass"]
        body = await request.json()
        all_planning = await hass.async_add_executor_job(_load_json, self._path, {})
        all_planning[week] = body
        await hass.async_add_executor_job(_save_json, self._path, all_planning)
        hass.bus.fire("meal_planner_updated", {})
        return self.json(body)


def _empty_week():
    days = {}
    for day in DAYS_NL:
        days[day] = {"breakfast": None, "lunch": None, "dinner": None, "servings": 4}
    return {"days": days}


class ShoppingView(HomeAssistantView):
    url = "/api/meal_planner/shopping/{week}"
    name = "api:meal_planner:shopping"
    requires_auth = True

    def __init__(self, shopping_path, recipes_path, planning_path, fixed_path=None):
        self._shopping_path = shopping_path
        self._recipes_path = recipes_path
        self._planning_path = planning_path
        self._fixed_path = fixed_path

    async def get(self, request, week):
        hass = request.app["hass"]
        all_shopping = await hass.async_add_executor_job(_load_json, self._shopping_path, {})
        return self.json(all_shopping.get(week, {"items": [], "extra_items": []}))

    async def post(self, request, week):
        """Generate shopping list from week planning."""
        hass = request.app["hass"]
        recipes = await hass.async_add_executor_job(_load_json, self._recipes_path, [])
        all_planning = await hass.async_add_executor_job(_load_json, self._planning_path, {})
        all_shopping = await hass.async_add_executor_job(_load_json, self._shopping_path, {})

        week_plan = all_planning.get(week, _empty_week())
        recipes_map = {r["id"]: r for r in recipes}

        # Collect all ingredients
        merged = {}
        for day_data in week_plan.get("days", {}).values():
            servings_factor = day_data.get("servings", 4)
            for meal_type in MEAL_TYPES:
                recipe_id = day_data.get(meal_type)
                if not recipe_id:
                    continue
                recipe = recipes_map.get(recipe_id)
                if not recipe:
                    continue
                base_servings = recipe.get("servings", 4) or 4
                factor = servings_factor / base_servings
                for ing in recipe.get("ingredients", []):
                    key = (ing["name"].lower().strip(), ing.get("unit", ""))
                    if key in merged:
                        merged[key]["amount"] += ing.get("amount", 0) * factor
                    else:
                        merged[key] = {
                            "id": str(uuid.uuid4()),
                            "name": ing["name"],
                            "amount": ing.get("amount", 0) * factor,
                            "unit": ing.get("unit", ""),
                            "shop_category": ing.get("shop_category", "overige"),
                            "checked": False,
                        }

        items = list(merged.values())
        # Round amounts
        for item in items:
            item["amount"] = round(item["amount"], 1)
        # Remove zero-amount items that have no meaning
        items = [i for i in items if i["amount"] > 0 or not i["unit"]]

        # Keep existing extra_items and checked states
        existing = all_shopping.get(week, {})
        existing_checked = {i["name"].lower(): i["checked"] for i in existing.get("items", [])}
        for item in items:
            item["checked"] = existing_checked.get(item["name"].lower(), False)

        shopping = {
            "week": week,
            "generated_at": datetime.now().isoformat(),
            "items": items,
            "extra_items": existing.get("extra_items", []),
        }
        all_shopping[week] = shopping
        await hass.async_add_executor_job(_save_json, self._shopping_path, all_shopping)
        return self.json(shopping)

    async def put(self, request, week):
        hass = request.app["hass"]
        body = await request.json()
        all_shopping = await hass.async_add_executor_job(_load_json, self._shopping_path, {})
        all_shopping[week] = body
        await hass.async_add_executor_job(_save_json, self._shopping_path, all_shopping)
        return self.json(body)


class ShoppingItemView(HomeAssistantView):
    url = "/api/meal_planner/shopping/{week}/item/{item_id}"
    name = "api:meal_planner:shopping_item"
    requires_auth = True

    def __init__(self, shopping_path):
        self._shopping_path = shopping_path

    async def put(self, request, week, item_id):
        hass = request.app["hass"]
        body = await request.json()
        all_shopping = await hass.async_add_executor_job(_load_json, self._shopping_path, {})
        shopping = all_shopping.get(week, {"items": [], "extra_items": []})
        for lst in ("items", "extra_items"):
            for item in shopping.get(lst, []):
                if item["id"] == item_id:
                    item.update(body)
        all_shopping[week] = shopping
        await hass.async_add_executor_job(_save_json, self._shopping_path, all_shopping)
        return self.json({"ok": True})


def _parse_duration(iso_duration):
    """Parse ISO 8601 duration like PT45M or PT1H30M to minutes."""
    if not iso_duration:
        return 0
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?', iso_duration)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    return hours * 60 + minutes


def _parse_ingredient(text):
    """Parse ingredient string like '500 g gehakt' into structured data."""
    text = text.strip()
    units = ['kg','g','ml','l','el','tl','dl','cl','stuks','stuk','snede','sneden','takje','takjes','teen','teentje','teentjes','bosje','blikje','blik','pak','zakje']
    # Try to match: number + optional fraction + unit + name
    pattern = r'^(\d+(?:[.,]\d+)?(?:\s*[-\/]\s*\d+(?:[.,]\d+)?)?)\s*(' + '|'.join(units) + r')\.?\s+(.+)$'
    m = re.match(pattern, text, re.IGNORECASE)
    if m:
        amt_str = m.group(1).replace(',', '.').strip()
        try:
            amount = float(amt_str)
        except:
            amount = 0
        return {"name": m.group(3).strip(), "amount": amount, "unit": m.group(2).lower(), "shop_category": "overige"}
    # Try just number + name
    m2 = re.match(r'^(\d+(?:[.,]\d+)?)\s+(.+)$', text)
    if m2:
        try:
            amount = float(m2.group(1).replace(',', '.'))
        except:
            amount = 0
        return {"name": m2.group(2).strip(), "amount": amount, "unit": "stuk", "shop_category": "overige"}
    return {"name": text, "amount": 0, "unit": "", "shop_category": "overige"}


class ImportRecipeView(HomeAssistantView):
    url = "/api/meal_planner/import_recipe"
    name = "api:meal_planner:import_recipe"
    requires_auth = True

    async def post(self, request):
        import html
        import aiohttp
        hass = request.app["hass"]
        body = await request.json()
        url = body.get("url", "").strip()
        if not url:
            return self.json({"error": "Geen URL opgegeven"})
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "nl-BE,nl;q=0.9,en;q=0.8",
            }
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                    if resp.status != 200:
                        return self.json({"error": f"Pagina niet bereikbaar (HTTP {resp.status})"})
                    raw = await resp.text(errors="replace")
            recipe = self._parse(raw, url, html)
            return self.json(recipe)
        except Exception as e:
            return self.json({"error": str(e)})

    def _parse(self, raw, url, html):

        # Find JSON-LD blocks
        json_ld_blocks = re.findall(r"""<script[^>]+type=["'"]application/ld\+json["'"][^>]*>(.*?)</script>""", raw, re.DOTALL)
        recipe_data = None
        for block in json_ld_blocks:
            try:
                data = json.loads(block.strip())
                # Handle @graph array
                if isinstance(data, dict) and data.get("@graph"):
                    data = data["@graph"]
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and item.get("@type") in ("Recipe", ["Recipe"]):
                            recipe_data = item
                            break
                elif isinstance(data, dict) and data.get("@type") in ("Recipe", ["Recipe"]):
                    recipe_data = data
            except:
                continue

        if not recipe_data:
            raise Exception("Geen recept gevonden op deze pagina. Probeer een directe receptpagina.")

        # Extract image
        image = None
        img_field = recipe_data.get("image")
        if isinstance(img_field, str):
            image = img_field
        elif isinstance(img_field, list) and img_field:
            image = img_field[0] if isinstance(img_field[0], str) else img_field[0].get("url")
        elif isinstance(img_field, dict):
            image = img_field.get("url")

        # Extract ingredients
        raw_ings = recipe_data.get("recipeIngredient", [])
        ingredients = [_parse_ingredient(html.unescape(i)) for i in raw_ings if i.strip()]

        # Extract steps
        raw_steps = recipe_data.get("recipeInstructions", [])
        steps = []
        for s in raw_steps:
            if isinstance(s, str):
                steps.append(s.strip())
            elif isinstance(s, dict):
                text = s.get("text") or s.get("name") or ""
                if text.strip():
                    steps.append(html.unescape(text.strip()))
            elif isinstance(s, list):
                for sub in s:
                    if isinstance(sub, dict):
                        text = sub.get("text") or sub.get("name") or ""
                        if text.strip():
                            steps.append(html.unescape(text.strip()))

        # Times
        prep = _parse_duration(recipe_data.get("prepTime", ""))
        cook = _parse_duration(recipe_data.get("cookTime") or recipe_data.get("totalTime", ""))
        if not prep and not cook:
            total = _parse_duration(recipe_data.get("totalTime", ""))
            cook = total

        name = html.unescape(recipe_data.get("name", "").strip())
        description = html.unescape((recipe_data.get("description") or "").strip())

        return {
            "name": name,
            "description": description[:200] if description else "",
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


class FixedProductsView(HomeAssistantView):
    url = "/api/meal_planner/fixed_products"
    name = "api:meal_planner:fixed_products"
    requires_auth = True

    def __init__(self, path):
        self._path = path

    async def get(self, request):
        hass = request.app["hass"]
        products = await hass.async_add_executor_job(_load_json, self._path, [])
        return self.json(products)

    async def put(self, request):
        hass = request.app["hass"]
        body = await request.json()
        await hass.async_add_executor_job(_save_json, self._path, body)
        return self.json(body)


class TodaysDinnerView(HomeAssistantView):
    url = "/api/meal_planner/today"
    name = "api:meal_planner:today"
    requires_auth = True

    def __init__(self, planning_path, recipes_path):
        self._planning_path = planning_path
        self._recipes_path = recipes_path

    async def get(self, request):
        hass = request.app["hass"]
        now = datetime.now()
        iso = now.isocalendar()
        week = f"{iso[0]}-W{iso[1]:02d}"
        day = DAYS_NL[now.weekday()]
        all_planning = await hass.async_add_executor_job(_load_json, self._planning_path, {})
        recipes = await hass.async_add_executor_job(_load_json, self._recipes_path, [])
        recipes_map = {r["id"]: r for r in recipes}
        week_plan = all_planning.get(week, _empty_week())
        day_data = week_plan.get("days", {}).get(day, {})
        dinner_id = day_data.get("dinner")
        recipe = recipes_map.get(dinner_id) if dinner_id else None
        return self.json({"day": day, "week": week, "recipe": recipe})
