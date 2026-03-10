# 🍽️ Meal Planner for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

Plan your weekly meals, manage recipes, and auto-generate a shopping list — all from your HA dashboard.

---

## ✨ Features

- 📅 **Weekly meal planner** — plan breakfast, lunch & dinner per day
- 📖 **Recipe library** — with photo, ingredients, steps, tags, difficulty
- 🛒 **Auto shopping list** — generated from the week's recipes, grouped by shop category
- 🌙 **Tonight's dinner widget** — always visible on the planner tab
- 🎲 **Random dinner** button — auto-fills the week with random recipes
- 📋 **Copy previous week** — reuse last week's plan
- 👤 **Servings per day** — scales ingredient amounts automatically
- ✅ **Shopping checklist** with progress bar
- ➕ **Extra items** on the shopping list

---

## 📦 Installation via HACS

### Step 1: Add as custom repository

1. Open **HACS** → **Integrations** → **⋮** → **Custom repositories**
2. URL: `https://github.com/YOUR_GITHUB_USERNAME/ha-meal-planner`
3. Category: **Integration**

### Step 2: Install & restart HA

### Step 3: Add to configuration.yaml

```yaml
meal_planner:
```

### Step 4: Add Lovelace resource

**Settings → Dashboards → Resources:**
- URL: `/local/community/ha-meal-planner/meal-planner-card.js`
- Type: JavaScript module

### Step 5: Add card

```yaml
type: custom:meal-planner-card
```

---

## 🗂️ Data Storage

```
/config/meal_planner_recipes.json
/config/meal_planner_planning.json
/config/meal_planner_shopping.json
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meal_planner/recipes` | All recipes |
| POST | `/api/meal_planner/recipes` | Add recipe |
| PUT | `/api/meal_planner/recipes/{id}` | Update recipe |
| DELETE | `/api/meal_planner/recipes/{id}` | Delete recipe |
| GET | `/api/meal_planner/planning/{week}` | Get week planning |
| PUT | `/api/meal_planner/planning/{week}` | Save week planning |
| GET | `/api/meal_planner/shopping/{week}` | Get shopping list |
| POST | `/api/meal_planner/shopping/{week}` | Generate shopping list |
| PUT | `/api/meal_planner/shopping/{week}` | Update shopping list |
| GET | `/api/meal_planner/today` | Tonight's dinner |

---

## 🤖 HA Services

### `meal_planner.add_recipe`
Add a recipe via automation.

### `meal_planner.get_todays_dinner`
Returns tonight's planned recipe — use in automations to announce via TTS.

---

## 📋 Changelog

### v1.0.0
- 🎉 Initial release
- Weekly planner with breakfast/lunch/dinner
- Recipe library with photo, tags, ingredients, steps
- Auto-generated shopping list grouped by category
- Copy previous week & random dinner features

---

## 📄 License

MIT License
