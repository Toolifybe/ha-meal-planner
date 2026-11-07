/**
 * Meal Planner Card for Home Assistant
 * v2.1.0
 */

const MP_VERSION = "2.1.0";


const DEFAULT_LABELS = {
  title:              "Maaltijdplanner",
  tonight_empty:      "Nog niets gepland voor vanavond",
  week:               "Week",
  checked_of:         "{done} van {total}",
  btn_edit:           "Bewerken",
  btn_close:          "Sluiten",
  last_cooked:        "Laatst gegeten",
  original_recipe:    "Origineel recept",

  // Tabs
  tab_planner:        "Weekplanner",
  tab_recipes:        "Recepten",
  tab_shopping:       "Boodschappen",

  // Planner
  planner_tonight:    "Vanavond",
  planner_empty:      "+ Kies maaltijd",
  planner_note_empty: "Notitie toevoegen",
  planner_copy:       "Vorige week kopiëren",
  planner_random:     "Willekeurig",

  // Recipes
  recipes_search:     "Zoek recept...",
  recipes_add:        "Recept",
  recipes_import:     "Importeren",
  recipes_all_cats:   "Alle categorieën",
  recipes_empty:      "Geen recepten gevonden.",
  recipes_empty_sub:  "Klik op Recept om te beginnen.",

  // Recipe modal
  recipe_modal_add:   "Recept toevoegen",
  recipe_modal_edit:  "Recept bewerken",
  recipe_name:        "Naam *",
  recipe_category:    "Categorie",
  recipe_description: "Beschrijving",
  recipe_desc_ph:     "Korte beschrijving...",
  recipe_servings:    "Personen",
  recipe_prep:        "Bereidingstijd (min)",
  recipe_cook:        "Kooktijd (min)",
  recipe_difficulty:  "Moeilijkheid",
  recipe_source:      "Bron URL",
  recipe_rating:      "Beoordeling",
  recipe_favourite:   "Favoriet",
  recipe_tags:        "Tags",
  recipe_tags_ph:     "Tag toevoegen + Enter...",
  recipe_photo:       "Foto",
  recipe_photo_ph:    "Klik of sleep een foto",
  recipe_ingredients: "Ingrediënten",
  recipe_ing_name:    "Naam",
  recipe_ing_amount:  "Hoeveelheid",
  recipe_ing_unit:    "Eenheid",
  recipe_ing_cat:     "Winkelcategorie",
  recipe_add_ing:     "Ingrediënt",
  recipe_steps:       "Bereiding",
  recipe_add_step:    "Stap",

  // Import modal
  import_title:       "Recept importeren",
  import_intro:       "Plak een link van Dagelijkse Kost, Njam, of een andere receptensite.",
  import_url_label:   "URL",
  import_fetch:       "Ophalen",

  // Shopping
  shop_subtab_week:   "Weeklijst",
  shop_subtab_fixed:  "Vaste producten",
  shop_generate:      "Lijst maken",
  shop_empty:         "Nog geen boodschappenlijst.",
  shop_empty_sub:     "Klik op Lijst maken om te starten.",
  shop_extra_add:     "Extra item",
  shop_fixed_add:     "Vast product",
  shop_fixed_to_week: "Toevoegen aan weeklijst",
  shop_fixed_empty:   "Nog geen vaste producten.",
  shop_fixed_empty_sub: "Voeg producten toe die je altijd nodig hebt.",
  extra_edit:         "Item bewerken",
  fixed_add_title:    "Vast product toevoegen",
  fixed_edit_title:   "Vast product bewerken",

  // Confirmations
  confirm_delete_recipe:  "Recept \"{name}\" verwijderen?",
  confirm_delete_fixed:   "Vast product \"{name}\" verwijderen?",
  confirm_delete_planned: "Het staat nog {n}x ingepland; die dagen worden leeg.",
  confirm_copy_overwrite: "Deze week is al (deels) ingevuld. Overschrijven met de vorige week?",
  info_copy_empty:        "De vorige week is leeg, er is niets om te kopiëren.",
  confirm_random_all:     "Alle dagen zijn al ingepland. Een volledig nieuwe willekeurige week maken?",
  error_save:             "Opslaan mislukt",
  error_load:             "Laden mislukt",

  // Pick modal
  pick_title:         "Maaltijd kiezen",
  pick_search:        "Zoek of typ een nieuw gerecht...",
  pick_new:           "\"{name}\" inplannen",
  pick_new_sub:       "Nieuw gerecht · vul het later aan bij Recepten",

  // No-cook options
  nocook_title:       "Geen kookavond",
  nocook_options:     ["🍴 Restaurant", "🥡 Takeaway", "👨‍👩‍👧 Bij familie", "🛋️ Restjes"],

  // General buttons
  btn_save:           "Opslaan",
  btn_cancel:         "Annuleren",
  btn_delete:         "Verwijderen",

  // Difficulties
  diff_easy:          "Makkelijk",
  diff_medium:        "Gemiddeld",
  diff_hard:          "Moeilijk",

  // Days
  days_short:         ["Ma","Di","Wo","Do","Vr","Za","Zo"],
  days_full:          ["Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag","Zondag"],

  // Categories
  categories:         ["ontbijt","lunch","avondeten","snack","dessert","soep","salade"],
  shop_categories:    [
    "groenten & fruit","vlees & vis","zuivel & eieren","brood & bakkerij",
    "pasta & rijst","conserven & sauzen","diepvries","dranken","snoep & koek","overige"
  ],
};
const DAYS_NL = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
// DAYS_LABEL now from this._labels.days_short
// DAYS_FULL now from this._labels.days_full
const MEAL_TYPES = ["breakfast","lunch","dinner"];
// Only dinner shown in planner
const PLANNER_MEAL = "dinner";
// DIFFICULTIES now from this._labels.diff_*
// CATEGORIES now from this._labels.categories
// SHOP_CATEGORIES now from this._labels.shop_categories

function getWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getWeekDates(weekKey) {
  const [year, w] = weekKey.split("-W");
  const simple = new Date(parseInt(year), 0, 1 + (parseInt(w) - 1) * 7);
  const dow = simple.getDay();
  const monday = new Date(simple);
  monday.setDate(simple.getDate() - (dow <= 4 ? dow - 1 : dow - 8));
  return DAYS_NL.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function prevWeek(weekKey) {
  const dates = getWeekDates(weekKey);
  const prev = new Date(dates[0]);
  prev.setDate(prev.getDate() - 7);
  return getWeekKey(prev);
}

function nextWeek(weekKey) {
  const dates = getWeekDates(weekKey);
  const next = new Date(dates[0]);
  next.setDate(next.getDate() + 7);
  return getWeekKey(next);
}

// Material Design icon, rendered by Home Assistant
const ic = name => `<ha-icon icon="mdi:${name}"></ha-icon>`;

// Everything that comes from recipes, imports or users goes through esc()
// before it lands in innerHTML, so a recipe site cannot inject code.
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

// Only web links (no javascript: etc.)
function safeUrl(url) {
  const u = String(url ?? "").trim();
  return /^https?:\/\//i.test(u) ? u : "";
}

// Images: web links, uploaded photos (data:image) or local paths
function safeImg(url) {
  const u = String(url ?? "").trim();
  return /^(https?:\/\/|data:image\/|\/(?!\/))/i.test(u) ? u : "";
}

// Photos are stored inside the recipe file, so keep them small:
// max 1024 px on the longest side, JPEG.
function shrinkImage(file, max = 1024, quality = 0.82) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        if (scale === 1 && file.size < 300000) { resolve(reader.result); return; }
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(reader.result);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Older recipes can hold multi-MB photos; shrink them when the recipe is saved.
function shrinkDataUrl(url, max = 1024, quality = 0.82) {
  if (!/^data:image\//.test(url || "") || url.length < 400000) return Promise.resolve(url);
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const out = c.toDataURL("image/jpeg", quality);
      resolve(out.length < url.length ? out : url);
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

function weekHasContent(plan) {
  return Object.values(plan?.days || {}).some(d => d && (d.dinner || d.nocook || d.note));
}

const STYLES = `
  :host {
    display:block;
    --mp-txt:  var(--primary-text-color, #1f1f1f);
    --mp-sub:  var(--secondary-text-color, #6b6b6b);
    --mp-off:  var(--disabled-text-color, #bdbdbd);
    --mp-line: var(--divider-color, #e0e0e0);
    --mp-bg:   var(--ha-card-background, var(--card-background-color, #fff));
    --mp-acc:  var(--primary-color, #03a9f4);
    --mp-red:  var(--error-color, #db4437);
    --mp-tile: color-mix(in srgb, var(--mp-txt) 5%, transparent);
    --mp-tile2: color-mix(in srgb, var(--mp-txt) 9%, transparent);
    --mp-accbg: color-mix(in srgb, var(--mp-acc) 13%, transparent);
    --mdc-icon-size: 18px;
  }
  ha-card {
    padding:0; overflow:hidden; color:var(--mp-txt);
    background:var(--mp-bg);
    border-radius:var(--ha-card-border-radius, 12px);
    border:var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--mp-line));
  }
  button { font-family:inherit; color:inherit; }
  ha-icon { display:inline-flex; flex:none; }

  /* ===== HEADER ===== */
  .kop { display:flex; align-items:center; gap:12px; padding:14px 16px; }
  .chip { flex:none; width:36px; height:36px; border-radius:10px; display:grid; place-items:center;
          background:var(--mp-accbg); color:var(--mp-acc); --mdc-icon-size:20px; }
  .kop-txt { min-width:0; flex:1; }
  .kop h2 { margin:0; font-size:16px; font-weight:700; line-height:1.25; }
  .kop p { margin:1px 0 0; font-size:12px; line-height:1.35; color:var(--mp-sub);
           white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .kop p b { color:var(--mp-txt); font-weight:600; }
  .pil { flex:none; font-size:11px; font-weight:600; padding:3px 10px; border-radius:999px; background:var(--mp-tile); color:var(--mp-sub); }

  /* Tabs = segmented control */
  .tabs { display:flex; gap:2px; margin:0 16px 4px; padding:3px; border-radius:10px; background:var(--mp-tile); }
  .tab { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:7px 6px; border:none; border-radius:8px;
         background:none; color:var(--mp-sub); font-size:13px; font-weight:600; cursor:pointer; transition:background .15s, color .15s; --mdc-icon-size:16px; }
  .tab:hover { color:var(--mp-txt); }
  .tab.active { background:var(--mp-bg); color:var(--mp-txt); box-shadow:0 1px 2px rgba(0,0,0,.12); }

  .tab-content { display:none; padding:12px 16px 16px; }
  .tab-content.active { display:block; }

  /* Generic icon button */
  .icon-btn { display:inline-grid; place-items:center; width:32px; height:32px; flex:none; padding:0; border:none; border-radius:8px;
              background:none; color:var(--mp-sub); cursor:pointer; transition:background .15s, color .15s; }
  .icon-btn:hover { background:var(--mp-tile); color:var(--mp-txt); }
  .icon-btn.danger:hover { color:var(--mp-red); }
  .icon-btn.sm { width:28px; height:28px; --mdc-icon-size:16px; }

  /* ===== WEEK PLANNER ===== */
  .week-nav { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px; }
  .week-label { font-weight:600; font-size:14px; text-align:center; }
  .week-label small { display:block; font-weight:400; font-size:11px; color:var(--mp-sub); }
  .week-grid { display:flex; flex-direction:column; gap:6px; }
  .planner-row { display:flex; align-items:stretch; border-radius:10px; background:var(--mp-tile); overflow:hidden; }
  .planner-row.today { background:var(--mp-accbg); box-shadow:inset 3px 0 0 var(--mp-acc); }
  .planner-day-label { flex:none; width:46px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:8px 0 8px 6px; }
  .planner-day-name { font-size:11px; font-weight:600; color:var(--mp-sub); text-transform:uppercase; letter-spacing:.4px; }
  .planner-day-date { font-size:18px; font-weight:700; line-height:1.15; }
  .planner-row.today .planner-day-name, .planner-row.today .planner-day-date { color:var(--mp-acc); }
  .planner-main { flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; }
  .planner-meal-slot { display:flex; align-items:center; gap:10px; cursor:pointer; padding:8px 8px 8px 6px; min-height:44px; border-radius:8px; position:relative; }
  .planner-meal-slot:hover { background:var(--mp-tile); }
  .planner-meal-img { width:40px; height:40px; border-radius:8px; object-fit:cover; flex:none; }
  .planner-meal-emoji { display:grid; place-items:center; background:var(--mp-tile2); color:var(--mp-sub); }
  .planner-meal-info { flex:1; min-width:0; }
  .planner-meal-name { font-weight:600; font-size:14px; line-height:1.3; word-break:break-word; }
  .planner-meal-meta { font-size:12px; color:var(--mp-sub); margin-top:2px; display:flex; align-items:center; gap:4px; --mdc-icon-size:14px; }
  .servings-inline { width:42px; padding:1px 4px; border:1px solid var(--mp-line); border-radius:6px; font-size:12px; background:transparent; color:var(--mp-txt); text-align:center; font-family:inherit; }
  .servings-inline:disabled { border-color:transparent; color:var(--mp-sub); width:auto; padding:0; }
  .planner-meal-empty { flex:1; display:flex; align-items:center; gap:6px; font-size:13px; color:var(--mp-sub); --mdc-icon-size:16px; }
  .planner-meal-nocook { flex:1; font-size:14px; font-weight:600; }
  .planner-remove-btn { align-self:center; }

  .planner-note { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--mp-sub); padding:0 8px 7px 6px; margin-top:-4px; cursor:pointer; --mdc-icon-size:13px; }
  .planner-note.empty { opacity:0; height:0; padding:0; overflow:hidden; }
  .planner-row:hover .planner-note.empty, .planner-note.empty:focus { opacity:.8; height:auto; padding:0 8px 7px 6px; }
  .planner-note:hover { color:var(--mp-txt); }
  @media (hover:none) { .planner-note.empty { opacity:.6; height:auto; padding:0 8px 7px 6px; } }

  .week-actions { display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; }

  .import-spinner { display:inline-block; width:14px; height:14px; border:2px solid var(--mp-line); border-top-color:var(--mp-acc); border-radius:50%; animation:spin .7s linear infinite; margin-right:6px; vertical-align:middle; }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* Stars & favourite */
  .star-rating { display:flex; gap:2px; --mdc-icon-size:22px; }
  .star { cursor:pointer; color:var(--mp-off); line-height:1; }
  .star.active { color:#f5b301; }
  .star-display { display:flex; color:#f5b301; --mdc-icon-size:13px; }
  .star-display .off { color:var(--mp-off); }
  .fav-btn { color:var(--mp-off); }
  .fav-btn.active { color:var(--mp-red); }
  .fav-filter.active { background:var(--mp-accbg); color:var(--mp-red); }

  /* ===== RECIPES ===== */
  .recipe-toolbar { display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap; align-items:center; }
  .search-input, .filter-select, .pick-search {
    padding:8px 10px; border:1px solid var(--mp-line); border-radius:8px; font-size:14px;
    background:var(--mp-tile); color:var(--mp-txt); font-family:inherit; box-sizing:border-box; }
  .search-input { flex:1; min-width:140px; }
  .filter-select option, select option { background:var(--mp-bg); color:var(--mp-txt); }
  .recipes-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:10px; }
  .recipe-card { border-radius:10px; overflow:hidden; cursor:pointer; background:var(--mp-tile); transition:background .15s; display:flex; flex-direction:column; }
  .recipe-card:hover { background:var(--mp-tile2); }
  .recipe-img { width:100%; aspect-ratio:16/10; background:var(--mp-tile2); display:grid; place-items:center; color:var(--mp-sub); --mdc-icon-size:32px; }
  .recipe-img img { width:100%; height:100%; object-fit:cover; display:block; }
  .recipe-info { padding:8px 10px 6px; flex:1; display:flex; flex-direction:column; }
  .recipe-name { font-weight:600; font-size:14px; line-height:1.3; margin-bottom:4px; }
  .recipe-meta { font-size:12px; color:var(--mp-sub); display:flex; gap:8px; flex-wrap:wrap; align-items:center; --mdc-icon-size:13px; }
  .recipe-meta span { display:inline-flex; align-items:center; gap:3px; }
  .recipe-tags { margin-top:6px; display:flex; gap:4px; flex-wrap:wrap; }
  .recipe-tag { background:var(--mp-accbg); color:var(--mp-acc); border-radius:999px; padding:1px 8px; font-size:11px; font-weight:600; }
  .recipe-actions-row { display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:4px; }

  /* Sub-tabs */
  .sub-tabs { display:flex; gap:4px; margin-bottom:12px; }
  .sub-tab { display:flex; align-items:center; gap:6px; background:none; border:none; padding:6px 12px; font-size:13px; font-weight:600; cursor:pointer;
             color:var(--mp-sub); border-radius:999px; --mdc-icon-size:15px; }
  .sub-tab:hover { color:var(--mp-txt); }
  .sub-tab.active { background:var(--mp-accbg); color:var(--mp-acc); }

  /* ===== SHOPPING ===== */
  .shopping-header { display:flex; gap:8px; margin-bottom:10px; align-items:center; }
  .shop-week-label { font-weight:600; font-size:14px; flex:1; text-align:center; }
  .shop-category-section { margin-bottom:12px; }
  .shop-cat-header { font-weight:600; font-size:11px; color:var(--mp-sub); text-transform:uppercase; letter-spacing:.5px; margin:0 0 2px; padding:4px 2px; }
  .shop-item { display:flex; align-items:center; gap:10px; padding:4px 2px 4px 4px; border-radius:8px; }
  .shop-item:hover { background:var(--mp-tile); }
  .shop-item input[type=checkbox] { width:18px; height:18px; margin:0; cursor:pointer; flex:none; accent-color:var(--mp-acc); }
  .shop-item.checked .item-name, .shop-item.checked .item-amount { text-decoration:line-through; opacity:.45; }
  .item-name { flex:1; font-size:14px; min-width:0; word-break:break-word; }
  .item-amount { font-size:12px; color:var(--mp-sub); white-space:nowrap; }
  .shop-item .icon-btn { opacity:.55; }
  .shop-item:hover .icon-btn { opacity:1; }
  .progress { display:flex; align-items:center; gap:10px; margin-bottom:12px; font-size:12px; color:var(--mp-sub); }
  .progress-bar { flex:1; background:var(--mp-line); border-radius:2px; height:4px; overflow:hidden; }
  .progress-fill { background:var(--mp-acc); height:100%; border-radius:2px; transition:width .4s; }
  .shop-intro { font-size:13px; color:var(--mp-sub); margin:0 0 10px; }
  .row-actions { margin-top:12px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }

  /* ===== BUTTONS ===== */
  .btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:8px 14px; border:none; border-radius:8px; cursor:pointer;
         font-size:13px; font-weight:600; transition:filter .15s, background .15s; white-space:nowrap; --mdc-icon-size:16px; }
  .btn:disabled { opacity:.5; cursor:default; }
  .btn-primary { background:var(--mp-acc); color:var(--text-primary-color, #fff); }
  .btn-primary:hover { filter:brightness(.92); }
  .btn-secondary, .btn-action-copy, .btn-action-random { background:var(--mp-tile); color:var(--mp-txt); }
  .btn-secondary:hover, .btn-action-copy:hover, .btn-action-random:hover { background:var(--mp-tile2); }
  .btn-danger { background:none; color:var(--mp-red); margin-right:auto; }
  .btn-danger:hover { background:color-mix(in srgb, var(--mp-red) 12%, transparent); }
  .btn-sm { padding:6px 10px; font-size:12px; }
  .btn-block { width:100%; }

  /* ===== MODALS ===== */
  .modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:9999; align-items:center; justify-content:center; padding:12px; box-sizing:border-box; }
  .modal-overlay.open { display:flex; }
  .modal { background:var(--mp-bg); color:var(--mp-txt); border-radius:16px; padding:20px; width:100%; max-width:560px; box-shadow:0 12px 40px rgba(0,0,0,.35); max-height:90vh; overflow-y:auto; box-sizing:border-box; }
  .modal.narrow { max-width:400px; }
  .modal h3 { margin:0 0 16px; font-size:18px; font-weight:700; }
  .modal-intro { font-size:13px; color:var(--mp-sub); margin:0 0 14px; }
  .form-group { margin-bottom:12px; min-width:0; }
  .form-group > label { display:block; font-size:12px; margin-bottom:4px; color:var(--mp-sub); font-weight:600; }
  .form-group input, .form-group textarea, .form-group select {
    width:100%; padding:8px 10px; border:1px solid var(--mp-line); border-radius:8px; font-size:14px;
    background:var(--mp-tile); color:var(--mp-txt); box-sizing:border-box; font-family:inherit; }
  .form-group input:focus, .form-group textarea:focus, .form-group select:focus, .search-input:focus, .pick-search:focus,
  .ing-row input:focus, .ing-row select:focus, .step-row textarea:focus { outline:none; border-color:var(--mp-acc); }
  .form-group textarea { resize:vertical; min-height:70px; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .form-row-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
  .check-group { display:flex; align-items:center; gap:8px; padding-top:20px; }
  .check-group input { width:18px; height:18px; accent-color:var(--mp-acc); margin:0; }
  .check-group label { font-size:14px; cursor:pointer; }
  .modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:16px; }
  .invalid { border-color:var(--mp-red) !important; }
  .status-error { color:var(--mp-red); }

  /* Ingredients editor */
  .ing-row { display:grid; grid-template-columns:18px 1fr auto; gap:4px 6px; align-items:center; margin-bottom:6px; padding-bottom:6px; border-bottom:1px solid var(--mp-line); }
  .ing-row.drag-over { border-top:2px solid var(--mp-acc); }
  .ing-name { grid-column:2; grid-row:1; width:100%; }
  .ing-row-sub { grid-column:2; grid-row:2; display:flex; gap:5px; }
  .ing-row > .icon-btn { grid-column:3; grid-row:1; }
  .drag-handle { grid-column:1; grid-row:1 / 3; cursor:grab; color:var(--mp-sub); opacity:.6; user-select:none; align-self:center; --mdc-icon-size:16px; }
  .drag-handle:active { cursor:grabbing; }
  .ing-row input, .ing-row select { padding:6px 8px; border:1px solid var(--mp-line); border-radius:6px; font-size:13px; background:var(--mp-tile); color:var(--mp-txt); box-sizing:border-box; font-family:inherit; }
  .ing-amount { width:64px !important; flex:none; }
  .ing-unit { width:70px !important; flex:none; }
  .ing-shopcat { flex:1; min-width:80px; }

  /* Steps editor */
  .step-row { display:flex; gap:6px; align-items:flex-start; margin-bottom:6px; }
  .step-num { background:var(--mp-accbg); color:var(--mp-acc); border-radius:50%; width:22px; height:22px; display:grid; place-items:center; font-size:12px; font-weight:700; flex:none; margin-top:6px; }
  .step-row textarea { flex:1; padding:6px 8px; border:1px solid var(--mp-line); border-radius:6px; font-size:13px; background:var(--mp-tile); color:var(--mp-txt); font-family:inherit; resize:vertical; min-height:40px; }

  /* Image upload */
  .img-upload { display:flex; align-items:center; justify-content:center; gap:8px; border:2px dashed var(--mp-line); border-radius:10px; padding:14px; cursor:pointer; font-size:13px; color:var(--mp-sub); }
  .img-upload:hover, .img-upload.drag { border-color:var(--mp-acc); color:var(--mp-acc); }
  .img-preview { width:100%; max-height:180px; object-fit:cover; border-radius:10px; margin-top:8px; }

  /* Pick meal modal */
  .pick-search { width:100%; margin-bottom:8px; }
  .pick-list { max-height:340px; overflow-y:auto; }
  .pick-item { display:flex; align-items:center; gap:10px; padding:6px; border-radius:8px; cursor:pointer; }
  .pick-item:hover { background:var(--mp-tile); }
  .pick-thumb { width:44px; height:44px; border-radius:8px; background:var(--mp-tile2); display:grid; place-items:center; color:var(--mp-sub); flex:none; overflow:hidden; }
  .pick-thumb img { width:100%; height:100%; object-fit:cover; }
  .pick-name { font-weight:600; font-size:14px; }
  .pick-new { background:var(--mp-accbg); margin-bottom:4px; }
  .pick-new:hover { background:color-mix(in srgb, var(--mp-acc) 20%, transparent); }
  .pick-new .pick-thumb { background:var(--mp-acc); color:var(--text-primary-color, #fff); }
  .pick-new .pick-name { color:var(--mp-acc); }
  .pick-meta { font-size:12px; color:var(--mp-sub); }

  /* Recipe detail modal */
  .recipe-detail-img { width:calc(100% + 40px); margin:-20px -20px 14px; max-height:220px; object-fit:cover; display:block; border-radius:16px 16px 0 0; }
  .recipe-detail-desc { color:var(--mp-sub); font-size:14px; margin:0 0 10px; }
  .recipe-detail-meta { display:flex; gap:6px; flex-wrap:wrap; font-size:12px; margin-bottom:12px; --mdc-icon-size:14px; }
  .recipe-detail-meta span { display:inline-flex; align-items:center; gap:4px; background:var(--mp-tile); border-radius:999px; padding:3px 9px; }
  .recipe-detail-section { margin-bottom:14px; }
  .recipe-detail-section h4 { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:700; margin:0 0 6px; text-transform:uppercase; letter-spacing:.4px; color:var(--mp-sub); --mdc-icon-size:16px; }
  .ing-list-item { display:flex; justify-content:space-between; gap:10px; padding:5px 0; font-size:14px; border-bottom:1px solid var(--mp-line); }
  .ing-list-item span:last-child { color:var(--mp-sub); white-space:nowrap; }
  .step-detail { display:flex; gap:10px; margin-bottom:10px; font-size:14px; line-height:1.45; }
  .step-detail .step-num { margin-top:0; }
  .detail-link { font-size:13px; margin:0 0 12px; }
  .detail-link a { color:var(--mp-acc); text-decoration:none; display:inline-flex; align-items:center; gap:4px; --mdc-icon-size:15px; }
  .detail-foot { font-size:12px; color:var(--mp-sub); margin-top:8px; }

  /* Tags input */
  .tags-wrap { display:flex; flex-wrap:wrap; gap:5px; padding:5px; border:1px solid var(--mp-line); border-radius:8px; background:var(--mp-tile); min-height:36px; cursor:text; box-sizing:border-box; }
  .tag-chip { background:var(--mp-accbg); color:var(--mp-acc); border-radius:999px; padding:2px 4px 2px 9px; font-size:12px; font-weight:600; display:flex; align-items:center; gap:2px; }
  .tag-chip button { background:none; border:none; color:inherit; cursor:pointer; padding:0 4px; font-size:14px; line-height:1; }
  .tags-wrap input { border:none !important; background:transparent !important; outline:none; font-size:14px; color:var(--mp-txt); min-width:80px; flex:1; font-family:inherit; padding:2px 4px !important; width:auto !important; }

  /* Misc */
  .empty-state { text-align:center; padding:28px 16px; color:var(--mp-sub); font-size:14px; }
  .empty-state .icon { --mdc-icon-size:36px; opacity:.6; margin-bottom:6px; }
  .empty-state p { margin:0; }
  .badge { display:inline-block; border-radius:999px; padding:1px 8px; font-size:11px; font-weight:600; }
  .badge-green  { background:color-mix(in srgb, var(--success-color, #43a047) 15%, transparent); color:var(--success-color, #43a047); }
  .badge-orange { background:color-mix(in srgb, var(--warning-color, #ffa600) 15%, transparent); color:var(--warning-color, #ffa600); }
  .badge-red    { background:color-mix(in srgb, var(--mp-red) 15%, transparent); color:var(--mp-red); }
  .recipe-detail-meta .badge { padding:3px 9px; font-size:12px; }

  /* No-cook options in pick modal */
  .nocook-section { margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid var(--mp-line); }
  .nocook-section h4 { font-size:11px; font-weight:600; color:var(--mp-sub); text-transform:uppercase; letter-spacing:.5px; margin:0 0 8px; }
  .nocook-options { display:flex; flex-wrap:wrap; gap:6px; }
  .nocook-btn { padding:6px 12px; border:none; border-radius:999px; background:var(--mp-tile); color:var(--mp-txt); font-size:13px; font-weight:600; cursor:pointer; }
  .nocook-btn:hover { background:var(--mp-accbg); color:var(--mp-acc); }

  /* Error banner */
  .mp-error { display:none; margin:0 16px 8px; padding:8px 12px; border-radius:8px; background:color-mix(in srgb, var(--mp-red) 12%, transparent); color:var(--mp-red); font-size:13px; }
  .mp-error.show { display:block; }

  @media (max-width:480px) {
    .form-row-3 { grid-template-columns:1fr 1fr; }
    .tab span { display:none; }
    .btn .hide-sm { display:none; }
  }
`;

class MealPlannerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._recipes = [];
    this._planning = {};
    this._shopping = {};
    this._fixedProducts = [];
    this._todayRecipe = null;
    this._currentWeek = getWeekKey();
    this._shoppingWeek = getWeekKey();
    this._activeTab = "planner";
    this._initialized = false;
    this._recipeFilter = "";
    this._recipeCategoryFilter = "";
    this._lastDay = new Date().toDateString();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._initialized = true;
      this._render();
      this._fetchAll();
    }
    if (this.isConnected) this._subscribe();
  }

  connectedCallback() {
    if (this._hass) this._subscribe();
    // Midnight / tablet that stayed on: refresh "tonight" and today's row
    this._dayTimer = setInterval(() => this._checkDayChange(), 60000);
    this._onVisible = () => { if (document.visibilityState === "visible" && this._hass) this._fetchAll(); };
    document.addEventListener("visibilitychange", this._onVisible);
  }

  disconnectedCallback() {
    this._unsubscribe();
    clearInterval(this._dayTimer);
    document.removeEventListener("visibilitychange", this._onVisible);
  }

  // Live updates. meal_planner/subscribe works for every user; plain
  // subscribeEvents only for admins (fallback for an older integration).
  _subscribe() {
    if (this._unsub || this._subscribing) return;
    this._subscribing = true;
    const conn = this._hass.connection;
    const onEvent = data => this._onUpdate(data || {});
    conn.subscribeMessage(onEvent, { type: "meal_planner/subscribe" })
      .catch(() => conn.subscribeEvents(ev => onEvent(ev.data), "meal_planner_updated"))
      .then(unsub => {
        this._subscribing = false;
        if (!this.isConnected) { unsub(); return; }
        this._unsub = unsub;
      })
      .catch(e => { this._subscribing = false; console.warn("MP: no live updates", e); });
  }

  _unsubscribe() {
    if (this._unsub) { try { this._unsub(); } catch (e) {} }
    this._unsub = null;
  }

  _onUpdate(data) {
    switch (data.what) {
      case "planning":
        if (!data.week || data.week === this._currentWeek) this._fetchPlanning(this._currentWeek);
        this._fetchToday();
        break;
      case "shopping":
        if (!data.week || data.week === this._shoppingWeek) this._fetchShopping(this._shoppingWeek);
        break;
      case "fixed":
        this._fetchFixedProducts();
        break;
      case "recipes":
        this._fetchRecipes().then(() => { this._renderPlanner(); this._fetchToday(); });
        break;
      default:
        this._fetchAll();
    }
  }

  _checkDayChange() {
    const today = new Date().toDateString();
    if (this._lastDay && this._lastDay !== today) {
      const oldWeek = getWeekKey(new Date(this._lastDay));
      if (this._currentWeek === oldWeek) this._currentWeek = getWeekKey();
      if (this._shoppingWeek === oldWeek) this._shoppingWeek = getWeekKey();
      this._fetchAll();
    }
    this._lastDay = today;
  }

  _showError(prefix, e) {
    const el = this.shadowRoot?.getElementById("mp-error");
    console.error("MP:", prefix, e);
    if (!el) return;
    const detail = e?.body?.error || e?.body?.message || e?.error || e?.message || "";
    el.textContent = `${prefix}${detail ? ": " + detail : ""}`;
    el.classList.add("show");
    clearTimeout(this._errTimer);
    this._errTimer = setTimeout(() => el.classList.remove("show"), 8000);
  }

  setConfig(config) {
    this._config = config || {};
    // Merge user labels with defaults (deep merge for arrays)
    const userLabels = config?.labels || {};
    this._labels = { ...DEFAULT_LABELS, ...userLabels };
    // Merge nested arrays only if user provided them
    if (!userLabels.days_short)     this._labels.days_short     = DEFAULT_LABELS.days_short;
    if (!userLabels.days_full)      this._labels.days_full       = DEFAULT_LABELS.days_full;
    if (!userLabels.categories)     this._labels.categories      = DEFAULT_LABELS.categories;
    if (!userLabels.shop_categories)this._labels.shop_categories = DEFAULT_LABELS.shop_categories;
    this._readonly = config?.readonly === true;
  }

  _l(key) { return this._labels?.[key] ?? DEFAULT_LABELS[key] ?? key; }

  // The dinner category: "dinner_category" in the config, otherwise the
  // 3rd category (default "avondeten"), so translated labels keep working.
  _dinnerCategory() {
    const cats = this._labels?.categories || DEFAULT_LABELS.categories;
    return this._config?.dinner_category || cats[2] || cats[0] || "avondeten";
  }
  getCardSize() { return 6; }
  static getStubConfig() { return {}; }
  static getConfigElement() { return document.createElement("meal-planner-card-editor"); }

  async _fetchAll() {
    // Fetch recipes first — planner & today depend on them
    await this._fetchRecipes();
    await Promise.all([
      this._fetchPlanning(this._currentWeek),
      this._fetchShopping(this._shoppingWeek),
      this._fetchToday(),
      this._fetchFixedProducts(),
    ]);
  }

  async _fetchRecipes() {
    try {
      this._recipes = await this._hass.callApi("GET", "meal_planner/recipes");
      this._renderRecipes();
    } catch(e) { this._showError(this._l("error_load"), e); }
  }

  async _fetchPlanning(week) {
    try {
      this._planning[week] = await this._hass.callApi("GET", `meal_planner/planning/${week}`);
      this._renderPlanner();
      return this._planning[week];
    } catch(e) { this._showError(this._l("error_load"), e); }
  }

  async _fetchShopping(week) {
    try {
      this._shopping[week] = await this._hass.callApi("GET", `meal_planner/shopping/${week}`);
      this._renderShopping();
    } catch(e) { this._showError(this._l("error_load"), e); }
  }

  async _fetchToday() {
    try {
      const res = await this._hass.callApi("GET", "meal_planner/today");
      this._todayRecipe = res;
      this._renderToday();
    } catch(e) { console.error("MP today error:", e); }
  }

  async _savePlanning(week, data) {
    try {
      await this._hass.callApi("PUT", `meal_planner/planning/${week}`, data);
      this._planning[week] = data;
      this._renderPlanner();
      this._fetchToday();
    } catch(e) { this._showError(this._l("error_save"), e); }
  }

  async _saveRecipe(data, id = null) {
    try {
      if (id) {
        await this._hass.callApi("PUT", `meal_planner/recipes/${id}`, data);
      } else {
        await this._hass.callApi("POST", "meal_planner/recipes", data);
      }
      await this._fetchRecipes();
    } catch(e) { this._showError(this._l("error_save"), e); }
  }

  async _deleteRecipe(id) {
    try {
      await this._hass.callApi("DELETE", `meal_planner/recipes/${id}`);
      await this._fetchRecipes();
      this._renderPlanner();
    } catch(e) { this._showError(this._l("error_save"), e); }
  }

  async _generateShopping(week) {
    try {
      this._shopping[week] = await this._hass.callApi("POST", `meal_planner/shopping/${week}`, {});
      this._renderShopping();
    } catch(e) { this._showError(this._l("error_save"), e); }
  }

  // Shopping changes go per item, so two phones ticking off at the same
  // time no longer overwrite each other. The server returns the fresh week.
  async _shopCall(week, method, path, data) {
    try {
      const res = await this._hass.callApi(method, `meal_planner/shopping/${week}${path}`, data);
      this._shopping[week] = res;
      this._renderShopping();
    } catch(e) {
      this._showError(this._l("error_save"), e);
      this._fetchShopping(week);
    }
  }
  _shopAddItems(week, items, skipExisting = false) {
    return this._shopCall(week, "POST", "/items", { items, skip_existing: skipExisting });
  }
  _shopUpdateItem(week, id, fields) {
    return this._shopCall(week, "PUT", `/item/${encodeURIComponent(id)}`, fields);
  }
  _shopDeleteItem(week, id) {
    return this._shopCall(week, "DELETE", `/item/${encodeURIComponent(id)}`);
  }

  _recipesMap() {
    return Object.fromEntries(this._recipes.map(r => [r.id, r]));
  }

  _getPlanning(week) {
    return this._planning[week] || { days: Object.fromEntries(DAYS_NL.map(d => [d, { dinner: null, servings: this._defaultServings() }])) };
  }

  // Persons for a newly planned dinner: card setting "default_servings", else 4
  _defaultServings() {
    return parseInt(this._config?.default_servings) || 4;
  }

  // ─── RENDER SHELL ──────────────────────────────────────────────
  _render() {
    const ro = this._readonly;
    const L = k => esc(this._l(k));
    const cats = this._labels.categories.map(c => `<option value="${esc(c)}">${esc(c.charAt(0).toUpperCase()+c.slice(1))}</option>`).join("");
    const shopCats = this._labels.shop_categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <ha-card>
        <div class="kop">
          <div class="chip">${ic("silverware-fork-knife")}</div>
          <div class="kop-txt">
            <h2>${esc(this._config?.title || this._l("title"))}</h2>
            <p id="kop-sub">&nbsp;</p>
          </div>
          <span class="pil" id="kop-pil"></span>
        </div>
        <div class="mp-error" id="mp-error"></div>
        ${ro ? "" : `
        <div class="tabs">
          <button class="tab active" data-tab="planner">${ic("calendar-week")}<span>${L("tab_planner")}</span></button>
          <button class="tab" data-tab="recipes">${ic("book-open-variant")}<span>${L("tab_recipes")}</span></button>
          <button class="tab" data-tab="shopping">${ic("cart-outline")}<span>${L("tab_shopping")}</span></button>
        </div>`}

        <div class="tab-content active" id="tab-planner">
          <div class="week-nav">
            <button class="icon-btn" id="prev-week" title="Vorige week">${ic("chevron-left")}</button>
            <span class="week-label" id="week-label"></span>
            <button class="icon-btn" id="next-week" title="Volgende week">${ic("chevron-right")}</button>
          </div>
          <div class="week-grid" id="week-grid"></div>
          ${ro ? "" : `
          <div class="week-actions">
            <button class="btn btn-secondary" id="copy-prev-week">${ic("content-copy")}${L("planner_copy")}</button>
            <button class="btn btn-secondary" id="random-dinners">${ic("dice-multiple-outline")}${L("planner_random")}</button>
          </div>`}
        </div>

        ${ro ? "" : `
        <div class="tab-content" id="tab-recipes">
          <div class="recipe-toolbar">
            <input class="search-input" id="recipe-search" placeholder="${L('recipes_search')}" />
            <select class="filter-select" id="recipe-cat-filter">
              <option value="">${L("recipes_all_cats")}</option>
              ${cats}
            </select>
            <button class="icon-btn fav-filter" id="fav-filter-btn" title="Toon favorieten">${ic("heart-outline")}</button>
            <button class="btn btn-secondary" id="import-recipe-btn">${ic("download")}<span class="hide-sm">${L("recipes_import")}</span></button>
            <button class="btn btn-primary" id="add-recipe-btn">${ic("plus")}${L("recipes_add")}</button>
          </div>
          <div class="recipes-grid" id="recipes-grid"></div>
        </div>

        <div class="tab-content" id="tab-shopping">
          <div class="sub-tabs">
            <button class="sub-tab active" id="subtab-week-btn">${ic("format-list-checks")}${L("shop_subtab_week")}</button>
            <button class="sub-tab" id="subtab-fixed-btn">${ic("pin-outline")}${L("shop_subtab_fixed")}</button>
          </div>

          <div id="subtab-week">
            <div class="shopping-header">
              <button class="icon-btn" id="shop-prev-week" title="Vorige week">${ic("chevron-left")}</button>
              <span class="shop-week-label" id="shop-week-label"></span>
              <button class="icon-btn" id="shop-next-week" title="Volgende week">${ic("chevron-right")}</button>
            </div>
            <div class="progress">
              <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
              <span id="progress-text"></span>
            </div>
            <div id="shopping-list"></div>
            <div class="row-actions">
              <button class="btn btn-secondary" id="add-extra-btn" style="flex:1">${ic("plus")}${L("shop_extra_add")}</button>
              <button class="btn btn-primary" id="generate-shopping" style="flex:1">${ic("cart-arrow-down")}${L("shop_generate")}</button>
            </div>
          </div>

          <div id="subtab-fixed" style="display:none">
            <p class="shop-intro">Vink de producten aan die je wil toevoegen aan de weeklijst, en klik op <strong>${L("shop_fixed_to_week")}</strong>.</p>
            <div id="fixed-products-list"></div>
            <div class="row-actions">
              <button class="btn btn-secondary" id="add-fixed-btn" style="flex:1">${ic("plus")}${L("shop_fixed_add")}</button>
              <button class="btn btn-primary" id="fixed-add-to-week" style="flex:1">${ic("playlist-plus")}${L("shop_fixed_to_week")}</button>
            </div>
          </div>
        </div>`}
      </ha-card>

      <!-- Extra Item Modal -->
      <div class="modal-overlay" id="extra-modal">
        <div class="modal narrow">
          <h3 id="extra-modal-title">${L("shop_extra_add")}</h3>
          <div class="form-group">
            <label>${L("recipe_name")}</label>
            <input type="text" id="ei-name" placeholder="vb. Melk, Zeep, ..." />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>${L("recipe_ing_amount")}</label>
              <input type="number" id="ei-amount" placeholder="0" min="0" step="0.1" />
            </div>
            <div class="form-group">
              <label>${L("recipe_ing_unit")}</label>
              <input type="text" id="ei-unit" placeholder="g / stuk / ml / l" />
            </div>
          </div>
          <div class="form-group">
            <label>${L("recipe_ing_cat")}</label>
            <select id="ei-category">${shopCats}</select>
          </div>
          <div class="modal-actions">
            <button class="btn btn-danger" id="ei-delete" style="display:none">${ic("delete-outline")}${L("btn_delete")}</button>
            <button class="btn btn-secondary" id="ei-cancel">${L("btn_cancel")}</button>
            <button class="btn btn-primary" id="ei-save">${L("btn_save")}</button>
          </div>
        </div>
      </div>

      <!-- Pick Meal Modal -->
      <div class="modal-overlay" id="pick-modal">
        <div class="modal">
          <h3 id="pick-modal-title">${L("pick_title")}</h3>
          <div class="nocook-section">
            <h4>${L("nocook_title")}</h4>
            <div class="nocook-options" id="nocook-options">
              ${(this._labels.nocook_options || DEFAULT_LABELS.nocook_options).map(opt =>
                `<button class="nocook-btn" data-label="${esc(opt)}">${esc(opt)}</button>`
              ).join("")}
            </div>
          </div>
          <input class="pick-search" id="pick-search" placeholder="${L('pick_search')}" />
          <div class="pick-list" id="pick-list"></div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="pick-cancel">${L("btn_cancel")}</button>
          </div>
        </div>
      </div>

      <!-- URL Import Modal -->
      <div class="modal-overlay" id="import-modal">
        <div class="modal narrow">
          <h3>${L("import_title")}</h3>
          <p class="modal-intro">${L("import_intro")}</p>
          <div class="form-group">
            <label>${L("import_url_label")}</label>
            <input type="url" id="import-url" placeholder="https://dagelijksekost.vrt.be/recepten/..." />
          </div>
          <div id="import-status" style="font-size:13px;margin:8px 0;min-height:20px;"></div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="import-cancel">${L("btn_cancel")}</button>
            <button class="btn btn-primary" id="import-fetch-btn">${L("import_fetch")}</button>
          </div>
        </div>
      </div>

      <!-- Recipe Edit Modal -->
      <div class="modal-overlay" id="recipe-modal">
        <div class="modal">
          <h3 id="recipe-modal-title">${L("recipe_modal_add")}</h3>
          <div class="form-row">
            <div class="form-group">
              <label>${L("recipe_name")}</label>
              <input type="text" id="rm-name" />
            </div>
            <div class="form-group">
              <label>${L("recipe_category")}</label>
              <select id="rm-category">${cats}</select>
            </div>
          </div>
          <div class="form-group">
            <label>${L("recipe_description")}</label>
            <textarea id="rm-description" placeholder="${L('recipe_desc_ph')}"></textarea>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label>${L("recipe_servings")}</label>
              <input type="number" id="rm-servings" value="4" min="1" max="20" />
            </div>
            <div class="form-group">
              <label>${L("recipe_prep")}</label>
              <input type="number" id="rm-prep" value="15" min="0" />
            </div>
            <div class="form-group">
              <label>${L("recipe_cook")}</label>
              <input type="number" id="rm-cook" value="30" min="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>${L("recipe_difficulty")}</label>
              <select id="rm-difficulty">
                <option value="easy">${L("diff_easy")}</option>
                <option value="medium" selected>${L("diff_medium")}</option>
                <option value="hard">${L("diff_hard")}</option>
              </select>
            </div>
            <div class="form-group">
              <label>${L("recipe_source")}</label>
              <input type="url" id="rm-source" placeholder="https://..." />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>${L("recipe_rating")}</label>
              <div class="star-rating" id="rm-star-rating">
                ${[1,2,3,4,5].map(v => `<span class="star" data-val="${v}">${ic("star")}</span>`).join("")}
              </div>
            </div>
            <div class="form-group check-group">
              <input type="checkbox" id="rm-favourite" />
              <label for="rm-favourite">${L("recipe_favourite")}</label>
            </div>
          </div>
          <div class="form-group">
            <label>${L("recipe_tags")}</label>
            <div class="tags-wrap" id="rm-tags-wrap">
              <input type="text" id="rm-tag-input" placeholder="${L('recipe_tags_ph')}" />
            </div>
          </div>
          <div class="form-group">
            <label>${L("recipe_photo")}</label>
            <div class="img-upload" id="rm-img-upload">${ic("camera-outline")}<span>${L("recipe_photo_ph")}</span>
              <input type="file" id="rm-img-file" accept="image/*" style="display:none" />
            </div>
            <img id="rm-img-preview" class="img-preview" style="display:none" />
          </div>
          <div class="form-group">
            <label>${L("recipe_ingredients")}</label>
            <div id="rm-ingredients"></div>
            <button class="btn btn-secondary btn-sm" id="rm-add-ing">${ic("plus")}${L("recipe_add_ing")}</button>
          </div>
          <div class="form-group">
            <label>${L("recipe_steps")}</label>
            <div id="rm-steps"></div>
            <button class="btn btn-secondary btn-sm" id="rm-add-step">${ic("plus")}${L("recipe_add_step")}</button>
          </div>
          <div class="modal-actions">
            <button class="btn btn-danger" id="rm-delete" style="display:none">${ic("delete-outline")}${L("btn_delete")}</button>
            <button class="btn btn-secondary" id="rm-cancel">${L("btn_cancel")}</button>
            <button class="btn btn-primary" id="rm-save">${L("btn_save")}</button>
          </div>
        </div>
      </div>

      <!-- Recipe Detail Modal -->
      <div class="modal-overlay" id="detail-modal">
        <div class="modal">
          <div id="detail-content"></div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="detail-edit" ${ro ? 'style="display:none"' : ""}>${ic("pencil-outline")}${L("btn_edit")}</button>
            <button class="btn btn-primary" id="detail-close">${L("btn_close")}</button>
          </div>
        </div>
      </div>
    `;
    // Click on the dark background closes a modal
    this.shadowRoot.querySelectorAll(".modal-overlay").forEach(ov =>
      ov.addEventListener("click", e => { if (e.target === ov) ov.classList.remove("open"); }));
    this._setupListeners();
  }

  // ─── EVENT LISTENERS ──────────────────────────────────────────
  _setupListeners() {
    const r = this.shadowRoot;

    // Tabs (only in non-readonly)
    r.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        this._activeTab = tab.dataset.tab;
        r.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
        r.querySelectorAll(".tab-content").forEach(c => c.classList.toggle("active", c.id === `tab-${this._activeTab}`));
      });
    });

    // Planner nav (always available)
    r.getElementById("prev-week").addEventListener("click", () => {
      this._currentWeek = prevWeek(this._currentWeek);
      this._fetchPlanning(this._currentWeek);
    });
    r.getElementById("next-week").addEventListener("click", () => {
      this._currentWeek = nextWeek(this._currentWeek);
      this._fetchPlanning(this._currentWeek);
    });

    // Detail modal (also in readonly mode)
    r.getElementById("detail-close").addEventListener("click", () => r.getElementById("detail-modal").classList.remove("open"));
    r.getElementById("detail-edit").addEventListener("click", () => {
      r.getElementById("detail-modal").classList.remove("open");
      if (this._detailRecipe) this._openRecipeModal(this._detailRecipe);
    });

    // Everything below is edit-only — skip in readonly mode
    if (this._readonly) return;

    r.getElementById("copy-prev-week").addEventListener("click", async () => {
      const week = this._currentWeek;
      const prev = prevWeek(week);
      // Always fetch fresh: an empty previous week must never wipe this one
      let prevPlan;
      try {
        prevPlan = await this._hass.callApi("GET", `meal_planner/planning/${prev}`);
      } catch (e) { this._showError(this._l("error_load"), e); return; }
      if (!weekHasContent(prevPlan)) { alert(this._l("info_copy_empty")); return; }
      if (weekHasContent(this._getPlanning(week)) && !confirm(this._l("confirm_copy_overwrite"))) return;
      this._planning[prev] = prevPlan;
      this._savePlanning(week, JSON.parse(JSON.stringify(prevPlan)));
    });
    r.getElementById("random-dinners").addEventListener("click", () => {
      const plan = JSON.parse(JSON.stringify(this._getPlanning(this._currentWeek)));
      const dinnerCat = this._dinnerCategory();
      let dinnerRecipes = this._recipes.filter(r => r.category === dinnerCat || !r.category);
      if (!dinnerRecipes.length) dinnerRecipes = [...this._recipes];
      if (!dinnerRecipes.length) return;
      DAYS_NL.forEach(day => { plan.days[day] = plan.days[day] || { dinner: null, servings: 4 }; });
      // Only fill empty days; planned days and no-cook nights stay
      let days = DAYS_NL.filter(day => !plan.days[day].dinner && !plan.days[day].nocook);
      if (!days.length) {
        if (!confirm(this._l("confirm_random_all"))) return;
        days = DAYS_NL;
      }
      // Avoid the same recipe twice in a week as long as there are enough
      const used = new Set(DAYS_NL.filter(d => !days.includes(d)).map(d => plan.days[d].dinner).filter(Boolean));
      let pool = dinnerRecipes.filter(rc => !used.has(rc.id));
      days.forEach(day => {
        if (!pool.length) pool = [...dinnerRecipes];
        const rand = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        plan.days[day].dinner = rand.id;
        plan.days[day].nocook = null;
      });
      this._savePlanning(this._currentWeek, plan);
    });

    // Shopping nav
    r.getElementById("shop-prev-week").addEventListener("click", () => {
      this._shoppingWeek = prevWeek(this._shoppingWeek);
      this._fetchShopping(this._shoppingWeek);
      this._renderShoppingHeader();
    });
    r.getElementById("shop-next-week").addEventListener("click", () => {
      this._shoppingWeek = nextWeek(this._shoppingWeek);
      this._fetchShopping(this._shoppingWeek);
      this._renderShoppingHeader();
    });
    r.getElementById("generate-shopping").addEventListener("click", () => this._generateShopping(this._shoppingWeek));

    // Sub-tabs shopping
    r.getElementById("subtab-week-btn").addEventListener("click", () => {
      r.getElementById("subtab-week").style.display = "";
      r.getElementById("subtab-fixed").style.display = "none";
      r.getElementById("subtab-week-btn").classList.add("active");
      r.getElementById("subtab-fixed-btn").classList.remove("active");
    });
    r.getElementById("subtab-fixed-btn").addEventListener("click", () => {
      r.getElementById("subtab-week").style.display = "none";
      r.getElementById("subtab-fixed").style.display = "";
      r.getElementById("subtab-week-btn").classList.remove("active");
      r.getElementById("subtab-fixed-btn").classList.add("active");
      this._renderFixedProducts();
    });
    r.getElementById("add-fixed-btn").addEventListener("click", () => this._openFixedProductModal(null));
    r.getElementById("fixed-add-to-week").addEventListener("click", () => this._addFixedToWeek());

    // Extra item modal
    r.getElementById("add-extra-btn").addEventListener("click", () => this._openExtraModal());
    r.getElementById("ei-cancel").addEventListener("click", () => r.getElementById("extra-modal").classList.remove("open"));
    r.getElementById("ei-save").addEventListener("click", () => this._saveExtraItem());
    r.getElementById("ei-delete").addEventListener("click", () => this._deleteExtraItem());

    // Recipe search/filter
    // Star rating clicks in recipe modal
    r.querySelectorAll("#rm-star-rating .star").forEach(star => {
      star.addEventListener("click", () => {
        const val = parseInt(star.dataset.val);
        // Click same star again = clear rating
        this._currentRating = (this._currentRating === val) ? 0 : val;
        r.querySelectorAll("#rm-star-rating .star").forEach(s => s.classList.toggle("active", parseInt(s.dataset.val) <= this._currentRating));
      });
    });
    // Favourites filter
    r.getElementById("fav-filter-btn").addEventListener("click", () => {
      this._favFilter = !this._favFilter;
      const fb = r.getElementById("fav-filter-btn");
      fb.classList.toggle("active", this._favFilter);
      fb.innerHTML = ic(this._favFilter ? "heart" : "heart-outline");
      this._renderRecipes();
    });

    r.getElementById("recipe-search").addEventListener("input", e => {
      this._recipeFilter = e.target.value.toLowerCase();
      this._renderRecipes();
    });
    r.getElementById("recipe-cat-filter").addEventListener("change", e => {
      this._recipeCategoryFilter = e.target.value;
      this._renderRecipes();
    });

    // Add recipe
    r.getElementById("add-recipe-btn").addEventListener("click", () => this._openRecipeModal(null));
    r.getElementById("import-recipe-btn").addEventListener("click", () => this._openImportModal());
    r.getElementById("import-cancel").addEventListener("click", () => r.getElementById("import-modal").classList.remove("open"));
    r.getElementById("import-fetch-btn").addEventListener("click", () => this._fetchImportUrl());
    r.getElementById("import-url").addEventListener("keydown", e => { if (e.key === "Enter") this._fetchImportUrl(); });

    // Recipe modal
    r.getElementById("rm-cancel").addEventListener("click", () => r.getElementById("recipe-modal").classList.remove("open"));
    r.getElementById("rm-add-ing").addEventListener("click", () => this._addIngredientRow());
    r.getElementById("rm-add-step").addEventListener("click", () => this._addStepRow());
    r.getElementById("rm-img-upload").addEventListener("click", (e) => { if (e.target !== r.getElementById("rm-img-file")) r.getElementById("rm-img-file").click(); });
    const usePhoto = async file => {
      if (!file || !file.type.startsWith("image/")) return;
      const preview = r.getElementById("rm-img-preview");
      preview.src = await shrinkImage(file);
      preview.style.display = "block";
    };
    r.getElementById("rm-img-file").addEventListener("change", e => {
      usePhoto(e.target.files[0]);
      e.target.value = "";
    });
    const drop = r.getElementById("rm-img-upload");
    drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("drag"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
    drop.addEventListener("drop", e => {
      e.preventDefault();
      drop.classList.remove("drag");
      usePhoto(e.dataTransfer.files[0]);
    });
    r.getElementById("rm-tag-input").addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const val = e.target.value.trim().toLowerCase();
        if (val) { this._addTagChip(val); e.target.value = ""; }
      }
    });
    r.getElementById("rm-save").addEventListener("click", () => this._saveRecipeFromModal());
    r.getElementById("rm-delete").addEventListener("click", () => {
      const recipe = this._editingRecipe;
      if (!recipe?.id) return;
      // How often is it planned in the weeks we have loaded?
      const planned = Object.values(this._planning)
        .flatMap(p => Object.values(p?.days || {}))
        .filter(d => d && d.dinner === recipe.id).length;
      let msg = this._l("confirm_delete_recipe").replace("{name}", recipe.name || "");
      if (planned) msg += "\n" + this._l("confirm_delete_planned").replace("{n}", planned);
      if (!confirm(msg)) return;
      this._deleteRecipe(recipe.id);
      r.getElementById("recipe-modal").classList.remove("open");
    });

    // Pick modal
    r.getElementById("pick-cancel").addEventListener("click", () => r.getElementById("pick-modal").classList.remove("open"));
    r.getElementById("pick-search").addEventListener("input", e => this._renderPickList(e.target.value));
    r.getElementById("pick-search").addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      // Enter: an exact match is planned, otherwise a new meal is made
      const text = e.target.value.trim();
      if (!text) return;
      const exact = this._recipes.find(rc => String(rc.name || "").trim().toLowerCase() === text.toLowerCase());
      if (exact) this._planRecipe(exact);
      else this._planNewMeal(text);
    });
    r.querySelectorAll(".nocook-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const { day, mealType } = this._pickContext;
        const plan = JSON.parse(JSON.stringify(this._getPlanning(this._currentWeek)));
        plan.days[day][mealType] = null;
        plan.days[day].nocook = btn.dataset.label;
        this._savePlanning(this._currentWeek, plan);
        this.shadowRoot.getElementById("pick-modal").classList.remove("open");
      });
    });

  }

  _addTagChip(text) {
    const wrap = this.shadowRoot.getElementById("rm-tags-wrap");
    const chip = document.createElement("span");
    chip.className = "tag-chip";
    chip.dataset.value = text;
    chip.innerHTML = `${esc(text)}<button type="button">×</button>`;
    chip.querySelector("button").addEventListener("click", () => chip.remove());
    wrap.insertBefore(chip, wrap.querySelector("input"));
  }

  _getTags() {
    return [...this.shadowRoot.getElementById("rm-tags-wrap").querySelectorAll(".tag-chip")]
      .map(c => c.dataset.value);
  }

  _addIngredientRow(ing = {}) {
    const container = this.shadowRoot.getElementById("rm-ingredients");
    const row = document.createElement("div");
    row.className = "ing-row";
    row.draggable = true;
    row.innerHTML = `
      <span class="drag-handle" title="Versleep om te herordenen">${ic("drag")}</span>
      <input type="text" placeholder="${this._l('recipe_ing_name')}" value="${esc(ing.name)}" class="ing-name" />
      <button type="button" class="icon-btn sm danger" title="${esc(this._l("btn_delete"))}">${ic("delete-outline")}</button>
      <div class="ing-row-sub">
        <input type="number" placeholder="0" value="${esc(ing.amount || "")}" class="ing-amount" min="0" step="0.1" />
        <input type="text" placeholder="${this._l('recipe_ing_unit')}" value="${esc(ing.unit)}" class="ing-unit" />
        <select class="ing-shopcat">
          ${this._labels.shop_categories.map(c => `<option value="${esc(c)}" ${ing.shop_category === c ? "selected" : ""}>${esc(c)}</option>`).join("")}
        </select>
      </div>
    `;
    row.querySelector("button").addEventListener("click", () => row.remove());

    // Drag & drop reorder
    row.addEventListener("dragstart", e => {
      this._dragSrcRow = row;
      e.dataTransfer.effectAllowed = "move";
      setTimeout(() => row.style.opacity = "0.4", 0);
    });
    row.addEventListener("dragend", () => {
      row.style.opacity = "";
      container.querySelectorAll(".ing-row").forEach(r => r.classList.remove("drag-over"));
    });
    row.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      container.querySelectorAll(".ing-row").forEach(r => r.classList.remove("drag-over"));
      if (row !== this._dragSrcRow) row.classList.add("drag-over");
    });
    row.addEventListener("drop", e => {
      e.preventDefault();
      if (this._dragSrcRow && this._dragSrcRow !== row) {
        const rows = [...container.querySelectorAll(".ing-row")];
        const srcIdx = rows.indexOf(this._dragSrcRow);
        const tgtIdx = rows.indexOf(row);
        if (srcIdx < tgtIdx) container.insertBefore(this._dragSrcRow, row.nextSibling);
        else container.insertBefore(this._dragSrcRow, row);
      }
      container.querySelectorAll(".ing-row").forEach(r => r.classList.remove("drag-over"));
    });

    container.appendChild(row);
  }

  _addStepRow(text = "") {
    const container = this.shadowRoot.getElementById("rm-steps");
    const num = container.children.length + 1;
    const row = document.createElement("div");
    row.className = "step-row";
    row.innerHTML = `<div class="step-num">${num}</div><textarea placeholder="Beschrijf stap ${num}...">${esc(text)}</textarea><button type="button" class="icon-btn sm danger" title="${esc(this._l("btn_delete"))}">${ic("delete-outline")}</button>`;
    row.querySelector("button").addEventListener("click", () => {
      row.remove();
      // renumber
      container.querySelectorAll(".step-num").forEach((n, i) => n.textContent = i + 1);
    });
    container.appendChild(row);
  }

  _getIngredients() {
    return [...this.shadowRoot.getElementById("rm-ingredients").querySelectorAll(".ing-row")].map(row => ({
      name: row.querySelector(".ing-name").value.trim(),
      amount: parseFloat(row.querySelector(".ing-amount").value) || 0,
      unit: row.querySelector(".ing-unit").value.trim(),
      shop_category: row.querySelector(".ing-shopcat").value,
    })).filter(i => i.name);
  }

  _getSteps() {
    return [...this.shadowRoot.getElementById("rm-steps").querySelectorAll("textarea")]
      .map(t => t.value.trim()).filter(Boolean);
  }

  async _toggleFavourite(recipe) {
    const updated = { ...recipe, favourite: !recipe.favourite };
    await this._saveRecipe(updated, recipe.id);
  }

  _openImportModal() {
    const r = this.shadowRoot;
    r.getElementById("import-url").value = "";
    r.getElementById("import-status").innerHTML = "";
    r.getElementById("import-fetch-btn").disabled = false;
    r.getElementById("import-modal").classList.add("open");
    setTimeout(() => r.getElementById("import-url").focus(), 50);
  }

  async _fetchImportUrl() {
    const r = this.shadowRoot;
    const url = r.getElementById("import-url").value.trim();
    if (!url) { r.getElementById("import-status").innerHTML = '<span class="status-error">Vul een URL in.</span>'; return; }
    const status = r.getElementById("import-status");
    const btn = r.getElementById("import-fetch-btn");
    status.innerHTML = '<span class="import-spinner"></span> Bezig met ophalen...';
    btn.disabled = true;
    try {
      const result = await this._hass.callApi("POST", "meal_planner/import_recipe", { url });
      if (result.error) {
        status.innerHTML = `<span class="status-error">${esc(result.error)}</span>`;
        btn.disabled = false;
        return;
      }
      r.getElementById("import-modal").classList.remove("open");
      if (!this._labels.categories.includes(result.category)) result.category = this._dinnerCategory();
      this._openRecipeModal(result);
    } catch(e) {
      status.innerHTML = '<span class="status-error">Kon de pagina niet ophalen. Probeer een andere URL.</span>';
      btn.disabled = false;
    }
  }

  _openRecipeModal(recipe = null) {
    const r = this.shadowRoot;
    this._editingRecipe = recipe;
    r.getElementById("recipe-modal-title").textContent = recipe ? this._l("recipe_modal_edit") : this._l("recipe_modal_add");
    r.getElementById("rm-name").value = recipe?.name || "";
    r.getElementById("rm-description").value = recipe?.description || "";
    const cats = this._labels.categories;
    r.getElementById("rm-category").value = cats.includes(recipe?.category) ? recipe.category : this._dinnerCategory();
    r.getElementById("rm-servings").value = recipe?.servings || 4;
    r.getElementById("rm-prep").value = recipe?.prep_time || 15;
    r.getElementById("rm-cook").value = recipe?.cook_time || 30;
    r.getElementById("rm-difficulty").value = recipe?.difficulty || "medium";
    r.getElementById("rm-source").value = recipe?.source_url || "";
    // Tags
    const wrap = r.getElementById("rm-tags-wrap");
    [...wrap.querySelectorAll(".tag-chip")].forEach(c => c.remove());
    (recipe?.tags || []).forEach(t => this._addTagChip(t));
    // Image
    const preview = r.getElementById("rm-img-preview");
    if (safeImg(recipe?.image)) { preview.src = safeImg(recipe.image); preview.style.display = "block"; }
    else { preview.src = ""; preview.style.display = "none"; }
    // Ingredients
    r.getElementById("rm-ingredients").innerHTML = "";
    (recipe?.ingredients || []).forEach(i => this._addIngredientRow(i));
    // Steps
    r.getElementById("rm-steps").innerHTML = "";
    (recipe?.steps || []).forEach(s => this._addStepRow(s));
    // Delete btn
    r.getElementById("rm-delete").style.display = recipe ? "inline-flex" : "none";
    // Rating stars
    const stars = r.querySelectorAll("#rm-star-rating .star");
    this._currentRating = recipe?.rating || 0;
    stars.forEach(s => s.classList.toggle("active", parseInt(s.dataset.val) <= this._currentRating));
    r.getElementById("rm-favourite").checked = recipe?.favourite || false;
    r.getElementById("recipe-modal").classList.add("open");
    setTimeout(() => r.getElementById("rm-name").focus(), 50);
  }

  async _saveRecipeFromModal() {
    const r = this.shadowRoot;
    const name = r.getElementById("rm-name").value.trim();
    if (!name) { r.getElementById("rm-name").classList.add("invalid"); return; }
    r.getElementById("rm-name").classList.remove("invalid");
    const preview = r.getElementById("rm-img-preview");
    const data = {
      name,
      description: r.getElementById("rm-description").value.trim(),
      category: r.getElementById("rm-category").value,
      servings: parseInt(r.getElementById("rm-servings").value) || 4,
      prep_time: parseInt(r.getElementById("rm-prep").value) || 0,
      cook_time: parseInt(r.getElementById("rm-cook").value) || 0,
      difficulty: r.getElementById("rm-difficulty").value,
      source_url: r.getElementById("rm-source").value.trim(),
      rating: this._currentRating || 0,
      favourite: r.getElementById("rm-favourite").checked,
      tags: this._getTags(),
      image: preview.style.display !== "none" ? await shrinkDataUrl(preview.src) : null,
      ingredients: this._getIngredients(),
      steps: this._getSteps(),
    };
    r.getElementById("recipe-modal").classList.remove("open");
    await this._saveRecipe(data, this._editingRecipe?.id || null);
  }

  _openExtraModal(item = null) {
    const r = this.shadowRoot;
    this._editingExtraItem = item;
    this._editingFixedProduct = null;
    r.getElementById("extra-modal-title").textContent = item ? this._l("extra_edit") : this._l("shop_extra_add");
    r.getElementById("ei-name").value = item?.name || "";
    r.getElementById("ei-amount").value = item?.amount || "";
    r.getElementById("ei-unit").value = item?.unit || "";
    r.getElementById("ei-category").value = item?.shop_category || "overige";
    r.getElementById("ei-delete").style.display = item ? "inline-flex" : "none";
    this._modalMode = "extra";
    r.getElementById("extra-modal").classList.add("open");
    setTimeout(() => r.getElementById("ei-name").focus(), 50);
  }

  _saveExtraItem() {
    const r = this.shadowRoot;
    const name = r.getElementById("ei-name").value.trim();
    if (!name) { r.getElementById("ei-name").classList.add("invalid"); return; }
    r.getElementById("ei-name").classList.remove("invalid");
    const mode = this._modalMode || "extra";
    const editing = mode === "fixed" ? this._editingFixedProduct : this._editingExtraItem;
    const itemData = {
      id: editing?.id || (mode === "fixed" ? "f_" : "e_") + Date.now(),
      name,
      amount: parseFloat(r.getElementById("ei-amount").value) || 0,
      unit: r.getElementById("ei-unit").value.trim(),
      shop_category: r.getElementById("ei-category").value,
      checked: this._editingExtraItem?.checked || false,
    };
    r.getElementById("extra-modal").classList.remove("open");

    if (mode === "fixed") {
      const products = JSON.parse(JSON.stringify(this._fixedProducts));
      if (this._editingFixedProduct) {
        const idx = products.findIndex(i => i.id === this._editingFixedProduct.id);
        if (idx >= 0) products[idx] = itemData; else products.push(itemData);
      } else {
        products.push(itemData);
      }
      this._editingFixedProduct = null;
      this._saveFixedProducts(products);
    } else {
      const week = this._shoppingWeek;
      const { id, ...fields } = itemData;
      if (this._editingExtraItem) this._shopUpdateItem(week, this._editingExtraItem.id, fields);
      else this._shopAddItems(week, [fields]);
      this._editingExtraItem = null;
    }
  }

  _deleteExtraItem() {
    const r = this.shadowRoot;
    const mode = this._modalMode || "extra";
    r.getElementById("extra-modal").classList.remove("open");
    if (mode === "fixed") {
      if (!this._editingFixedProduct) return;
      const products = this._fixedProducts.filter(i => i.id !== this._editingFixedProduct.id);
      this._editingFixedProduct = null;
      this._saveFixedProducts(products);
    } else {
      if (!this._editingExtraItem) return;
      this._shopDeleteItem(this._shoppingWeek, this._editingExtraItem.id);
      this._editingExtraItem = null;
    }
  }

  async _fetchFixedProducts() {
    try {
      const res = await this._hass.callApi("GET", "meal_planner/fixed_products");
      this._fixedProducts = res || [];
      this._renderFixedProducts();
    } catch(e) { this._showError(this._l("error_load"), e); }
  }

  async _saveFixedProducts(products) {
    try {
      await this._hass.callApi("PUT", "meal_planner/fixed_products", products);
      this._fixedProducts = products;
      this._renderFixedProducts();
    } catch(e) { this._showError(this._l("error_save"), e); }
  }

  _renderFixedProducts() {
    const container = this.shadowRoot.getElementById("fixed-products-list");
    if (!container) return;
    if (!this._fixedProducts.length) {
      container.innerHTML = `<div class="empty-state"><div class="icon">${ic("pin-outline")}</div><p>${esc(this._l("shop_fixed_empty"))}<br>${esc(this._l("shop_fixed_empty_sub"))}</p></div>`;
      return;
    }
    container.innerHTML = "";
    const grouped = {};
    this._fixedProducts.forEach(p => {
      const cat = p.shop_category || "overige";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });
    Object.keys(grouped).sort().forEach(cat => {
      const section = document.createElement("div");
      section.className = "shop-category-section";
      section.innerHTML = `<div class="shop-cat-header">${esc(cat)}</div>`;
      grouped[cat].forEach(item => {
        const row = document.createElement("label");
        row.className = "shop-item";
        const amtStr = item.amount ? `${item.amount} ${item.unit || ""}`.trim() : "";
        const checked = (this._fixedChecked || new Set()).has(item.id);
        row.innerHTML = `
          <input type="checkbox" ${checked ? "checked" : ""} />
          <span class="item-name">${esc(item.name)}</span>
          ${amtStr ? `<span class="item-amount">${esc(amtStr)}</span>` : ""}
          <button class="icon-btn sm edit-fixed-btn" title="${esc(this._l("btn_edit"))}">${ic("pencil-outline")}</button>
          <button class="icon-btn sm danger del-fixed-btn" title="${esc(this._l("btn_delete"))}">${ic("delete-outline")}</button>`;
        const cb = row.querySelector("input");
        cb.addEventListener("change", e => {
          if (!this._fixedChecked) this._fixedChecked = new Set();
          if (e.target.checked) this._fixedChecked.add(item.id);
          else this._fixedChecked.delete(item.id);
        });
        row.querySelector(".edit-fixed-btn").addEventListener("click", e => { e.preventDefault(); this._openFixedProductModal(item); });
        row.querySelector(".del-fixed-btn").addEventListener("click", e => {
          e.preventDefault();
          if (!confirm(this._l("confirm_delete_fixed").replace("{name}", item.name || ""))) return;
          const products = this._fixedProducts.filter(p => p.id !== item.id);
          this._saveFixedProducts(products);
        });
        section.appendChild(row);
      });
      container.appendChild(section);
    });
  }

  async _addFixedToWeek() {
    if (!this._fixedChecked || !this._fixedChecked.size) {
      alert("Vink eerst een of meerdere producten aan.");
      return;
    }
    const week = this._shoppingWeek;
    const selected = this._fixedProducts
      .filter(p => this._fixedChecked.has(p.id))
      .map(p => ({
        name: p.name,
        amount: p.amount || 0,
        unit: p.unit || "",
        shop_category: p.shop_category || "overige",
      }));
    this._fixedChecked = new Set();
    await this._shopAddItems(week, selected, true);
    // Switch to week tab to show result
    const r = this.shadowRoot;
    r.getElementById("subtab-week").style.display = "";
    r.getElementById("subtab-fixed").style.display = "none";
    r.getElementById("subtab-week-btn").classList.add("active");
    r.getElementById("subtab-fixed-btn").classList.remove("active");
    this._renderFixedProducts();
  }

  _openFixedProductModal(item = null) {
    this._editingFixedProduct = item;
    this._editingExtraItem = null;
    this._modalMode = "fixed";
    const r = this.shadowRoot;
    r.getElementById("extra-modal-title").textContent = item ? this._l("fixed_edit_title") : this._l("fixed_add_title");
    r.getElementById("ei-name").value = item?.name || "";
    r.getElementById("ei-amount").value = item?.amount || "";
    r.getElementById("ei-unit").value = item?.unit || "";
    r.getElementById("ei-category").value = item?.shop_category || "overige";
    r.getElementById("ei-delete").style.display = item ? "inline-flex" : "none";
    r.getElementById("extra-modal").classList.add("open");
    setTimeout(() => r.getElementById("ei-name").focus(), 50);
  }

  // ─── RENDER PLANNER ────────────────────────────────────────────
  // "Tonight" lives in the header subtitle; today's row is highlighted.
  _renderToday() {
    const sub = this.shadowRoot.getElementById("kop-sub");
    const pil = this.shadowRoot.getElementById("kop-pil");
    if (pil) {
      const now = new Date();
      pil.textContent = `${this._labels.days_short[(now.getDay() + 6) % 7]} ${now.getDate()} ${now.toLocaleDateString("nl-BE", { month: "short" }).replace(".", "")}`;
    }
    if (!sub) return;
    const data = this._todayRecipe;
    const what = data?.recipe?.name || data?.nocook;
    sub.innerHTML = what
      ? `${esc(this._l("planner_tonight"))}: <b>${esc(what)}</b>`
      : esc(this._l("tonight_empty"));
  }

  _mealMeta(recipe) {
    const total = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    return total ? `<span>${ic("clock-outline")}${total} min</span>` : "";
  }

  _renderPlanner() {
    const r = this.shadowRoot;
    const weekLabel = r.getElementById("week-label");
    if (!weekLabel) return;
    const dates = getWeekDates(this._currentWeek);
    const todayStr = new Date().toDateString();
    const fmt = d => d.toLocaleDateString("nl-BE", { day: "numeric", month: "short" }).replace(".", "");
    weekLabel.innerHTML = `${esc(this._l("week"))} ${Number(this._currentWeek.split("-W")[1])}<small>${fmt(dates[0])} – ${fmt(dates[6])}</small>`;

    const grid = r.getElementById("week-grid");
    grid.innerHTML = "";
    const plan = this._getPlanning(this._currentWeek);
    const recipesMap = this._recipesMap();
    const ro = this._readonly;
    const change = (day, fn) => {
      const newPlan = JSON.parse(JSON.stringify(plan));
      newPlan.days[day] = newPlan.days[day] || { dinner: null, servings: 4 };
      fn(newPlan.days[day]);
      this._savePlanning(this._currentWeek, newPlan);
    };

    DAYS_NL.forEach((day, di) => {
      const dayData = plan.days?.[day] || { dinner: null, servings: 4 };
      const recipe = dayData.dinner ? recipesMap[dayData.dinner] : null;
      const nocook = dayData.nocook || null;
      const note = dayData.note || "";

      const row = document.createElement("div");
      row.className = "planner-row" + (dates[di].toDateString() === todayStr ? " today" : "");
      row.innerHTML = `
        <div class="planner-day-label">
          <span class="planner-day-name">${esc(this._labels.days_short[di])}</span>
          <span class="planner-day-date">${dates[di].getDate()}</span>
        </div>
        <div class="planner-main">
          <div class="planner-meal-slot${recipe || nocook ? " filled" : ""}"></div>
          ${note || !ro ? `<div class="planner-note${note ? "" : " empty"}" tabindex="${ro ? -1 : 0}">${ic("note-text-outline")}<span>${esc(note || this._l("planner_note_empty"))}</span></div>` : ""}
        </div>`;
      const slot = row.querySelector(".planner-meal-slot");
      const removeBtn = ro ? "" : `<button class="icon-btn sm danger planner-remove-btn" title="${esc(this._l("btn_delete"))}">${ic("close")}</button>`;

      if (recipe) {
        const img = safeImg(recipe.image);
        slot.innerHTML = `
          ${img ? `<img src="${esc(img)}" class="planner-meal-img" />` : `<div class="planner-meal-img planner-meal-emoji">${ic("silverware-fork-knife")}</div>`}
          <div class="planner-meal-info">
            <div class="planner-meal-name">${esc(recipe.name)}</div>
            <div class="planner-meal-meta">${this._mealMeta(recipe)}${ic("account-outline")}<input type="number" class="servings-inline" min="1" max="20" value="${esc(dayData.servings || 4)}" ${ro ? "disabled" : ""} /></div>
          </div>
          ${removeBtn}`;
        slot.addEventListener("click", () => this._openDetailModal(recipe));
        if (!ro) {
          const inp = slot.querySelector(".servings-inline");
          inp.addEventListener("click", e => e.stopPropagation());
          inp.addEventListener("change", e => change(day, d => { d.servings = parseInt(e.target.value) || 4; }));
          slot.querySelector(".planner-remove-btn").addEventListener("click", e => {
            e.stopPropagation();
            change(day, d => { d.dinner = null; });
          });
        }
      } else if (nocook) {
        slot.innerHTML = `<div class="planner-meal-nocook">${esc(nocook)}</div>${removeBtn}`;
        if (!ro) {
          slot.addEventListener("click", () => this._openPickModal(day, "dinner"));
          slot.querySelector(".planner-remove-btn").addEventListener("click", e => {
            e.stopPropagation();
            change(day, d => { d.nocook = null; });
          });
        }
      } else {
        slot.innerHTML = ro
          ? `<div class="planner-meal-empty">—</div>`
          : `<div class="planner-meal-empty">${ic("plus")}${esc(this._l("planner_empty").replace(/^\+\s*/, ""))}</div>`;
        if (!ro) slot.addEventListener("click", () => this._openPickModal(day, "dinner"));
      }

      if (!ro) {
        const noteEl = row.querySelector(".planner-note");
        const edit = () => this._editNote(day, plan, note);
        noteEl.addEventListener("click", edit);
        noteEl.addEventListener("keydown", e => { if (e.key === "Enter") edit(); });
      }
      grid.appendChild(row);
    });
  }

  _editNote(day, plan, currentNote) {
    const val = prompt("Notitie voor deze dag:", currentNote || "");
    if (val === null) return; // cancelled
    const newPlan = JSON.parse(JSON.stringify(plan));
    if (!newPlan.days[day]) newPlan.days[day] = { dinner: null, servings: 4 };
    newPlan.days[day].note = val.trim();
    this._savePlanning(this._currentWeek, newPlan);
  }

  // ─── RENDER RECIPES ────────────────────────────────────────────
  _stars(rating) {
    const n = Math.max(0, Math.min(5, rating | 0));
    if (!n) return "";
    return `<div class="star-display">${ic("star").repeat(n)}${`<span class="off">${ic("star-outline")}</span>`.repeat(5 - n)}</div>`;
  }

  _renderRecipes() {
    const grid = this.shadowRoot.getElementById("recipes-grid");
    if (!grid) return;
    let recipes = this._recipes;
    if (this._recipeFilter) recipes = recipes.filter(r =>
      r.name?.toLowerCase().includes(this._recipeFilter) ||
      r.description?.toLowerCase().includes(this._recipeFilter) ||
      r.tags?.some(t => t.includes(this._recipeFilter))
    );
    if (this._recipeCategoryFilter) recipes = recipes.filter(r => r.category === this._recipeCategoryFilter);
    if (this._favFilter) recipes = recipes.filter(r => r.favourite);
    // Sort: favourites first, then by rating, then by name
    recipes = [...recipes].sort((a, b) =>
      (b.favourite ? 1 : 0) - (a.favourite ? 1 : 0) ||
      (b.rating || 0) - (a.rating || 0) ||
      String(a.name || "").localeCompare(String(b.name || ""), "nl"));

    if (!recipes.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="icon">${ic("book-open-variant")}</div><p>${esc(this._l("recipes_empty"))}<br>${esc(this._l("recipes_empty_sub"))}</p></div>`;
      return;
    }
    grid.innerHTML = "";
    recipes.forEach(recipe => {
      const card = document.createElement("div");
      card.className = "recipe-card";
      const img = safeImg(recipe.image);
      const diffBadge = recipe.difficulty === "easy" ? "badge-green" : recipe.difficulty === "hard" ? "badge-red" : "badge-orange";
      card.innerHTML = `
        <div class="recipe-img">${img ? `<img src="${esc(img)}" loading="lazy" />` : ic("silverware-fork-knife")}</div>
        <div class="recipe-info">
          <div class="recipe-name">${esc(recipe.name)}</div>
          <div class="recipe-meta">
            ${this._mealMeta(recipe)}
            <span>${ic("account-outline")}${esc(recipe.servings || 4)}</span>
            <span class="badge ${diffBadge}">${esc(this._labels["diff_" + recipe.difficulty] || this._l("diff_medium"))}</span>
          </div>
          ${recipe.tags?.length ? `<div class="recipe-tags">${recipe.tags.slice(0,3).map(t => `<span class="recipe-tag">${esc(t)}</span>`).join("")}</div>` : ""}
          <div class="recipe-actions-row">
            ${this._stars(recipe.rating) || "<span></span>"}
            <div style="display:flex">
              <button class="icon-btn sm fav-btn ${recipe.favourite ? "active" : ""}" title="${esc(this._l("recipe_favourite"))}">${ic(recipe.favourite ? "heart" : "heart-outline")}</button>
              <button class="icon-btn sm edit-btn" title="${esc(this._l("btn_edit"))}">${ic("pencil-outline")}</button>
            </div>
          </div>
        </div>`;
      card.addEventListener("click", () => this._openDetailModal(recipe));
      card.querySelector(".edit-btn").addEventListener("click", e => {
        e.stopPropagation();
        this._openRecipeModal(recipe);
      });
      card.querySelector(".fav-btn").addEventListener("click", e => {
        e.stopPropagation();
        this._toggleFavourite(recipe);
      });
      grid.appendChild(card);
    });
  }

  // ─── RENDER SHOPPING ───────────────────────────────────────────
  _renderShoppingHeader() {
    const lbl = this.shadowRoot.getElementById("shop-week-label");
    if (!lbl) return;
    const dates = getWeekDates(this._shoppingWeek);
    const fmt = d => d.toLocaleDateString("nl-BE", { day: "numeric", month: "short" }).replace(".", "");
    lbl.innerHTML = `${esc(this._l("week"))} ${Number(this._shoppingWeek.split("-W")[1])} <span style="font-weight:400;color:var(--mp-sub);font-size:12px">· ${fmt(dates[0])} – ${fmt(dates[6])}</span>`;
  }

  _renderShopping() {
    this._renderShoppingHeader();
    const container = this.shadowRoot.getElementById("shopping-list");
    if (!container) return;
    const week = this._shoppingWeek;
    const shopping = this._shopping[week] || { items: [], extra_items: [] };
    const allItems = [...(shopping.items || []), ...(shopping.extra_items || [])];
    const fill = this.shadowRoot.getElementById("progress-fill");
    const txt = this.shadowRoot.getElementById("progress-text");
    const checked = allItems.filter(i => i.checked).length;
    if (fill) fill.style.width = (allItems.length ? Math.round(checked / allItems.length * 100) : 0) + "%";
    if (txt) txt.textContent = allItems.length
      ? this._l("checked_of").replace("{done}", checked).replace("{total}", allItems.length) : "";

    if (!allItems.length) {
      container.innerHTML = `<div class="empty-state"><div class="icon">${ic("cart-outline")}</div><p>${esc(this._l("shop_empty"))}<br>${esc(this._l("shop_empty_sub"))}</p></div>`;
      return;
    }

    // Group by shop category, in the order of the category list
    const grouped = {};
    allItems.forEach(item => {
      const cat = item.shop_category || "overige";
      (grouped[cat] = grouped[cat] || []).push(item);
    });
    const order = this._labels.shop_categories;
    const rank = c => { const i = order.indexOf(c); return i < 0 ? order.length : i; };
    const cats = Object.keys(grouped).sort((a, b) => {
      const aDone = grouped[a].every(i => i.checked), bDone = grouped[b].every(i => i.checked);
      return aDone - bDone || rank(a) - rank(b) || a.localeCompare(b);
    });

    container.innerHTML = "";
    cats.forEach(cat => {
      const section = document.createElement("div");
      section.className = "shop-category-section";
      section.innerHTML = `<div class="shop-cat-header">${esc(cat)}</div>`;
      grouped[cat].forEach(item => {
        const isExtra = String(item.id || "").startsWith("e_");
        const row = document.createElement("label");
        row.className = "shop-item" + (item.checked ? " checked" : "");
        const amtStr = item.amount ? `${item.amount} ${item.unit || ""}`.trim() : "";
        row.innerHTML = `
          <input type="checkbox" ${item.checked ? "checked" : ""} />
          <span class="item-name">${esc(item.name)}</span>
          ${amtStr ? `<span class="item-amount">${esc(amtStr)}</span>` : ""}
          ${isExtra ? `<button class="icon-btn sm edit-extra-btn" title="${esc(this._l("btn_edit"))}">${ic("pencil-outline")}</button>` : ""}
          <button class="icon-btn sm danger del-item-btn" title="${esc(this._l("btn_delete"))}">${ic("delete-outline")}</button>`;
        row.querySelector("input").addEventListener("change", e => {
          row.classList.toggle("checked", e.target.checked);
          this._shopUpdateItem(week, item.id, { checked: e.target.checked });
        });
        if (isExtra) {
          row.querySelector(".edit-extra-btn").addEventListener("click", e => {
            e.preventDefault(); e.stopPropagation();
            this._openExtraModal(item);
          });
        }
        row.querySelector(".del-item-btn").addEventListener("click", e => {
          e.preventDefault(); e.stopPropagation();
          row.remove();
          this._shopDeleteItem(week, item.id);
        });
        section.appendChild(row);
      });
      container.appendChild(section);
    });
  }

  // ─── PICK MEAL MODAL ───────────────────────────────────────────
  _openPickModal(day, mealType) {
    this._pickContext = { day, mealType };
    const r = this.shadowRoot;
    r.getElementById("pick-modal-title").textContent = `${this._labels.days_full[DAYS_NL.indexOf(day)]} — ${this._l("pick_title")}`;
    r.getElementById("pick-search").value = "";
    this._renderPickList("");
    r.getElementById("pick-modal").classList.add("open");
    if (window.matchMedia?.("(hover: hover)").matches) setTimeout(() => r.getElementById("pick-search").focus(), 50);
  }

  // Put a recipe on the day that is being picked
  _planRecipe(recipe) {
    const { day, mealType } = this._pickContext;
    const plan = JSON.parse(JSON.stringify(this._getPlanning(this._currentWeek)));
    plan.days[day] = plan.days[day] || { dinner: null, servings: this._defaultServings() };
    // a day that was empty starts from the card's default number of persons
    if (!plan.days[day][mealType] && this._config?.default_servings) plan.days[day].servings = this._defaultServings();
    plan.days[day][mealType] = recipe.id;
    plan.days[day].nocook = null;
    // "last eaten" is not set here: the backend derives it from the planning
    this._savePlanning(this._currentWeek, plan).then(() => this._fetchRecipes());
    this.shadowRoot.getElementById("pick-modal").classList.remove("open");
  }

  // Typed a meal that doesn't exist yet: make a minimal recipe and plan it
  async _planNewMeal(name) {
    if (this._creatingMeal) return;
    this._creatingMeal = true;
    try {
      const recipe = await this._hass.callApi("POST", "meal_planner/recipes", {
        name,
        category: this._dinnerCategory(),
        prep_time: 0,
        cook_time: 0,
        servings: this._defaultServings(),
      });
      this._recipes = [...this._recipes, recipe];
      this._renderRecipes();
      this._planRecipe(recipe);
    } catch (e) {
      this._showError(this._l("error_save"), e);
    } finally {
      this._creatingMeal = false;
    }
  }

  _renderPickList(raw = "") {
    const list = this.shadowRoot.getElementById("pick-list");
    const typed = String(raw).trim();
    const query = typed.toLowerCase();
    let recipes = [...this._recipes].sort((a, b) =>
      (b.favourite ? 1 : 0) - (a.favourite ? 1 : 0) || String(a.name || "").localeCompare(String(b.name || ""), "nl"));
    if (query) recipes = recipes.filter(r =>
      r.name?.toLowerCase().includes(query) ||
      r.category?.toLowerCase().includes(query) ||
      r.tags?.some(t => t.includes(query))
    );
    list.innerHTML = "";
    // Typed something that isn't an existing recipe: offer it as a new meal
    const exists = this._recipes.some(rc => String(rc.name || "").trim().toLowerCase() === query);
    if (typed && !exists) {
      const add = document.createElement("div");
      add.className = "pick-item pick-new";
      add.innerHTML = `
        <div class="pick-thumb">${ic("plus")}</div>
        <div>
          <div class="pick-name">${esc(this._l("pick_new").replace("{name}", typed))}</div>
          <div class="pick-meta">${esc(this._l("pick_new_sub"))}</div>
        </div>`;
      add.addEventListener("click", () => this._planNewMeal(typed));
      list.appendChild(add);
    }
    if (!recipes.length && !typed) {
      list.innerHTML = `<div class="empty-state"><div class="icon">${ic("magnify")}</div><p>${esc(this._l("recipes_empty"))}</p></div>`;
      return;
    }
    recipes.forEach(recipe => {
      const item = document.createElement("div");
      item.className = "pick-item";
      const img = safeImg(recipe.image);
      const total = (recipe.prep_time || 0) + (recipe.cook_time || 0);
      item.innerHTML = `
        <div class="pick-thumb">${img ? `<img src="${esc(img)}" loading="lazy" />` : ic("silverware-fork-knife")}</div>
        <div>
          <div class="pick-name">${esc(recipe.name)}</div>
          <div class="pick-meta">${[recipe.category, total ? `${total} min` : "", `${recipe.servings || 4} pers.`].filter(Boolean).map(esc).join(" · ")}</div>
        </div>`;
      item.addEventListener("click", () => this._planRecipe(recipe));
      list.appendChild(item);
    });
  }

  // ─── RECIPE DETAIL MODAL ───────────────────────────────────────
  _openDetailModal(recipe) {
    this._detailRecipe = recipe;
    const content = this.shadowRoot.getElementById("detail-content");
    const diffBadge = recipe.difficulty === "easy" ? "badge-green" : recipe.difficulty === "hard" ? "badge-red" : "badge-orange";
    const img = safeImg(recipe.image);
    const src = safeUrl(recipe.source_url);
    content.innerHTML = `
      ${img ? `<img src="${esc(img)}" class="recipe-detail-img" />` : ""}
      <h3 style="margin:0 0 6px">${esc(recipe.name)}</h3>
      ${recipe.description ? `<p class="recipe-detail-desc">${esc(recipe.description)}</p>` : ""}
      <div class="recipe-detail-meta">
        ${recipe.prep_time ? `<span>${ic("knife")}${esc(recipe.prep_time)} min</span>` : ""}
        ${recipe.cook_time ? `<span>${ic("pot-steam-outline")}${esc(recipe.cook_time)} min</span>` : ""}
        <span>${ic("account-outline")}${esc(recipe.servings || 4)} pers.</span>
        <span class="badge ${diffBadge}">${esc(this._labels["diff_" + recipe.difficulty] || this._l("diff_medium"))}</span>
        ${recipe.category ? `<span>${ic("folder-outline")}${esc(recipe.category)}</span>` : ""}
      </div>
      ${recipe.tags?.length ? `<div class="recipe-tags" style="margin:-4px 0 12px">${recipe.tags.map(t => `<span class="recipe-tag">${esc(t)}</span>`).join("")}</div>` : ""}
      ${src ? `<p class="detail-link"><a href="${esc(src)}" target="_blank" rel="noopener">${ic("open-in-new")}${esc(this._l("original_recipe"))}</a></p>` : ""}
      ${recipe.ingredients?.length ? `
        <div class="recipe-detail-section">
          <h4>${ic("basket-outline")}${esc(this._l("recipe_ingredients"))}</h4>
          ${recipe.ingredients.map(i => `
            <div class="ing-list-item">
              <span>${esc(i.name)}</span>
              <span>${esc(i.amount || "")} ${esc(i.unit)}</span>
            </div>`).join("")}
        </div>` : ""}
      ${recipe.steps?.length ? `
        <div class="recipe-detail-section">
          <h4>${ic("chef-hat")}${esc(this._l("recipe_steps"))}</h4>
          ${recipe.steps.map((s, i) => `
            <div class="step-detail">
              <div class="step-num">${i+1}</div>
              <div>${esc(s)}</div>
            </div>`).join("")}
        </div>` : ""}
      ${recipe.last_cooked ? `<p class="detail-foot">${esc(this._l("last_cooked"))}: ${new Date(recipe.last_cooked).toLocaleDateString("nl-BE")}</p>` : ""}
    `;
    this.shadowRoot.getElementById("detail-modal").classList.add("open");
  }
}

