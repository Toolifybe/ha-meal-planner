# 🍽️ Meal Planner for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)

Plan your weekly dinners, manage recipes, and auto-generate a shopping list — all from your HA dashboard.

---

## ✨ Features

- 📅 **Weekly dinner planner** — one meal per day, clean layout with today highlighted
- 📝 **Day notes** — add a note per day (e.g. "guests", "takeaway")
- 📖 **Recipe library** — with photo, ingredients, steps, tags & difficulty
- ⭐ **Star ratings** — rate recipes from 1 to 5 stars
- ❤️ **Favourites** — mark recipes as favourite and filter on them
- 🔀 **Drag & drop ingredients** — reorder ingredients in a recipe
- 📥 **Import via URL** — scrape recipes from Dagelijkse Kost, Njam, and any recipe site with JSON-LD
- 🛒 **Auto shopping list** — generated from the week's recipes, grouped by shop category
- 📌 **Fixed products** — always-needed items you can add to any week's list
- 🌙 **Tonight's dinner widget** — always visible on the planner tab
- 🎲 **Random dinner** button — auto-fills the week with random recipes
- 📋 **Copy previous week** — reuse last week's plan
- 👤 **Servings per day** — scales ingredient amounts automatically
- ✅ **Shopping checklist** with progress bar
- ➕ **Extra items** with amount, unit and shop category
- 🌍 **Fully translatable** — all labels configurable via YAML

---

## 📦 Installation via HACS

### Step 1: Add as custom repository

1. Open **HACS** → **Integrations** → **⋮** → **Custom repositories**
2. URL: `https://github.com/toolifybe/ha-meal-planner`
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

## 🌍 Taal & Labels aanpassen

Alle teksten in de kaart zijn aanpasbaar via de `labels:` configuratie. Zo kan je de app in een andere taal zetten of eigen benamingen gebruiken.

### Voorbeeld — Engels

```yaml
type: custom:meal-planner-card
labels:
  tab_planner: "Week Planner"
  tab_recipes: "Recipes"
  tab_shopping: "Shopping"
  planner_tonight: "🌙 Tonight"
  planner_empty: "+ Choose meal"
  planner_note_empty: "+ add note"
  planner_copy: "📋 Copy previous week"
  planner_random: "🎲 Random"
  recipes_search: "Search recipes..."
  recipes_add: "+ Recipe"
  recipes_import: "📥 Import"
  recipes_all_cats: "All categories"
  recipe_modal_add: "Add recipe"
  recipe_modal_edit: "Edit recipe"
  recipe_name: "Name *"
  recipe_category: "Category"
  recipe_description: "Description"
  recipe_desc_ph: "Short description..."
  recipe_servings: "Servings"
  recipe_prep: "Prep time (min)"
  recipe_cook: "Cook time (min)"
  recipe_difficulty: "Difficulty"
  recipe_source: "Source URL"
  recipe_rating: "Rating"
  recipe_favourite: "❤️ Favourite"
  recipe_tags: "Tags"
  recipe_tags_ph: "Add tag + Enter..."
  recipe_photo: "Photo"
  recipe_photo_ph: "📸 Click or drag a photo"
  recipe_ingredients: "Ingredients"
  recipe_ing_name: "Name"
  recipe_ing_unit: "Unit"
  recipe_add_ing: "+ Ingredient"
  recipe_steps: "Instructions"
  recipe_add_step: "+ Step"
  import_title: "Import recipe"
  import_intro: "Paste a link from any recipe website."
  import_fetch: "Fetch"
  shop_subtab_week: "Week list"
  shop_subtab_fixed: "Fixed products"
  shop_generate: "🛒 Generate shopping list"
  shop_extra_add: "+ Extra item"
  shop_fixed_add: "+ Fixed product"
  shop_fixed_to_week: "Add to week list"
  pick_title: "Choose a meal"
  pick_search: "🔍 Search..."
  btn_save: "Save"
  btn_cancel: "Cancel"
  btn_delete: "Delete"
  diff_easy: "Easy"
  diff_medium: "Medium"
  diff_hard: "Hard"
  days_short: ["Mo","Tu","We","Th","Fr","Sa","Su"]
  days_full: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
  categories: ["breakfast","lunch","dinner","snack","dessert","soup","salad"]
  shop_categories:
    - "fruit & vegetables"
    - "meat & fish"
    - "dairy & eggs"
    - "bread & bakery"
    - "pasta & rice"
    - "canned & sauces"
    - "frozen"
    - "drinks"
    - "snacks & sweets"
    - "other"
```

### Alle beschikbare label-sleutels

