# 🍽️ Meal Planner for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)

Plan your weekly dinners, manage recipes, and auto-generate a shopping list — all from your HA dashboard.

---

## ✨ Features

- 📅 **Weekly dinner planner** — one meal per day, clean layout with today highlighted
- ⚡ **Quick add** — type a meal that doesn't exist yet in the picker and plan it right away
- 📝 **Day notes** — add a note per day (e.g. "guests", "takeaway")
- 📖 **Recipe library** — with photo, ingredients, steps, tags & difficulty
- ⭐ **Star ratings** — rate recipes from 1 to 5 stars
- ❤️ **Favourites** — mark recipes as favourite and filter on them
- 🔀 **Drag & drop ingredients** — reorder ingredients in a recipe
- 📥 **Import via URL** — scrape recipes from any site with JSON-LD (e.g. Dagelijkse Kost, Njam)
- 🛒 **Auto shopping list** — generated from the week's recipes, grouped by shop category
- 📌 **Fixed products** — always-needed items you can add to any week's list
- 🌙 **Tonight in the header** — tonight's dinner (or no-cook night) always visible
- 🎲 **Random dinner** button — fills the empty days with random recipes, no duplicates
- 📋 **Copy previous week** — reuse last week's plan (asks before overwriting)
- 👤 **Servings per day** — scales ingredient amounts automatically
- ✅ **Shopping checklist** with progress bar
- ➕ **Extra items** with amount, unit and shop category
- 🍴 **No-cook nights** — quickly plan Restaurant, Takeaway, Bij familie or Restjes without a recipe
- 🔒 **Readonly mode** — show only the week planner, nothing editable (configurable per dashboard/user)
- 🌍 **Fully translatable** — all labels configurable via YAML
- 🗑️ **Remove generated shopping items** — delete items you already have at home
- 🔄 **Live on every device** — planning, shopping list and ticks update instantly, also for non-admin users
- 🍽️ **Last eaten** — per recipe, based on the days that have passed
- 🎨 **Home Assistant look** — follows your theme (light and dark) and primary color, Material Design icons
- ⚙️ **Visual editor** — title, default persons, random category, readonly
- 🛡️ **Safe storage** — atomic writes with a `.bak` backup

---

## 📦 Installation via HACS

### Step 1: Add as custom repository

1. Open **HACS** → **Integrations** → **⋮** → **Custom repositories**
2. URL: `https://github.com/Toolifybe/ha-meal-planner`
3. Category: **Integration**

### Step 2: Install & restart HA

### Step 3: Add to configuration.yaml

```yaml
meal_planner:
```

### Step 4: Add card

```yaml
type: custom:meal-planner-card
```

The integration adds the card as a dashboard resource itself (since v2.0.1):
`/meal_planner/meal-planner-card.js?v=…`. The version in the link changes with every
update, so the browser always gets the new file. If you added
`/local/community/ha-meal-planner/meal-planner-card.js` by hand earlier, remove it under
**Settings → Dashboards → ⋮ → Resources**. Dashboards in YAML mode: add
`/meal_planner/meal-planner-card.js` as a JavaScript module yourself.

### Card options

| Option | Default | Description |
|--------|---------|-------------|
| `title` | Maaltijdplanner | Title in the header |
| `default_servings` | 4 | Persons filled in when you put a recipe on an empty day |
| `dinner_category` | 3rd category (`avondeten`) | Category used by "Random" |
| `readonly` | `false` | Only show the week planner, no editing |
| `labels` | — | Translate or rename texts (see below) |

All options except `labels` can also be set in the visual card editor.

The card follows your Home Assistant theme (light and dark) and uses the
theme's primary color.

---

## 🔒 Readonly Mode

Set `readonly: true` to show only the week planner without any editing options. Ideal for a family member's dashboard who should only see what's planned.

```yaml
type: custom:meal-planner-card
readonly: true
```