// ─── CARD EDITOR ──────────────────────────────────────────────
class MealPlannerCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  _set(key, value) {
    const cfg = { ...this._config };
    if (value === "" || value === null || value === undefined || value === false) delete cfg[key];
    else cfg[key] = value;
    this._config = cfg;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cfg }, bubbles: true, composed: true }));
  }

  _render() {
    const c = this._config;
    const cats = c.labels?.categories || DEFAULT_LABELS.categories;
    this.innerHTML = `
      <style>
        .editor { padding:8px 0; display:flex; flex-direction:column; gap:16px; }
        .editor label.t { display:block; font-size:12px; font-weight:600; color:var(--secondary-text-color); margin-bottom:4px; }
        .editor input[type=text], .editor input[type=number], .editor select {
          width:100%; padding:9px 10px; border:1px solid var(--divider-color); border-radius:8px; font-size:14px;
          background:color-mix(in srgb, var(--primary-text-color) 5%, transparent); color:var(--primary-text-color); box-sizing:border-box; font-family:inherit; }
        .editor select option { background:var(--card-background-color); color:var(--primary-text-color); }
        .editor .hint { font-size:12px; color:var(--secondary-text-color); margin-top:4px; }
        .editor .sw { display:flex; align-items:center; gap:10px; font-size:14px; color:var(--primary-text-color); cursor:pointer; }
        .editor .sw input { width:18px; height:18px; accent-color:var(--primary-color); margin:0; }
      </style>
      <div class="editor">
        <div>
          <label class="t">Titel</label>
          <input type="text" id="title" placeholder="${esc(DEFAULT_LABELS.title)}" value="${esc(c.title || "")}" />
        </div>
        <div>
          <label class="t">Standaard aantal personen</label>
          <input type="number" id="default-servings" min="1" max="20" placeholder="4" value="${esc(c.default_servings || "")}" />
          <div class="hint">Wordt ingevuld als je een recept op een lege dag zet.</div>
        </div>
        <div>
          <label class="t">Categorie voor "Willekeurig"</label>
          <select id="dinner-category">
            ${cats.map(cat => `<option value="${esc(cat)}" ${(c.dinner_category || cats[2]) === cat ? "selected" : ""}>${esc(cat)}</option>`).join("")}
          </select>
        </div>
        <label class="sw"><input type="checkbox" id="readonly" ${c.readonly ? "checked" : ""} /> Alleen bekijken (readonly)</label>
        <div class="hint">Teksten en categorieën zijn aanpasbaar via YAML onder <code>labels:</code> (zie README).</div>
      </div>
    `;
    this.querySelector("#title").addEventListener("change", e => this._set("title", e.target.value.trim()));
    this.querySelector("#default-servings").addEventListener("change", e => this._set("default_servings", parseInt(e.target.value) || null));
    this.querySelector("#dinner-category").addEventListener("change", e => this._set("dinner_category", e.target.value === cats[2] ? null : e.target.value));
    this.querySelector("#readonly").addEventListener("change", e => this._set("readonly", e.target.checked));
  }
}
// The integration loads this file itself; an old manual resource may load it
// a second time. Defining twice would throw, so only the first one counts.
if (!customElements.get("meal-planner-card")) {
  customElements.define("meal-planner-card-editor", MealPlannerCardEditor);
  customElements.define("meal-planner-card", MealPlannerCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "meal-planner-card",
    name: "Meal Planner",
    description: "Weekplanner met recepten, boodschappenlijst en meer.",
    preview: true,
  });
} else {
  console.info("MEAL-PLANNER-CARD already loaded, this copy is skipped (remove the manual resource)");
}
console.info(
  `%c MEAL-PLANNER-CARD %c v${MP_VERSION} `,
  "background:#03a9f4;color:#fff;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;",
  "background:#eee;color:#333;font-weight:700;padding:2px 6px;border-radius:0 4px 4px 0;"
);