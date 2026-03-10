"""Meal Planner integration for Home Assistant."""
import json
import os
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

    hass.http.register_view(RecipesView(recipes_path))
    hass.http.register_view(RecipeDetailView(recipes_path))
    hass.http.register_view(PlanningView(planning_path))
    hass.http.register_view(ShoppingView(shopping_path, recipes_path, planning_path))
    hass.http.register_view(ShoppingItemView(shopping_path))
    hass.http.register_view(TodaysDinnerView(planning_path, recipes_path))

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
        }
        recipes.append(recipe)
        await hass.async_add_executor_job(_save_json, recipes_path, recipes)
        hass.bus.fire("meal_planner_updated", {})

    hass.services.register(DOMAIN, "add_recipe", handle_add_recipe)
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
                              "source_url", "ingredients", "steps", "last_cooked"):
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

    def __init__(self, shopping_path, recipes_path, planning_path):
        self._shopping_path = shopping_path
        self._recipes_path = recipes_path
        self._planning_path = planning_path

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