In readonly mode:
- Only the **week planner** tab is visible
- No add, edit or delete buttons
- Meals cannot be changed or removed
- Notes cannot be edited
- Navigation between weeks still works

Combine with HA's per-user dashboards (**Settings → Dashboards**) to give different users different levels of access.

---

## 🗂️ Directory Structure

```
ha-meal-planner/
├── .github/workflows/release.yml   ← GitHub release per tag (HACS updates)
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

Files are written safely (temporary file first). The previous version is kept as
`*.json.bak`. If a file is ever damaged, it is copied to `*.json.corrupt-<date>`, the
`.bak` is used, and nothing gets overwritten.

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
| PUT | `/api/meal_planner/shopping/{week}` | Replace shopping list |
| POST | `/api/meal_planner/shopping/{week}/items` | Add extra items |
| PUT | `/api/meal_planner/shopping/{week}/item/{id}` | Update one item (e.g. tick off) |
| DELETE | `/api/meal_planner/shopping/{week}/item/{id}` | Remove one item |
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

### `meal_planner.get_todays_dinner`

Returns tonight's dinner as a response (`recipe`, `nocook`, `note`, `day`, `date`, `week`).

```yaml
action: meal_planner.get_todays_dinner
response_variable: dinner
```

Live updates use the websocket command `meal_planner/subscribe`, which works for
all users (also non-admin readonly dashboards).

---

## 🌍 Translating Labels

All text in the card can be customised via the `labels:` config key. This lets you translate the app into any language or use your own terminology.

> **Note:** `labels` replaces values — it does not merge with defaults. For list fields like `shop_categories`, you must supply the full list including any existing entries you want to keep.

### Example — English

```yaml
type: custom:meal-planner-card
labels:
  tab_planner: "Week Planner"
  tab_recipes: "Recipes"
  tab_shopping: "Shopping"
  planner_tonight: "Tonight"
  planner_empty: "Choose meal"
  planner_note_empty: "add note"
  planner_copy: "Copy previous week"
  planner_random: "Random"
  recipes_search: "Search recipes..."
  recipes_add: "Recipe"
  recipes_import: "Import"
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
  recipe_favourite: "Favourite"
  recipe_tags: "Tags"
  recipe_tags_ph: "Add tag + Enter..."
  recipe_photo: "Photo"
  recipe_photo_ph: "Click or drag a photo"
  recipe_ingredients: "Ingredients"
  recipe_ing_name: "Name"
  recipe_ing_unit: "Unit"
  recipe_add_ing: "Ingredient"
  recipe_steps: "Instructions"
  recipe_add_step: "Step"
  import_title: "Import recipe"
  import_intro: "Paste a link from any recipe website."
  import_fetch: "Fetch"
  shop_subtab_week: "Week list"
  shop_subtab_fixed: "Fixed products"
  shop_generate: "Generate shopping list"
  shop_extra_add: "Extra item"
  shop_fixed_add: "Fixed product"
  shop_fixed_to_week: "Add to week list"
  pick_title: "Choose a meal"
  pick_search: "Search..."
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
  nocook_title: "No cooking tonight"
  nocook_options: ["🍴 Restaurant", "🥡 Takeaway", "👨‍👩‍👧 Family", "🛋️ Leftovers"]
