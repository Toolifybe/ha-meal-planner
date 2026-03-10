# 🍽️ Meal Planner for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)

Plan your weekly meals, manage recipes, and auto-generate a shopping list — all from your HA dashboard.

---

## ✨ Features

- 📅 **Weekly meal planner** — plan breakfast, lunch & dinner per day
- 📖 **Recipe library** — with photo, ingredients, steps, tags & difficulty
- 🛒 **Auto shopping list** — generated from the week's recipes, grouped by shop category
- 🌙 **Tonight's dinner widget** — always visible on the planner tab
- 🎲 **Random dinner** button — auto-fills the week with random recipes
- 📋 **Copy previous week** — reuse last week's plan
- 👤 **Servings per day** — scales ingredient amounts automatically
- ✅ **Shopping checklist** with progress bar
- ➕ **Extra items** with amount, unit and shop category

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

## 🗂️ Directory Structure

```
ha-meal-planner/
├── hacs.json
├── README.md
├── LICENSE
└── custom_components/
    └── meal_planner/
        ├── __init__.py
        ├── manifest.json
        ├── services.yaml
        ├── strings.json
        └── frontend/
            └── meal-planner-card.js
```

---

## 💾 Data Storage

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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Name of the recipe |
| `description` | string | ❌ | Short description |

---

## 📋 Changelog

### v1.0.3
- 🎨 Styled week action buttons (copy & random)

### v1.0.2
- ➕ Extra shopping items now have amount, unit and category
- ✏️ Existing extra items can be edited or deleted

### v1.0.1
- 🎨 Improved week planner styling
- 🔵 Today highlighted with color accent instead of filled block
- 📍 Meal type row labels moved to left side of grid

### v1.0.0
- 🎉 Initial release
- Weekly planner with breakfast/lunch/dinner
- Recipe library with photo, tags, ingredients, steps
- Auto-generated shopping list grouped by category
- Copy previous week & random dinner features
- Tonight's dinner widget

---

## 📄 License

MIT License
