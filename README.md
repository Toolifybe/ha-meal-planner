# 🍽️ Meal Planner for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)

Plan your weekly dinners, manage recipes, and auto-generate a shopping list — all from your HA dashboard.

---

## ✨ Features

- 📅 **Weekly dinner planner** — one warm meal per day, clean 2-column layout
- 📝 **Day notes** — add a note per day (e.g. "guests", "takeaway")
- 📖 **Recipe library** — with photo, ingredients, steps, tags & difficulty
- ⭐ **Star ratings** — rate recipes from 1 to 5 stars
- ❤️ **Favourites** — mark recipes as favourite and filter on them
- 📥 **Import via URL** — import recipes from Dagelijkse Kost, Njam, and any other recipe site
- 🛒 **Auto shopping list** — generated from the week's recipes, grouped by shop category
- 📌 **Fixed products** — always-needed items (bread, milk, ...) you can add to any week's list
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
/config/meal_planner_fixed_products.json
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
| GET | `/api/meal_planner/fixed_products` | Get fixed products |
| PUT | `/api/meal_planner/fixed_products` | Save fixed products |
| POST | `/api/meal_planner/import_recipe` | Import recipe from URL |

---

## 🤖 HA Services

### `meal_planner.add_recipe`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Name of the recipe |
| `description` | string | ❌ | Short description |

---

## 📋 Changelog

### v1.3.0
- ⭐ Recepten beoordelen met 1-5 sterren
- ❤️ Favorieten markeren + filter op favorieten
- 📝 Notitie per dag in de weekplanner (bv. "gasten", "takeaway")
- Favorieten en best beoordeelde recepten komen bovenaan

### v1.2.0
- 📥 Recepten importeren via URL (JSON-LD scraping)
- Werkt met Dagelijkse Kost, Njam, en elke andere receptensite

### v1.1.7
- 🗑️ Verwijderknop op extra items in weeklijst

### v1.1.6
- 🐛 Vaste producten worden nu correct opgeslagen en weergegeven

### v1.1.5
- 🗑️ Directe verwijderknop per vast product

### v1.1.4
- 🐛 Modalmode bijgehouden via instantie-variabele in plaats van dataset

### v1.1.3
- 📌 Vaste producten met checkboxes en "Toevoegen aan weeklijst" knop
- Auto-merge bij generatie verwijderd — je kiest nu zelf wat je toevoegt

### v1.1.2
- 🐛 Race condition opgelost: recepten worden eerst geladen voor de planner rendert

### v1.1.1
- 📱 Verwijderknop altijd zichtbaar op touchscreen

### v1.1.0
- 📅 Weekplanner toont enkel avondeten in 2-kolom layout
- 📌 Vaste producten tab in boodschappen
- 👤 Aantal personen instelbaar per dag

### v1.0.x
- Diverse bugfixes en styling verbeteringen

### v1.0.0
- 🎉 Eerste release