```

### All available label keys

| Key | Default (Dutch) |
|-----|----------------|
| `tab_planner` | Weekplanner |
| `tab_recipes` | Recepten |
| `tab_shopping` | Boodschappen |
| `title` | Maaltijdplanner |
| `planner_tonight` | Vanavond |
| `tonight_empty` | Nog niets gepland voor vanavond |
| `planner_empty` | + Kies maaltijd |
| `planner_note_empty` | Notitie toevoegen |
| `planner_copy` | Vorige week kopiëren |
| `planner_random` | Willekeurig |
| `recipes_search` | Zoek recept... |
| `recipes_add` | Recept |
| `recipes_import` | Importeren |
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
| `recipe_favourite` | Favoriet |
| `recipe_tags` | Tags |
| `recipe_tags_ph` | Tag toevoegen + Enter... |
| `recipe_photo` | Foto |
| `recipe_photo_ph` | Klik of sleep een foto |
| `recipe_ingredients` | Ingrediënten |
| `recipe_ing_name` | Naam |
| `recipe_ing_unit` | Eenheid |
| `recipe_add_ing` | Ingrediënt |
| `recipe_steps` | Bereiding |
| `recipe_add_step` | Stap |
| `import_title` | Recept importeren |
| `import_intro` | Plak een link van... |
| `import_fetch` | Ophalen |
| `shop_subtab_week` | Weeklijst |
| `shop_subtab_fixed` | Vaste producten |
| `shop_generate` | Lijst maken |
| `shop_extra_add` | Extra item |
| `shop_fixed_add` | Vast product |
| `shop_fixed_to_week` | Toevoegen aan weeklijst |
| `pick_title` | Maaltijd kiezen |
| `pick_search` | Zoek of typ een nieuw gerecht... |
| `pick_new` | "{name}" inplannen |
| `pick_new_sub` | Nieuw gerecht · vul het later aan bij Recepten |
| `btn_save` | Opslaan |
| `btn_cancel` | Annuleren |
| `btn_delete` | Verwijderen |
| `btn_edit` | Bewerken |
| `btn_close` | Sluiten |
| `week` | Week |
| `last_cooked` | Laatst gegeten |
| `diff_easy` | Makkelijk |
| `diff_medium` | Gemiddeld |
| `diff_hard` | Moeilijk |
| `days_short` | ["Ma","Di","Wo",...] |
| `days_full` | ["Maandag","Dinsdag",...] |
| `categories` | ["ontbijt","lunch",...] |
| `shop_categories` | ["groenten & fruit",...] |

---

## 📋 Changelog

### v2.1.0
- ⚡ Quick add: type a meal in "Choose a meal" that doesn't exist yet and plan it right away ("Spaghetti" inplannen, or press Enter). A minimal recipe is created that you can complete later under Recipes.
- Labels `pick_new` and `pick_new_sub`

### v2.0.1
- 🐛 The card was fetched but not started on recent Home Assistant versions (e.g. in Firefox): "Custom element doesn't exist". The integration now adds it as a normal dashboard resource (with version in the link) instead.

### v2.0.0
- 🎨 New look in Home Assistant style: follows your theme (light **and dark**), header with "Tonight", segmented tabs, Material Design icons instead of emoji, flat rows like the Home Energy Flow Card
- 📅 Week planner: compact day column, today highlighted, notes inside the day row
- 🛒 Shopping list: progress "x of y", categories in shop order, tap the whole row to tick off
- 🖼️ Photos are shrunk to max 1024 px when uploading (and old large photos when you save the recipe); drag & drop a photo
- 🍽️ "Last eaten" now comes from the planning (only days that have passed), no longer set when you plan
- 🎲 "Random" uses the dinner category from your labels (or `dinner_category`), not a hard-coded "avondeten"
- ⚙️ Visual editor: title, default persons (now really used), random category, readonly
- 🔌 The integration loads the card itself, with a version in the URL: no manual resource and no old cached file after an update. Remove an old manual resource if you had one.
- 🧹 Correct links in manifest and `hacs.json`, version numbers aligned
- 🐛 Recipe detail can be closed in readonly mode; clicking next to a dialog closes it; confirm before deleting a fixed product

### v1.9.1
- 🛡️ Data files are written safely with a `.bak` backup; a damaged file is never treated as empty anymore (could wipe all recipes)
- 🛡️ Imported recipes can no longer inject code into the dashboard (all text is escaped, only http(s) links)
- ⚠️ "Copy previous week" no longer wipes the current week when the previous week is empty, and asks before overwriting
- 🎲 "Random" only fills empty days (asks before replacing a fully planned week) and avoids duplicates
- ⚠️ Deleting a recipe asks for confirmation (and says how often it is planned)
- 🐛 `meal_planner.add_recipe` no longer crashes; `meal_planner.get_todays_dinner` now works (returns a response)
- 🔄 Shopping list, fixed products and ticking off are now live on all devices, and two phones ticking off at once no longer overwrite each other
- 🔄 Live updates also work for non-admin users (readonly dashboards)
- 🌙 "Tonight" uses Home Assistant's time zone, shows no-cook nights, and refreshes after midnight
- 🐛 Adding an extra item after editing a fixed product no longer reuses the product's id; edit title fixed
- 📥 Import: units like "gram", "eetlepels", "snuifje", fractions (½, 1/2), ranges (2-3), recipes with sections and multi-type JSON-LD
- 🛒 Ingredients without a usable amount stay on the shopping list; items you removed stay removed when regenerating; ticks are kept
- ⚠️ Requires Home Assistant 2023.7 or newer

### v1.9.0
- 🍴 No-cook night options in the meal picker (Restaurant, Takeaway, Bij familie, Restjes)
- Fully translatable via `nocook_options` label
- No-cook label shown in planner with remove button

### v1.8.0
- 🔒 Readonly mode (`readonly: true`) — only shows the week planner, all editing disabled
- Ideal for restricting access per user via separate HA dashboards

### v1.7.4
- 🎛️ Visual card editor — configure default servings via the HA dashboard UI

### v1.7.3
- 🐛 Favourites filter button changed from ⭐ to ❤️ to match recipe cards

### v1.7.2
- 🐛 Long recipe titles now wrap over multiple lines instead of being cut off
- 🐛 Remove button (×) repositioned to top-right corner, always visible

### v1.7.1
- 🐛 Remove button (×) always visible on mobile, long recipe titles no longer push it off screen

### v1.7.0
- 🎨 Consistent blue color palette — all grey tones replaced with blue tones throughout the UI

### v1.6.0
- 🗑️ Delete button on generated shopping list items (remove items you already have at home)
- 🐛 Fixed ingredient shop category dropdown crash in recipe modal

### v1.5.1
- 🐛 Fixed recipe edit button not responding due to JS crash in ingredient row

### v1.5.0
- 🌍 All labels configurable via `labels:` in card config
- Full translation support for any language
- README rewritten in English

### v1.4.0
- 🐛 Ingredient sub-fields no longer stretched to full width

### v1.3.9
- 🎨 Compact 2-line ingredient layout (name on top, details below)

### v1.3.6
- 🔀 Drag & drop reordering of ingredients

### v1.3.5
- 🐛 Missing `re` import restored in backend (broke URL import)

### v1.3.4
- 🐛 Replaced `urllib` with `aiohttp` for URL import

### v1.3.3
- 🐛 Clicking an active star now clears the rating to 0

### v1.3.2
- 🐛 Added `rating` and `favourite` fields to backend save whitelist

### v1.3.1
- 🐛 Star rating stored in instance variable instead of unreliable DOM selector

### v1.3.0
- ⭐ Rate recipes with 1–5 stars
- ❤️ Mark recipes as favourite + filter on them
- 📝 Day notes in the week planner (e.g. "guests", "takeaway")

### v1.2.0
- 📥 Import recipes from URL via JSON-LD scraping

### v1.1.7
- 🗑️ Delete button on extra shopping items

### v1.1.6
- 🐛 Fixed products now save and render correctly

### v1.1.5
- 🗑️ Direct delete button per fixed product row

### v1.1.4
- 🐛 Modal mode tracked via instance variable instead of dataset

### v1.1.3
- 📌 Fixed products with checkboxes and manual add-to-week button

### v1.1.2
- 🐛 Race condition fixed: recipes load before planner renders

### v1.1.1
- 📱 Remove button always visible on touch devices

### v1.1.0
- 📅 Single dinner planner with 2-column layout
- 📌 Fixed products tab in shopping
- 👤 Configurable servings per day

### v1.0.0
- 🎉 Initial release