| Sleutel | Standaard (NL) |
|---------|---------------|
| `tab_planner` | Weekplanner |
| `tab_recipes` | Recepten |
| `tab_shopping` | Boodschappen |
| `planner_tonight` | 🌙 Vanavond |
| `planner_empty` | + Kies maaltijd |
| `planner_note_empty` | ＋ notitie toevoegen |
| `planner_copy` | 📋 Vorige week kopiëren |
| `planner_random` | 🎲 Willekeurig |
| `recipes_search` | Zoek recept... |
| `recipes_add` | + Recept |
| `recipes_import` | 📥 Importeren |
| `recipes_all_cats` | Alle categorieën |
| `recipe_modal_add` | Recept toevoegen |
| `recipe_modal_edit` | Recept bewerken |
| `recipe_name` | Naam * |
| `recipe_category` | Categorie |
| `recipe_description` | Beschrijving |
| `recipe_desc_ph` | Korte beschrijving... |
| `recipe_servings` | Personen |
| `recipe_prep` | Bereidingstijd (min) |
| `recipe_cook` | Kooktijd (min) |
| `recipe_difficulty` | Moeilijkheid |
| `recipe_source` | Bron URL |
| `recipe_rating` | Beoordeling |
| `recipe_favourite` | ❤️ Favoriet |
| `recipe_tags` | Tags |
| `recipe_tags_ph` | Tag toevoegen + Enter... |
| `recipe_photo` | Foto |
| `recipe_photo_ph` | 📸 Klik of sleep een foto |
| `recipe_ingredients` | Ingrediënten |
| `recipe_ing_name` | Naam |
| `recipe_ing_unit` | Eenheid |
| `recipe_add_ing` | + Ingrediënt |
| `recipe_steps` | Bereiding |
| `recipe_add_step` | + Stap |
| `import_title` | Recept importeren |
| `import_intro` | Plak een link van... |
| `import_fetch` | Ophalen |
| `shop_subtab_week` | Weeklijst |
| `shop_subtab_fixed` | Vaste producten |
| `shop_generate` | 🛒 Genereer boodschappenlijst |
| `shop_extra_add` | + Extra item |
| `shop_fixed_add` | + Vast product |
| `shop_fixed_to_week` | Toevoegen aan weeklijst |
| `pick_title` | Maaltijd kiezen |
| `pick_search` | 🔍 Zoeken... |
| `btn_save` | Opslaan |
| `btn_cancel` | Annuleren |
| `btn_delete` | Verwijderen |
| `diff_easy` | Makkelijk |
| `diff_medium` | Gemiddeld |
| `diff_hard` | Moeilijk |
| `days_short` | ["Ma","Di","Wo",...] |
| `days_full` | ["Maandag","Dinsdag",...] |
| `categories` | ["ontbijt","lunch",...] |
| `shop_categories` | ["groenten & fruit",...] |

---

## 📋 Changelog

### v1.5.0
- 🌍 Alle teksten configureerbaar via `labels:` in de kaartconfiguratie
- Volledige vertaling mogelijk naar elke taal
- README bijgewerkt met volledige labelreferentie en Engels voorbeeld

### v1.4.0
- 🐛 Ingrediënten sub-velden niet langer uitgerekt naar volledige breedte

### v1.3.9
- 🎨 Compacte 2-lijn layout voor ingrediënten (naam bovenaan, details eronder)

### v1.3.6
- 🔀 Drag & drop herordening van ingrediënten in recepten

### v1.3.5
- 🐛 Ontbrekende `re` import hersteld in backend (URL import kapot)

### v1.3.4
- 🐛 `urllib` vervangen door `aiohttp` voor URL import (werkt nu in HA)

### v1.3.3
- 🐛 Klikken op actieve ster wist nu de beoordeling (terug naar 0)

### v1.3.2
- 🐛 `rating` en `favourite` velden toegevoegd aan backend whitelist

### v1.3.1
- 🐛 Sterren rating bijgehouden in instantie-variabele i.p.v. DOM-selector

### v1.3.0
- ⭐ Recepten beoordelen met 1–5 sterren
- ❤️ Favorieten markeren + filter op favorieten
- 📝 Notitie per dag in de weekplanner (bv. "gasten", "takeaway")

### v1.2.0
- 📥 Recepten importeren via URL (JSON-LD scraping)

### v1.1.7
- 🗑️ Verwijderknop op extra items in weeklijst

### v1.1.6
- 🐛 Vaste producten correct opgeslagen en weergegeven

### v1.1.5
- 🗑️ Directe verwijderknop per vast product

### v1.1.4
- 🐛 Modalmode via instantie-variabele i.p.v. dataset

### v1.1.3
- 📌 Vaste producten met checkboxes en "Toevoegen aan weeklijst" knop

### v1.1.2
- 🐛 Race condition opgelost bij laden planner

### v1.1.1
- 📱 Verwijderknop altijd zichtbaar op touchscreen

### v1.1.0
- 📅 Weekplanner 2-kolom layout
- 📌 Vaste producten tab
- 👤 Aantal personen instelbaar per dag

### v1.0.0
- 🎉 Eerste release
