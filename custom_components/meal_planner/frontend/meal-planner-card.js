/**
 * Meal Planner Card for Home Assistant
 * v1.0.0
 */

const MP_VERSION = "1.3.2";

const DAYS_NL = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const DAYS_LABEL = ["Ma","Di","Wo","Do","Vr","Za","Zo"];
const DAYS_FULL = ["Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag","Zondag"];
const MEAL_TYPES = ["breakfast","lunch","dinner"];
const MEAL_LABELS = { breakfast: "🌅 Ontbijt", lunch: "☀️ Lunch", dinner: "🌙 Avondeten" };
// Only dinner shown in planner
const PLANNER_MEAL = "dinner";
const DIFFICULTIES = { easy: "Makkelijk", medium: "Gemiddeld", hard: "Moeilijk" };
const CATEGORIES = ["ontbijt","lunch","avondeten","snack","dessert","soep","salade"];
const SHOP_CATEGORIES = [
  "groenten & fruit","vlees & vis","zuivel & eieren","brood & bakkerij",
  "pasta & rijst","conserven & sauzen","diepvries","dranken","snoep & koek","overige"
];

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

function isoToLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STYLES = `
  :host { display:block; font-family:'Segoe UI',system-ui,sans-serif; }
  ha-card { padding:0; overflow:hidden; }

  /* Tabs */
  .tabs { display:flex; background:var(--primary-color); }
  .tab { flex:1; padding:12px 6px; border:none; background:none; color:rgba(255,255,255,.7); font-size:.82em; font-weight:600; cursor:pointer; transition:all .2s; letter-spacing:.3px; }
  .tab.active { color:white; border-bottom:3px solid white; }
  .tab:hover { color:white; background:rgba(255,255,255,.1); }

  /* Content areas */
  .tab-content { display:none; padding:16px; }
  .tab-content.active { display:block; }

  /* ===== WEEK PLANNER ===== */
  .week-nav { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
  .week-nav button { background:none; border:1px solid var(--divider-color,#ddd); border-radius:6px; padding:5px 12px; cursor:pointer; color:var(--primary-text-color); font-size:.9em; }
  .week-nav button:hover { background:var(--secondary-background-color,#f5f5f5); }
  .week-label { font-weight:600; color:var(--primary-text-color); font-size:.95em; }
  /* ===== PLANNER ROWS ===== */
  .week-grid { display:flex; flex-direction:column; gap:6px; }
  .planner-row { display:flex; align-items:center; gap:0; border-radius:10px; overflow:hidden; border:1px solid var(--divider-color,#e8e8e8); transition:border-color .15s; background:var(--card-background-color,white); }
  .planner-row.today { border-color:var(--primary-color); }
  .planner-day-label { display:flex; flex-direction:column; justify-content:center; width:88px; min-width:88px; padding:10px 12px; background:var(--secondary-background-color,#f5f7fa); border-right:1px solid var(--divider-color,#e8e8e8); }
  .planner-row.today .planner-day-label { background:var(--primary-color); border-right-color:var(--primary-color); }
  .planner-day-name { font-weight:700; font-size:.88em; color:var(--primary-text-color); }
  .planner-row.today .planner-day-name { color:white; }
  .planner-day-date { font-size:.72em; color:var(--secondary-text-color); margin-top:2px; }
  .planner-row.today .planner-day-date { color:rgba(255,255,255,.75); }
  .planner-meal-slot { flex:1; display:flex; align-items:center; gap:10px; cursor:pointer; padding:8px 12px; min-height:56px; transition:background .15s; }
  .planner-meal-slot:hover { background:var(--secondary-background-color,#f5f5f5); }
  .planner-meal-slot.filled:hover { background:color-mix(in srgb, var(--primary-color) 8%, transparent); }
  .planner-meal-img { width:40px; height:40px; border-radius:8px; object-fit:cover; flex-shrink:0; }
  .planner-meal-emoji { display:flex; align-items:center; justify-content:center; font-size:1.4em; background:var(--secondary-background-color,#eee); border-radius:8px; }
  .planner-meal-info { flex:1; min-width:0; }
  .planner-meal-name { font-weight:700; font-size:.92em; color:var(--primary-text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .planner-meal-meta { font-size:.75em; color:var(--secondary-text-color); margin-top:3px; display:flex; align-items:center; gap:5px; }
  .servings-inline { width:34px; padding:2px 4px; border:1px solid var(--divider-color,#ddd); border-radius:4px; font-size:.9em; background:var(--input-fill-color,#f5f5f5); color:var(--primary-text-color); text-align:center; }
  .planner-meal-empty { flex:1; font-size:.85em; color:var(--secondary-text-color); opacity:.5; }
  .planner-remove-btn { background:none; border:none; border-radius:50%; width:28px; height:28px; font-size:14px; cursor:pointer; color:var(--secondary-text-color); display:flex; align-items:center; justify-content:center; flex-shrink:0; opacity:0; transition:opacity .15s; padding:0; line-height:1; }
  .planner-meal-slot:hover .planner-remove-btn { opacity:.5; }
  .planner-remove-btn:hover { opacity:1 !important; color:#e53935; }
  @media (hover: none) { .planner-remove-btn { opacity:.4; } .planner-remove-btn:active { color:#e53935; opacity:1; } }
  .week-actions { display:flex; gap:8px; margin-top:14px; flex-wrap:wrap; }
  .btn-action-copy { padding:7px 14px; border:none; border-radius:6px; cursor:pointer; font-size:.82em; font-weight:600; background:#e8f4fd; color:#1565c0; border:1px solid #bbdefb; transition:all .2s; }
  .btn-action-copy:hover { background:#1565c0; color:white; }
  .btn-action-random { padding:7px 14px; border:none; border-radius:6px; cursor:pointer; font-size:.82em; font-weight:600; background:#f3e5f5; color:#6a1b9a; border:1px solid #ce93d8; transition:all .2s; }
  .btn-action-random:hover { background:#6a1b9a; color:white; }

  .import-spinner { display:inline-block; width:14px; height:14px; border:2px solid var(--divider-color,#ddd); border-top-color:var(--primary-color); border-radius:50%; animation:spin .7s linear infinite; margin-right:6px; vertical-align:middle; }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* Stars */
  .star-rating { display:flex; gap:2px; }
  .star { font-size:1em; cursor:pointer; opacity:.3; transition:opacity .1s; line-height:1; }
  .star.active { opacity:1; }
  .star-display { font-size:.8em; letter-spacing:1px; }
  .fav-btn { background:none; border:none; cursor:pointer; font-size:1.1em; padding:0; line-height:1; opacity:.4; transition:opacity .15s, transform .15s; }
  .fav-btn.active { opacity:1; transform:scale(1.15); }

  /* Notitie */
  .planner-note { font-size:.75em; color:var(--secondary-text-color); padding:2px 10px 6px 12px; font-style:italic; cursor:pointer; }
  .planner-note.empty { opacity:.4; }
  .planner-note-input { width:100%; border:none; border-top:1px solid var(--divider-color,#eee); padding:6px 12px; font-size:.8em; font-family:inherit; background:transparent; color:var(--primary-text-color); outline:none; box-sizing:border-box; font-style:italic; }

  /* ===== RECIPES ===== */
  .recipe-toolbar { display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; align-items:center; }
  .search-input { flex:1; min-width:120px; padding:7px 10px; border:1px solid var(--divider-color,#ddd); border-radius:6px; font-size:.9em; background:var(--input-fill-color,#f5f5f5); color:var(--primary-text-color); font-family:inherit; }
  .filter-select { padding:7px 10px; border:1px solid var(--divider-color,#ddd); border-radius:6px; font-size:.85em; background:var(--input-fill-color,#f5f5f5); color:var(--primary-text-color); }
  .recipes-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:12px; }
  .recipe-card { border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.12); cursor:pointer; transition:transform .2s, box-shadow .2s; background:var(--card-background-color,white); }
  .recipe-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.18); }
  .recipe-img { width:100%; height:110px; object-fit:cover; background:var(--secondary-background-color,#f0f0f0); display:flex; align-items:center; justify-content:center; font-size:2.5em; }
  .recipe-img img { width:100%; height:100%; object-fit:cover; }
  .recipe-info { padding:9px; }
  .recipe-name { font-weight:700; font-size:.88em; margin-bottom:4px; }
  .recipe-meta { font-size:.72em; color:var(--secondary-text-color); display:flex; gap:6px; flex-wrap:wrap; }
  .recipe-tag { background:var(--primary-color); color:white; border-radius:10px; padding:1px 7px; font-size:.7em; }
  .recipe-actions-row { display:flex; gap:4px; margin-top:6px; }

  /* Sub-tabs */
  .sub-tabs { display:flex; gap:4px; margin-bottom:14px; border-bottom:2px solid var(--divider-color,#eee); }
  .sub-tab { background:none; border:none; padding:8px 14px; font-size:.85em; font-weight:600; cursor:pointer; color:var(--secondary-text-color); border-bottom:2px solid transparent; margin-bottom:-2px; transition:all .2s; }
  .sub-tab.active { color:var(--primary-color); border-bottom-color:var(--primary-color); }
  .sub-tab:hover { color:var(--primary-color); }

  /* ===== SHOPPING ===== */
  .shopping-header { display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; align-items:center; }
  .shop-week-label { font-weight:600; font-size:.95em; flex:1; color:var(--primary-text-color); }
  .shop-category-section { margin-bottom:16px; }
  .shop-cat-header { font-weight:700; font-size:.8em; color:var(--secondary-text-color); text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; padding-bottom:4px; border-bottom:1px solid var(--divider-color,#eee); }
  .shop-item { display:flex; align-items:center; gap:10px; padding:7px 4px; border-bottom:1px solid var(--divider-color,#f0f0f0); }
  .shop-item:last-child { border-bottom:none; }
  .shop-item input[type=checkbox] { width:18px; height:18px; cursor:pointer; flex-shrink:0; accent-color:var(--primary-color); }
  .shop-item.checked .item-name { text-decoration:line-through; opacity:.45; }
  .item-name { flex:1; font-size:.9em; }
  .item-amount { font-size:.82em; color:var(--secondary-text-color); white-space:nowrap; }
  .add-extra { display:flex; gap:6px; margin-top:12px; }
  .add-extra input { flex:1; padding:7px 10px; border:1px solid var(--divider-color,#ddd); border-radius:6px; font-size:.88em; background:var(--input-fill-color,#f5f5f5); color:var(--primary-text-color); font-family:inherit; }
  .progress-bar { background:var(--divider-color,#e0e0e0); border-radius:4px; height:6px; margin-bottom:14px; overflow:hidden; }
  .progress-fill { background:var(--primary-color); height:100%; border-radius:4px; transition:width .4s; }

  /* ===== TODAY WIDGET ===== */
  .today-card { background:linear-gradient(135deg,var(--primary-color),color-mix(in srgb,var(--primary-color) 70%,#000)); color:white; border-radius:10px; padding:16px; margin-bottom:16px; display:flex; gap:14px; align-items:center; }
  .today-img { width:70px; height:70px; border-radius:8px; object-fit:cover; background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; font-size:2em; flex-shrink:0; overflow:hidden; }
  .today-img img { width:100%; height:100%; object-fit:cover; }
  .today-info { flex:1; min-width:0; }
  .today-label { font-size:.72em; opacity:.8; font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
  .today-name { font-size:1.1em; font-weight:700; margin:2px 0 4px; }
  .today-meta { font-size:.78em; opacity:.85; }

  /* ===== MODALS ===== */
  .modal-overlay { display:none; position:fixed; top:0;left:0;right:0;bottom:0; background:rgba(0,0,0,.55); z-index:9999; align-items:center; justify-content:center; padding:12px; box-sizing:border-box; }
  .modal-overlay.open { display:flex; }
  .modal { background:var(--card-background-color,white); border-radius:14px; padding:22px; width:100%; max-width:560px; box-shadow:0 12px 40px rgba(0,0,0,.3); max-height:90vh; overflow-y:auto; }
  .modal h3 { margin:0 0 18px; color:var(--primary-text-color); font-size:1.1em; }
  .form-group { margin-bottom:13px; }
  .form-group label { display:block; font-size:.82em; margin-bottom:4px; color:var(--secondary-text-color); font-weight:600; }
  .form-group input,.form-group textarea,.form-group select { width:100%; padding:8px 10px; border:1px solid var(--divider-color,#e0e0e0); border-radius:6px; font-size:.9em; background:var(--input-fill-color,#f5f5f5); color:var(--primary-text-color); box-sizing:border-box; font-family:inherit; }
  .form-group textarea { resize:vertical; min-height:70px; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .form-row-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
  .modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:18px; }
  .btn { padding:8px 18px; border:none; border-radius:6px; cursor:pointer; font-size:.88em; font-weight:600; transition:filter .2s; }
  .btn-primary { background:var(--primary-color); color:white; }
  .btn-primary:hover { filter:brightness(.9); }
  .btn-secondary { background:var(--secondary-background-color,#e0e0e0); color:var(--primary-text-color); }
  .btn-danger { background:#e53935; color:white; }
  .btn-sm { padding:5px 10px; font-size:.78em; }

  /* Ingredients editor */
  .ing-row { display:grid; grid-template-columns:1fr 70px 90px 110px 22px; gap:5px; align-items:center; margin-bottom:5px; }
  .ing-row input,.ing-row select { padding:5px 7px; border:1px solid var(--divider-color,#ddd); border-radius:4px; font-size:.82em; background:var(--input-fill-color,#f5f5f5); color:var(--primary-text-color); width:100%; box-sizing:border-box; font-family:inherit; }
  .ing-row button { background:none; border:none; cursor:pointer; color:#e53935; font-size:15px; padding:0; line-height:1; }
  .ing-header { display:grid; grid-template-columns:1fr 70px 90px 110px 22px; gap:5px; font-size:.72em; color:var(--secondary-text-color); font-weight:600; margin-bottom:4px; }

  /* Steps editor */
  .step-row { display:flex; gap:6px; align-items:flex-start; margin-bottom:6px; }
  .step-num { background:var(--primary-color); color:white; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:.75em; font-weight:700; flex-shrink:0; margin-top:6px; }
  .step-row textarea { flex:1; padding:6px 8px; border:1px solid var(--divider-color,#ddd); border-radius:4px; font-size:.85em; background:var(--input-fill-color,#f5f5f5); color:var(--primary-text-color); font-family:inherit; resize:vertical; min-height:40px; }
  .step-row button { background:none; border:none; cursor:pointer; color:#e53935; font-size:15px; padding:4px; margin-top:4px; }

  /* Image upload */
  .img-upload { border:2px dashed var(--divider-color,#ddd); border-radius:8px; padding:14px; text-align:center; cursor:pointer; font-size:.85em; color:var(--secondary-text-color); }
  .img-upload:hover { border-color:var(--primary-color); }
  .img-preview { width:100%; max-height:160px; object-fit:cover; border-radius:6px; margin-top:8px; }

  /* Pick meal modal */
  .pick-search { width:100%; padding:8px 10px; border:1px solid var(--divider-color,#ddd); border-radius:6px; font-size:.9em; margin-bottom:10px; background:var(--input-fill-color,#f5f5f5); color:var(--primary-text-color); box-sizing:border-box; font-family:inherit; }
  .pick-list { max-height:320px; overflow-y:auto; }
  .pick-item { display:flex; align-items:center; gap:10px; padding:9px 8px; border-radius:7px; cursor:pointer; transition:background .15s; }
  .pick-item:hover { background:var(--secondary-background-color,#f5f5f5); }
  .pick-thumb { width:44px; height:44px; border-radius:6px; object-fit:cover; background:var(--secondary-background-color,#eee); display:flex; align-items:center; justify-content:center; font-size:1.4em; flex-shrink:0; overflow:hidden; }
  .pick-thumb img { width:100%; height:100%; object-fit:cover; }
  .pick-name { font-weight:600; font-size:.9em; }
  .pick-meta { font-size:.75em; color:var(--secondary-text-color); }

  /* Recipe detail modal */
  .recipe-detail-img { width:100%; max-height:200px; object-fit:cover; border-radius:8px; margin-bottom:14px; }
  .recipe-detail-meta { display:flex; gap:12px; flex-wrap:wrap; font-size:.82em; color:var(--secondary-text-color); margin-bottom:12px; }
  .recipe-detail-meta span { display:flex; align-items:center; gap:4px; }
  .recipe-detail-section { margin-bottom:14px; }
  .recipe-detail-section h4 { font-size:.88em; font-weight:700; color:var(--primary-text-color); margin:0 0 6px; border-bottom:1px solid var(--divider-color,#eee); padding-bottom:4px; }
  .ing-list-item { display:flex; justify-content:space-between; padding:4px 0; font-size:.85em; border-bottom:1px solid var(--divider-color,#f5f5f5); }
  .step-detail { display:flex; gap:9px; margin-bottom:8px; font-size:.85em; }

  /* Tags input */
  .tags-wrap { display:flex; flex-wrap:wrap; gap:5px; padding:5px; border:1px solid var(--divider-color,#ddd); border-radius:6px; background:var(--input-fill-color,#f5f5f5); min-height:36px; cursor:text; }
  .tag-chip { background:var(--primary-color); color:white; border-radius:10px; padding:2px 8px; font-size:.78em; display:flex; align-items:center; gap:4px; }
  .tag-chip button { background:none; border:none; color:white; cursor:pointer; padding:0; font-size:12px; line-height:1; opacity:.8; }
  .tags-wrap input { border:none; background:transparent; outline:none; font-size:.85em; color:var(--primary-text-color); min-width:80px; flex:1; font-family:inherit; }

  /* Misc */
  .empty-state { text-align:center; padding:32px 16px; color:var(--secondary-text-color); }
  .empty-state .icon { font-size:3em; margin-bottom:8px; }
  mark { background:#fff176; border-radius:2px; padding:0 1px; }
  .badge { display:inline-block; border-radius:10px; padding:2px 8px; font-size:.72em; font-weight:600; }
  .badge-green { background:#e8f5e9; color:#2e7d32; }
  .badge-orange { background:#fff3e0; color:#e65100; }
  .badge-red { background:#ffebee; color:#c62828; }
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
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this._initialized = true;
      this._render();
      this._fetchAll();
      hass.connection.subscribeEvents(() => this._fetchAll(), "meal_planner_updated");
    }
  }

  setConfig(config) { this._config = config || {}; }
  getCardSize() { return 6; }
  static getStubConfig() { return {}; }

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
    } catch(e) { console.error("MP recipes error:", e); }
  }

  async _fetchPlanning(week) {
    try {
      this._planning[week] = await this._hass.callApi("GET", `meal_planner/planning/${week}`);
      this._renderPlanner();
      return this._planning[week];
    } catch(e) { console.error("MP planning error:", e); }
  }

  async _fetchShopping(week) {
    try {
      this._shopping[week] = await this._hass.callApi("GET", `meal_planner/shopping/${week}`);
      this._renderShopping();
    } catch(e) { console.error("MP shopping error:", e); }
  }

  async _fetchToday() {
    try {
      const res = await this._hass.callApi("GET", "meal_planner/today");
      this._todayRecipe = res;
      this._renderToday();
    } catch(e) {}
  }

  async _savePlanning(week, data) {
    try {
      await this._hass.callApi("PUT", `meal_planner/planning/${week}`, data);
      this._planning[week] = data;
      this._renderPlanner();
    } catch(e) { console.error("MP save planning error:", e); }
  }

  async _saveRecipe(data, id = null) {
    try {
      if (id) {
        await this._hass.callApi("PUT", `meal_planner/recipes/${id}`, data);
      } else {
        await this._hass.callApi("POST", "meal_planner/recipes", data);
      }
      await this._fetchRecipes();
    } catch(e) { console.error("MP save recipe error:", e); }
  }

  async _deleteRecipe(id) {
    try {
      await this._hass.callApi("DELETE", `meal_planner/recipes/${id}`);
      await this._fetchRecipes();
    } catch(e) {}
  }

  async _generateShopping(week) {
    try {
      this._shopping[week] = await this._hass.callApi("POST", `meal_planner/shopping/${week}`, {});
      this._renderShopping();
    } catch(e) { console.error("MP shopping generate error:", e); }
  }

  async _saveShopping(week, data) {
    try {
      await this._hass.callApi("PUT", `meal_planner/shopping/${week}`, data);
      this._shopping[week] = data;
      this._renderShopping();
    } catch(e) {}
  }

  _recipesMap() {
    return Object.fromEntries(this._recipes.map(r => [r.id, r]));
  }

  _getPlanning(week) {
    return this._planning[week] || { days: Object.fromEntries(DAYS_NL.map(d => [d, { dinner: null, servings: 4 }])) };
  }

  // ─── RENDER SHELL ──────────────────────────────────────────────
  _render() {
    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <ha-card>
        <div class="tabs">
          <button class="tab active" data-tab="planner">📅 Weekplanner</button>
          <button class="tab" data-tab="recipes">📖 Recepten</button>
          <button class="tab" data-tab="shopping">🛒 Boodschappen</button>
        </div>

        <div class="tab-content active" id="tab-planner">
          <div id="today-widget"></div>
          <div class="week-nav">
            <button id="prev-week">◀ Vorige</button>
            <span class="week-label" id="week-label"></span>
            <button id="next-week">Volgende ▶</button>
          </div>
          <div class="week-grid" id="week-grid"></div>
          <div class="week-actions">
            <button class="btn btn-action-copy" id="copy-prev-week">📋 Kopieer vorige week</button>
            <button class="btn btn-action-random" id="random-dinners">🎲 Willekeurige avondmaaltijden</button>
          </div>
        </div>

        <div class="tab-content" id="tab-recipes">
          <div class="recipe-toolbar">
            <input class="search-input" id="recipe-search" placeholder="🔍 Zoek recepten..." />
            <select class="filter-select" id="recipe-cat-filter">
              <option value="">Alle categorieën</option>
              ${CATEGORIES.map(c => `<option value="${c}">${c.charAt(0).toUpperCase()+c.slice(1)}</option>`).join("")}
            </select>
            <button class="btn btn-secondary btn-sm" id="fav-filter-btn" title="Toon favorieten">⭐</button>
            <button class="btn btn-primary btn-sm" id="add-recipe-btn">+ Recept</button>
            <button class="btn btn-action-copy" id="import-recipe-btn">📥 Importeer URL</button>
          </div>
          <div class="recipes-grid" id="recipes-grid"></div>
        </div>

        <div class="tab-content" id="tab-shopping">
          <!-- Sub-tabs -->
          <div class="sub-tabs">
            <button class="sub-tab active" id="subtab-week-btn">📋 Weeklijst</button>
            <button class="sub-tab" id="subtab-fixed-btn">📌 Vaste producten</button>
          </div>

          <!-- Week shopping list -->
          <div id="subtab-week">
            <div class="shopping-header">
              <button class="btn btn-secondary btn-sm" id="shop-prev-week">◀</button>
              <span class="shop-week-label" id="shop-week-label"></span>
              <button class="btn btn-secondary btn-sm" id="shop-next-week">▶</button>
              <button class="btn btn-primary btn-sm" id="generate-shopping">🔄 Genereer</button>
            </div>
            <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>
            <div id="shopping-list"></div>
            <div style="margin-top:12px;">
              <button class="btn btn-secondary btn-sm" id="add-extra-btn" style="width:100%">+ Extra item toevoegen</button>
            </div>
          </div>

          <!-- Fixed products -->
          <div id="subtab-fixed" style="display:none">
            <p style="font-size:.85em;color:var(--secondary-text-color);margin:0 0 10px">
              Vink de producten aan die je wil toevoegen aan de weeklijst, en klik op <strong>Toevoegen</strong>.
            </p>
            <div id="fixed-products-list"></div>
            <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
              <button class="btn btn-secondary btn-sm" id="add-fixed-btn">+ Nieuw product</button>
              <button class="btn btn-primary btn-sm" id="fixed-add-to-week" style="flex:1">✅ Toevoegen aan weeklijst</button>
            </div>
          </div>
        </div>
      </ha-card>

      <!-- Extra Item Modal -->
      <div class="modal-overlay" id="extra-modal">
        <div class="modal" style="max-width:380px;">
          <h3 id="extra-modal-title">Extra item toevoegen</h3>
          <div class="form-group">
            <label>Naam *</label>
            <input type="text" id="ei-name" placeholder="vb. Melk, Zeep, ..." />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Hoeveelheid</label>
              <input type="number" id="ei-amount" placeholder="0" min="0" step="0.1" />
            </div>
            <div class="form-group">
              <label>Eenheid</label>
              <input type="text" id="ei-unit" placeholder="g / stuk / ml / l" />
            </div>
          </div>
          <div class="form-group">
            <label>Winkelcategorie</label>
            <select id="ei-category">
              ${SHOP_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join("")}
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="ei-cancel">Annuleren</button>
            <button class="btn btn-danger btn-sm" id="ei-delete" style="display:none">Verwijderen</button>
            <button class="btn btn-primary" id="ei-save">Opslaan</button>
          </div>
        </div>
      </div>

      <!-- Pick Meal Modal -->
      <div class="modal-overlay" id="pick-modal">
        <div class="modal">
          <h3 id="pick-modal-title">Kies een recept</h3>
          <input class="pick-search" id="pick-search" placeholder="🔍 Zoeken..." />
          <div class="pick-list" id="pick-list"></div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="pick-cancel">Annuleren</button>
          </div>
        </div>
      </div>

      <!-- Recipe Edit Modal -->
      <!-- URL Import Modal -->
      <div class="modal-overlay" id="import-modal">
        <div class="modal" style="max-width:420px;">
          <h3>📥 Recept importeren</h3>
          <p style="font-size:.85em;color:var(--secondary-text-color);margin:0 0 14px">
            Plak een link van Dagelijkse Kost, Njam, of een andere receptensite.
          </p>
          <div class="form-group">
            <label>URL</label>
            <input type="url" id="import-url" placeholder="https://dagelijksekost.vrt.be/recepten/..." style="width:100%;box-sizing:border-box;" />
          </div>
          <div id="import-status" style="font-size:.83em;margin:8px 0;min-height:20px;"></div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="import-cancel">Annuleren</button>
            <button class="btn btn-primary" id="import-fetch-btn">🔍 Ophalen</button>
          </div>
        </div>
      </div>

      <div class="modal-overlay" id="recipe-modal">
        <div class="modal">
          <h3 id="recipe-modal-title">Nieuw Recept</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Naam *</label>
              <input type="text" id="rm-name" placeholder="Naam van het recept" />
            </div>
            <div class="form-group">
              <label>Categorie</label>
              <select id="rm-category">
                ${CATEGORIES.map(c => `<option value="${c}">${c.charAt(0).toUpperCase()+c.slice(1)}</option>`).join("")}
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Beschrijving</label>
            <textarea id="rm-description" placeholder="Korte beschrijving..."></textarea>
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label>Personen</label>
              <input type="number" id="rm-servings" value="4" min="1" max="20" />
            </div>
            <div class="form-group">
              <label>Bereidingstijd (min)</label>
              <input type="number" id="rm-prep" value="15" min="0" />
            </div>
            <div class="form-group">
              <label>Kooktijd (min)</label>
              <input type="number" id="rm-cook" value="30" min="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Moeilijkheid</label>
              <select id="rm-difficulty">
                <option value="easy">Makkelijk</option>
                <option value="medium" selected>Gemiddeld</option>
                <option value="hard">Moeilijk</option>
              </select>
            </div>
            <div class="form-group">
              <label>Bron URL</label>
              <input type="url" id="rm-source" placeholder="https://..." />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Beoordeling</label>
              <div class="star-rating" id="rm-star-rating">
                <span class="star" data-val="1">⭐</span>
                <span class="star" data-val="2">⭐</span>
                <span class="star" data-val="3">⭐</span>
                <span class="star" data-val="4">⭐</span>
                <span class="star" data-val="5">⭐</span>
              </div>
            </div>
            <div class="form-group" style="display:flex;align-items:center;gap:8px;padding-top:22px;">
              <input type="checkbox" id="rm-favourite" style="width:18px;height:18px;accent-color:var(--primary-color);" />
              <label for="rm-favourite" style="margin:0;font-size:.88em;cursor:pointer;">❤️ Favoriet</label>
            </div>
          </div>
          <div class="form-group">
            <label>Tags</label>
            <div class="tags-wrap" id="rm-tags-wrap">
              <input type="text" id="rm-tag-input" placeholder="Tag toevoegen + Enter..." />
            </div>
          </div>
          <div class="form-group">
            <label>Foto</label>
            <div class="img-upload" id="rm-img-upload">📷 Klik of sleep een foto
              <input type="file" id="rm-img-file" accept="image/*" style="display:none" />
            </div>
            <img id="rm-img-preview" class="img-preview" style="display:none" />
          </div>
          <div class="form-group">
            <label>Ingrediënten</label>
            <div class="ing-header"><span>Naam</span><span>Hoeveelheid</span><span>Eenheid</span><span>Winkelcategorie</span><span></span></div>
            <div id="rm-ingredients"></div>
            <button class="btn btn-secondary btn-sm" id="rm-add-ing" style="margin-top:5px">+ Ingrediënt</button>
          </div>
          <div class="form-group">
            <label>Bereiding</label>
            <div id="rm-steps"></div>
            <button class="btn btn-secondary btn-sm" id="rm-add-step" style="margin-top:5px">+ Stap</button>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="rm-cancel">Annuleren</button>
            <button class="btn btn-danger btn-sm" id="rm-delete" style="display:none">Verwijderen</button>
            <button class="btn btn-primary" id="rm-save">Opslaan</button>
          </div>
        </div>
      </div>

      <!-- Recipe Detail Modal -->
      <div class="modal-overlay" id="detail-modal">
        <div class="modal">
          <div id="detail-content"></div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="detail-close">Sluiten</button>
            <button class="btn btn-secondary" id="detail-edit">✏️ Bewerken</button>
          </div>
        </div>
      </div>
    `;
    this._setupListeners();
  }

  // ─── EVENT LISTENERS ──────────────────────────────────────────
  _setupListeners() {
    const r = this.shadowRoot;

    // Tabs
    r.querySelectorAll(".tab").forEach(tab => {
      tab.addEventListener("click", () => {
        this._activeTab = tab.dataset.tab;
        r.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
        r.querySelectorAll(".tab-content").forEach(c => c.classList.toggle("active", c.id === `tab-${this._activeTab}`));
      });
    });

    // Planner nav
    r.getElementById("prev-week").addEventListener("click", () => {
      this._currentWeek = prevWeek(this._currentWeek);
      this._fetchPlanning(this._currentWeek);
    });
    r.getElementById("next-week").addEventListener("click", () => {
      this._currentWeek = nextWeek(this._currentWeek);
      this._fetchPlanning(this._currentWeek);
    });
    r.getElementById("copy-prev-week").addEventListener("click", () => {
      const prev = prevWeek(this._currentWeek);
      const prevPlan = this._planning[prev];
      if (prevPlan) {
        this._savePlanning(this._currentWeek, JSON.parse(JSON.stringify(prevPlan)));
      } else {
        (async () => {
          await this._fetchPlanning(prev);
          const p = this._planning[prev];
          if (p) this._savePlanning(this._currentWeek, JSON.parse(JSON.stringify(p)));
        })();
      }
    });
    r.getElementById("random-dinners").addEventListener("click", () => {
      const plan = JSON.parse(JSON.stringify(this._getPlanning(this._currentWeek)));
      const dinnerRecipes = this._recipes.filter(r => r.category === "avondeten" || !r.category);
      if (!dinnerRecipes.length) return;
      DAYS_NL.forEach(day => {
        const rand = dinnerRecipes[Math.floor(Math.random() * dinnerRecipes.length)];
        plan.days[day].dinner = rand.id;
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
        this._currentRating = val;
        r.querySelectorAll("#rm-star-rating .star").forEach(s => s.classList.toggle("active", parseInt(s.dataset.val) <= val));
      });
    });
    // Favourites filter
    r.getElementById("fav-filter-btn").addEventListener("click", () => {
      this._favFilter = !this._favFilter;
      r.getElementById("fav-filter-btn").style.opacity = this._favFilter ? "1" : ".6";
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
    r.getElementById("rm-img-file").addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        r.getElementById("rm-img-preview").src = ev.target.result;
        r.getElementById("rm-img-preview").style.display = "block";
      };
      reader.readAsDataURL(file);
      e.target.value = "";
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
      if (this._editingRecipe) {
        this._deleteRecipe(this._editingRecipe.id);
        r.getElementById("recipe-modal").classList.remove("open");
      }
    });

    // Pick modal
    r.getElementById("pick-cancel").addEventListener("click", () => r.getElementById("pick-modal").classList.remove("open"));
    r.getElementById("pick-search").addEventListener("input", e => this._renderPickList(e.target.value.toLowerCase()));

    // Detail modal
    r.getElementById("detail-close").addEventListener("click", () => r.getElementById("detail-modal").classList.remove("open"));
    r.getElementById("detail-edit").addEventListener("click", () => {
      r.getElementById("detail-modal").classList.remove("open");
      if (this._detailRecipe) this._openRecipeModal(this._detailRecipe);
    });
  }

  _addTagChip(text) {
    const wrap = this.shadowRoot.getElementById("rm-tags-wrap");
    const chip = document.createElement("span");
    chip.className = "tag-chip";
    chip.dataset.value = text;
    chip.innerHTML = `${text}<button type="button">×</button>`;
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
    row.innerHTML = `
      <input type="text" placeholder="Naam" value="${ing.name || ""}" class="ing-name" />
      <input type="number" placeholder="0" value="${ing.amount || ""}" class="ing-amount" min="0" step="0.1" />
      <input type="text" placeholder="g / stuk / ml" value="${ing.unit || ""}" class="ing-unit" />
      <select class="ing-shopcat">
        ${SHOP_CATEGORIES.map(c => `<option value="${c}" ${ing.shop_category === c ? "selected" : ""}>${c}</option>`).join("")}
      </select>
      <button type="button">🗑</button>
    `;
    row.querySelector("button").addEventListener("click", () => row.remove());
    container.appendChild(row);
  }

  _addStepRow(text = "") {
    const container = this.shadowRoot.getElementById("rm-steps");
    const num = container.children.length + 1;
    const row = document.createElement("div");
    row.className = "step-row";
    row.innerHTML = `<div class="step-num">${num}</div><textarea placeholder="Beschrijf stap ${num}...">${text}</textarea><button type="button">🗑</button>`;
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
    if (!url) { r.getElementById("import-status").innerHTML = '<span style="color:#e53935">Vul een URL in.</span>'; return; }
    const status = r.getElementById("import-status");
    const btn = r.getElementById("import-fetch-btn");
    status.innerHTML = '<span class="import-spinner"></span> Bezig met ophalen...';
    btn.disabled = true;
    try {
      const result = await this._hass.callApi("POST", "meal_planner/import_recipe", { url });
      if (result.error) {
        status.innerHTML = `<span style="color:#e53935">❌ ${result.error}</span>`;
        btn.disabled = false;
        return;
      }
      r.getElementById("import-modal").classList.remove("open");
      this._openRecipeModal(result);
    } catch(e) {
      status.innerHTML = '<span style="color:#e53935">❌ Kon de pagina niet ophalen. Probeer een andere URL.</span>';
      btn.disabled = false;
    }
  }

  _openRecipeModal(recipe = null) {
    const r = this.shadowRoot;
    this._editingRecipe = recipe;
    r.getElementById("recipe-modal-title").textContent = recipe ? "Recept bewerken" : "Nieuw Recept";
    r.getElementById("rm-name").value = recipe?.name || "";
    r.getElementById("rm-description").value = recipe?.description || "";
    r.getElementById("rm-category").value = recipe?.category || "avondeten";
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
    if (recipe?.image) { preview.src = recipe.image; preview.style.display = "block"; }
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
    if (!name) { r.getElementById("rm-name").style.borderColor = "red"; return; }
    r.getElementById("rm-name").style.borderColor = "";
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
      image: preview.style.display !== "none" ? preview.src : null,
      ingredients: this._getIngredients(),
      steps: this._getSteps(),
    };
    r.getElementById("recipe-modal").classList.remove("open");
    await this._saveRecipe(data, this._editingRecipe?.id || null);
  }

  _openExtraModal(item = null) {
    const r = this.shadowRoot;
    this._editingExtraItem = item;
    r.getElementById("extra-modal-title").textContent = item ? "Item bewerken" : "Extra item toevoegen";
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
    if (!name) { r.getElementById("ei-name").style.borderColor = "red"; return; }
    r.getElementById("ei-name").style.borderColor = "";
    const mode = this._modalMode || "extra";
    const itemData = {
      id: (this._editingExtraItem || this._editingFixedProduct)?.id || (mode === "fixed" ? "f_" : "e_") + Date.now(),
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
      const shopping = JSON.parse(JSON.stringify(this._shopping[week] || { items: [], extra_items: [] }));
      shopping.extra_items = shopping.extra_items || [];
      if (this._editingExtraItem) {
        const idx = shopping.extra_items.findIndex(i => i.id === this._editingExtraItem.id);
        if (idx >= 0) shopping.extra_items[idx] = itemData;
      } else {
        shopping.extra_items.push(itemData);
      }
      this._saveShopping(week, shopping);
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
      const week = this._shoppingWeek;
      const shopping = JSON.parse(JSON.stringify(this._shopping[week] || { items: [], extra_items: [] }));
      shopping.extra_items = (shopping.extra_items || []).filter(i => i.id !== this._editingExtraItem.id);
      this._saveShopping(week, shopping);
    }
  }

  async _fetchFixedProducts() {
    try {
      const res = await this._hass.callApi("GET", "meal_planner/fixed_products");
      this._fixedProducts = res || [];
      this._renderFixedProducts();
    } catch(e) { this._fixedProducts = []; }
  }

  async _saveFixedProducts(products) {
    try {
      await this._hass.callApi("PUT", "meal_planner/fixed_products", products);
      this._fixedProducts = products;
      this._renderFixedProducts();
    } catch(e) { console.error("MP fixed products error:", e); }
  }

  _renderFixedProducts() {
    const container = this.shadowRoot.getElementById("fixed-products-list");
    if (!container) return;
    if (!this._fixedProducts.length) {
      container.innerHTML = `<div style="text-align:center;padding:24px 12px;color:var(--secondary-text-color);font-size:.85em;">Nog geen vaste producten.<br>Klik op <strong>+ Nieuw product</strong> om te beginnen.</div>`;
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
      section.innerHTML = `<div class="shop-cat-header">📦 ${cat}</div>`;
      grouped[cat].forEach(item => {
        const row = document.createElement("div");
        row.className = "shop-item";
        const amtStr = item.amount ? `${item.amount} ${item.unit || ""}`.trim() : "";
        const checked = (this._fixedChecked || new Set()).has(item.id);
        row.innerHTML = `
          <input type="checkbox" ${checked ? "checked" : ""} style="width:18px;height:18px;cursor:pointer;flex-shrink:0;accent-color:var(--primary-color);" />
          <span class="item-name" style="flex:1">${item.name}</span>
          ${amtStr ? `<span class="item-amount">${amtStr}</span>` : ""}
          <button class="edit-fixed-btn" title="Bewerken" style="background:none;border:none;cursor:pointer;font-size:13px;padding:2px 4px;opacity:.4;color:var(--primary-text-color);">✏️</button>
          <button class="del-fixed-btn" title="Verwijderen" style="background:none;border:none;cursor:pointer;font-size:13px;padding:2px 4px;opacity:.4;color:#e53935;">🗑️</button>`;
        const cb = row.querySelector("input");
        cb.addEventListener("change", e => {
          if (!this._fixedChecked) this._fixedChecked = new Set();
          if (e.target.checked) this._fixedChecked.add(item.id);
          else this._fixedChecked.delete(item.id);
        });
        row.querySelector(".edit-fixed-btn").addEventListener("click", () => this._openFixedProductModal(item));
        row.querySelector(".del-fixed-btn").addEventListener("click", () => {
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
    const shopping = JSON.parse(JSON.stringify(this._shopping[week] || { items: [], extra_items: [] }));
    shopping.extra_items = shopping.extra_items || [];
    const selected = this._fixedProducts.filter(p => this._fixedChecked.has(p.id));
    selected.forEach(p => {
      const alreadyExists = shopping.extra_items.some(i => i.name.toLowerCase() === p.name.toLowerCase());
      if (!alreadyExists) {
        shopping.extra_items.push({
          id: "e_" + Date.now() + "_" + Math.random().toString(36).slice(2,6),
          name: p.name,
          amount: p.amount || 0,
          unit: p.unit || "",
          shop_category: p.shop_category || "overige",
          checked: false,
        });
      }
    });
    this._fixedChecked = new Set();
    await this._saveShopping(week, shopping);
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
    r.getElementById("extra-modal-title").textContent = item ? "Vast product bewerken" : "Vast product toevoegen";
    r.getElementById("ei-name").value = item?.name || "";
    r.getElementById("ei-amount").value = item?.amount || "";
    r.getElementById("ei-unit").value = item?.unit || "";
    r.getElementById("ei-category").value = item?.shop_category || "overige";
    r.getElementById("ei-delete").style.display = item ? "inline-flex" : "none";
    r.getElementById("extra-modal").classList.add("open");
    setTimeout(() => r.getElementById("ei-name").focus(), 50);
  }

  // ─── RENDER PLANNER ────────────────────────────────────────────
  _renderToday() {
    const widget = this.shadowRoot.getElementById("today-widget");
    if (!widget) return;
    const data = this._todayRecipe;
    if (!data?.recipe) { widget.innerHTML = ""; return; }
    const recipe = data.recipe;
    const imgHtml = recipe.image
      ? `<div class="today-img"><img src="${recipe.image}" /></div>`
      : `<div class="today-img" style="display:flex;align-items:center;justify-content:center;">🍽️</div>`;
    const total = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    widget.innerHTML = `
      <div class="today-card">
        ${imgHtml}
        <div class="today-info">
          <div class="today-label">🌙 Vanavond</div>
          <div class="today-name">${recipe.name}</div>
          <div class="today-meta">${total ? `⏱ ${total} min` : ""} ${recipe.servings ? `· 👤 ${recipe.servings} pers.` : ""}</div>
        </div>
      </div>`;
  }

  _renderPlanner() {
    const r = this.shadowRoot;
    const weekLabel = r.getElementById("week-label");
    if (!weekLabel) return;
    const dates = getWeekDates(this._currentWeek);
    const todayStr = new Date().toDateString();
    weekLabel.textContent = `Week ${this._currentWeek.split("-W")[1]} — ${this._currentWeek.split("-W")[0]}`;

    const grid = r.getElementById("week-grid");
    grid.innerHTML = "";
    grid.style.cssText = "";
    const plan = this._getPlanning(this._currentWeek);
    const recipesMap = this._recipesMap();

    DAYS_NL.forEach((day, di) => {
      const dayData = plan.days?.[day] || { dinner: null, servings: 4 };
      const isToday = dates[di].toDateString() === todayStr;
      const recipeId = dayData.dinner;
      const recipe = recipeId ? recipesMap[recipeId] : null;

      const row = document.createElement("div");
      row.className = "planner-row" + (isToday ? " today" : "");

      // Day label
      const dayLabel = document.createElement("div");
      dayLabel.className = "planner-day-label";
      dayLabel.innerHTML = `<span class="planner-day-name">${DAYS_FULL[di]}</span><span class="planner-day-date">${dates[di].getDate()}/${dates[di].getMonth()+1}</span>`;
      row.appendChild(dayLabel);

      // Meal slot
      const slot = document.createElement("div");
      slot.className = "planner-meal-slot" + (recipe ? " filled" : "");
      if (recipe) {
        const imgHtml = recipe.image
          ? `<img src="${recipe.image}" class="planner-meal-img" />`
          : `<div class="planner-meal-img planner-meal-emoji">🍽️</div>`;
        slot.innerHTML = `
          ${imgHtml}
          <div class="planner-meal-info">
            <div class="planner-meal-name">${recipe.name}</div>
            <div class="planner-meal-meta">${((recipe.prep_time||0)+(recipe.cook_time||0)) ? `⏱ ${(recipe.prep_time||0)+(recipe.cook_time||0)}m · ` : ""}👤 <input type="number" class="servings-inline" min="1" max="20" value="${dayData.servings||4}" /></div>
          </div>
          <button class="planner-remove-btn">×</button>`;
        slot.querySelector(".planner-remove-btn").addEventListener("click", e => {
          e.stopPropagation();
          const newPlan = JSON.parse(JSON.stringify(plan));
          newPlan.days[day].dinner = null;
          this._savePlanning(this._currentWeek, newPlan);
        });
        slot.querySelector(".servings-inline").addEventListener("change", e => {
          e.stopPropagation();
          const newPlan = JSON.parse(JSON.stringify(plan));
          newPlan.days[day].servings = parseInt(e.target.value) || 4;
          this._savePlanning(this._currentWeek, newPlan);
        });
        slot.querySelector(".servings-inline").addEventListener("click", e => e.stopPropagation());
        slot.addEventListener("click", () => this._openDetailModal(recipe));
      } else {
        slot.innerHTML = `<div class="planner-meal-empty">+ Kies maaltijd</div>`;
        slot.addEventListener("click", () => this._openPickModal(day, "dinner"));
      }
      row.appendChild(slot);

      // Day note
      const note = dayData.note || "";
      const noteEl = document.createElement("div");
      if (noteEl) {
        // We'll add note as a full-width row below
      }
      grid.appendChild(row);

      // Note row
      const noteRow = document.createElement("div");
      noteRow.style.cssText = "margin:-4px 0 4px;";
      noteRow.innerHTML = `<div class="planner-note ${note ? "" : "empty"}" data-day="${day}">
        ${note ? `📝 ${note}` : "＋ notitie toevoegen"}
      </div>`;
      noteRow.querySelector(".planner-note").addEventListener("click", () => this._editNote(day, plan, note));
      grid.appendChild(noteRow);
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
    // Sort: favourites first, then by rating desc
    recipes = [...recipes].sort((a, b) => {
      if (b.favourite !== a.favourite) return (b.favourite ? 1 : 0) - (a.favourite ? 1 : 0);
      return (b.rating || 0) - (a.rating || 0);
    });

    if (!recipes.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="icon">📖</div><p>Geen recepten gevonden.<br>Klik op + Recept om te beginnen.</p></div>`;
      return;
    }
    grid.innerHTML = "";
    recipes.forEach(recipe => {
      const card = document.createElement("div");
      card.className = "recipe-card";
      const imgHtml = recipe.image
        ? `<div class="recipe-img"><img src="${recipe.image}" /></div>`
        : `<div class="recipe-img" style="display:flex;align-items:center;justify-content:center;">🍽️</div>`;
      const total = (recipe.prep_time || 0) + (recipe.cook_time || 0);
      const diffBadge = recipe.difficulty === "easy" ? "badge-green" : recipe.difficulty === "hard" ? "badge-red" : "badge-orange";
      card.innerHTML = `
        ${imgHtml}
        <div class="recipe-info">
          <div class="recipe-name">${recipe.name}</div>
          <div class="recipe-meta">
            ${total ? `<span>⏱ ${total}m</span>` : ""}
            <span>👤 ${recipe.servings || 4}</span>
            <span class="badge ${diffBadge}">${DIFFICULTIES[recipe.difficulty] || "Gemiddeld"}</span>
          </div>
          ${recipe.tags?.length ? `<div style="margin-top:5px;display:flex;gap:3px;flex-wrap:wrap">${recipe.tags.slice(0,3).map(t=>`<span class="recipe-tag">${t}</span>`).join("")}</div>` : ""}
          <div class="recipe-actions-row" style="justify-content:space-between;align-items:center;">
            <div class="star-display">${"⭐".repeat(recipe.rating||0)}${"☆".repeat(5-(recipe.rating||0))}</div>
            <div style="display:flex;gap:4px;">
              <button class="fav-btn ${recipe.favourite ? "active" : ""}" title="Favoriet">❤️</button>
              <button class="btn btn-secondary btn-sm edit-btn">✏️</button>
            </div>
          </div>
        </div>`;
      card.addEventListener("click", e => {
        if (!e.target.closest(".edit-btn") && !e.target.closest(".fav-btn")) this._openDetailModal(recipe);
      });
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
    if (lbl) {
      const wn = this._shoppingWeek.split("-W")[1];
      const yr = this._shoppingWeek.split("-W")[0];
      lbl.textContent = `Week ${wn} — ${yr}`;
    }
  }

  _renderShopping() {
    this._renderShoppingHeader();
    const container = this.shadowRoot.getElementById("shopping-list");
    if (!container) return;
    const week = this._shoppingWeek;
    const shopping = this._shopping[week] || { items: [], extra_items: [] };
    const allItems = [...(shopping.items || []), ...(shopping.extra_items || [])];

    if (!allItems.length) {
      container.innerHTML = `<div class="empty-state"><div class="icon">🛒</div><p>Nog geen boodschappenlijst.<br>Klik op 🔄 Genereer om te starten.</p></div>`;
      const fill = this.shadowRoot.getElementById("progress-fill");
      if (fill) fill.style.width = "0%";
      return;
    }

    // Progress
    const checked = allItems.filter(i => i.checked).length;
    const pct = Math.round((checked / allItems.length) * 100);
    const fill = this.shadowRoot.getElementById("progress-fill");
    if (fill) fill.style.width = pct + "%";

    // Group by shop_category
    const grouped = {};
    allItems.forEach(item => {
      const cat = item.shop_category || "overige";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    container.innerHTML = "";
    // Sort: unchecked categories first
    const cats = Object.keys(grouped).sort((a, b) => {
      const aChecked = grouped[a].every(i => i.checked);
      const bChecked = grouped[b].every(i => i.checked);
      return aChecked - bChecked || a.localeCompare(b);
    });

    cats.forEach(cat => {
      const section = document.createElement("div");
      section.className = "shop-category-section";
      section.innerHTML = `<div class="shop-cat-header">📦 ${cat}</div>`;
      grouped[cat].forEach(item => {
        const isExtra = item.id && item.id.startsWith("e_");
        const row = document.createElement("div");
        row.className = "shop-item" + (item.checked ? " checked" : "");
        const amtStr = item.amount ? `${item.amount} ${item.unit || ""}`.trim() : "";
        row.innerHTML = `
          <input type="checkbox" ${item.checked ? "checked" : ""} />
          <span class="item-name">${item.name}</span>
          ${amtStr ? `<span class="item-amount">${amtStr}</span>` : ""}
          ${isExtra ? `<button class="edit-extra-btn" title="Bewerken" style="background:none;border:none;cursor:pointer;font-size:13px;padding:2px 4px;opacity:.4;color:var(--primary-text-color);flex-shrink:0;">✏️</button><button class="del-extra-btn" title="Verwijderen" style="background:none;border:none;cursor:pointer;font-size:13px;padding:2px 4px;opacity:.4;color:#e53935;flex-shrink:0;">🗑️</button>` : ""}`;
        row.querySelector("input").addEventListener("change", e => {
          const newChecked = e.target.checked;
          const newShopping = JSON.parse(JSON.stringify(shopping));
          [...(newShopping.items || []), ...(newShopping.extra_items || [])].forEach(i => {
            if (i.id === item.id) i.checked = newChecked;
          });
          this._saveShopping(week, newShopping);
        });
        if (isExtra) {
          row.querySelector(".edit-extra-btn").addEventListener("click", e => {
            e.stopPropagation();
            this._openExtraModal(item);
          });
          row.querySelector(".del-extra-btn").addEventListener("click", e => {
            e.stopPropagation();
            const newShopping = JSON.parse(JSON.stringify(shopping));
            newShopping.extra_items = (newShopping.extra_items || []).filter(i => i.id !== item.id);
            this._saveShopping(week, newShopping);
          });
        }
        section.appendChild(row);
      });
      container.appendChild(section);
    });
  }

  // ─── PICK MEAL MODAL ───────────────────────────────────────────
  _openPickModal(day, mealType) {
    this._pickContext = { day, mealType };
    const r = this.shadowRoot;
    r.getElementById("pick-modal-title").textContent = `${DAYS_FULL[DAYS_NL.indexOf(day)]} — ${MEAL_LABELS[mealType]}`;
    r.getElementById("pick-search").value = "";
    this._renderPickList("");
    r.getElementById("pick-modal").classList.add("open");
  }

  _renderPickList(query = "") {
    const list = this.shadowRoot.getElementById("pick-list");
    let recipes = this._recipes;
    if (query) recipes = recipes.filter(r =>
      r.name?.toLowerCase().includes(query) ||
      r.category?.toLowerCase().includes(query) ||
      r.tags?.some(t => t.includes(query))
    );
    if (!recipes.length) {
      list.innerHTML = `<div class="empty-state"><div class="icon">🔍</div><p>Geen recepten gevonden.</p></div>`;
      return;
    }
    list.innerHTML = "";
    recipes.forEach(recipe => {
      const item = document.createElement("div");
      item.className = "pick-item";
      const thumbHtml = recipe.image
        ? `<div class="pick-thumb"><img src="${recipe.image}" /></div>`
        : `<div class="pick-thumb" style="display:flex;align-items:center;justify-content:center;">🍽️</div>`;
      const total = (recipe.prep_time || 0) + (recipe.cook_time || 0);
      item.innerHTML = `
        ${thumbHtml}
        <div>
          <div class="pick-name">${recipe.name}</div>
          <div class="pick-meta">${recipe.category || ""} ${total ? `· ⏱ ${total}m` : ""} · 👤 ${recipe.servings || 4}</div>
        </div>`;
      item.addEventListener("click", () => {
        const { day, mealType } = this._pickContext;
        const plan = JSON.parse(JSON.stringify(this._getPlanning(this._currentWeek)));
        plan.days[day][mealType] = recipe.id;
        this._savePlanning(this._currentWeek, plan);
        // Mark as cooked if dinner
        if (mealType === "dinner") {
          this._saveRecipe({ last_cooked: new Date().toISOString() }, recipe.id);
        }
        this.shadowRoot.getElementById("pick-modal").classList.remove("open");
      });
      list.appendChild(item);
    });
  }

  // ─── RECIPE DETAIL MODAL ───────────────────────────────────────
  _openDetailModal(recipe) {
    this._detailRecipe = recipe;
    const content = this.shadowRoot.getElementById("detail-content");
    const total = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const diffBadge = recipe.difficulty === "easy" ? "badge-green" : recipe.difficulty === "hard" ? "badge-red" : "badge-orange";
    content.innerHTML = `
      ${recipe.image ? `<img src="${recipe.image}" class="recipe-detail-img" />` : ""}
      <h3 style="margin:0 0 8px">${recipe.name}</h3>
      ${recipe.description ? `<p style="color:var(--secondary-text-color);font-size:.88em;margin:0 0 10px">${recipe.description}</p>` : ""}
      <div class="recipe-detail-meta">
        ${total ? `<span>⏱ ${total} min</span>` : ""}
        ${recipe.prep_time ? `<span>🔪 Bereiding: ${recipe.prep_time}m</span>` : ""}
        ${recipe.cook_time ? `<span>🍳 Kooktijd: ${recipe.cook_time}m</span>` : ""}
        <span>👤 ${recipe.servings || 4} personen</span>
        <span class="badge ${diffBadge}">${DIFFICULTIES[recipe.difficulty] || "Gemiddeld"}</span>
        ${recipe.category ? `<span>📁 ${recipe.category}</span>` : ""}
      </div>
      ${recipe.tags?.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px">${recipe.tags.map(t=>`<span class="recipe-tag">${t}</span>`).join("")}</div>` : ""}
      ${recipe.source_url ? `<p style="font-size:.8em;margin-bottom:12px"><a href="${recipe.source_url}" target="_blank" rel="noopener">🔗 Origineel recept</a></p>` : ""}
      ${recipe.ingredients?.length ? `
        <div class="recipe-detail-section">
          <h4>🧺 Ingrediënten</h4>
          ${recipe.ingredients.map(i => `
            <div class="ing-list-item">
              <span>${i.name}</span>
              <span style="color:var(--secondary-text-color)">${i.amount || ""} ${i.unit || ""}</span>
            </div>`).join("")}
        </div>` : ""}
      ${recipe.steps?.length ? `
        <div class="recipe-detail-section">
          <h4>👨‍🍳 Bereiding</h4>
          ${recipe.steps.map((s, i) => `
            <div class="step-detail">
              <div class="step-num">${i+1}</div>
              <div>${s}</div>
            </div>`).join("")}
        </div>` : ""}
      ${recipe.last_cooked ? `<p style="font-size:.75em;color:var(--secondary-text-color);margin-top:8px">Laatste keer gekookt: ${new Date(recipe.last_cooked).toLocaleDateString("nl-NL")}</p>` : ""}
    `;
    this.shadowRoot.getElementById("detail-modal").classList.add("open");
  }
}

customElements.define("meal-planner-card", MealPlannerCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "meal-planner-card",
  name: "Meal Planner",
  description: "Weekplanner met recepten, boodschappenlijst en meer.",
  preview: true,
});
console.info(
  `%c MEAL-PLANNER-CARD %c v${MP_VERSION} `,
  "background:#4caf50;color:white;font-weight:bold;padding:2px 6px;border-radius:4px 0 0 4px;",
  "background:#e8f5e9;color:#2e7d32;font-weight:bold;padding:2px 6px;border-radius:0 4px 4px 0;"
);
