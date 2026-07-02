/* =========================================================
   Digital Shop — Accessibility widget (תו נגישות)
   Self-contained: builds the button + panel, applies and
   persists settings. All effects are scoped to #a11yMain so
   the widget itself is never affected.
   ========================================================= */
(function () {
  // 1) Wrap all page content so visual filters never touch the widget
  if (!document.getElementById("a11yMain")) {
    const main = document.createElement("div");
    main.id = "a11yMain";
    while (document.body.firstChild) main.appendChild(document.body.firstChild);
    document.body.appendChild(main);
  }

  const HTML = document.documentElement;
  const STORE = "ds_a11y";
  let state = {};
  try { state = JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (e) { state = {}; }

  const ico = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

  const TOGGLES = [
    { id: "links",      label: "הדגשת קישורים", icon: ico('<path d="M10 13a5 5 0 0 0 7.5.6l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.6l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>') },
    { id: "spacing",    label: "ריווח טקסט",    icon: ico('<path d="M3 12h18"/><path d="M7 8l-4 4 4 4"/><path d="M17 8l4 4-4 4"/>') },
    { id: "lineheight", label: "גובה שורה",     icon: ico('<path d="M3 5h18M3 12h18M3 19h18"/>') },
    { id: "readable",   label: "גופן קריא",     icon: '<svg viewBox="0 0 24 24"><text x="3" y="18" font-size="15" font-weight="800" fill="currentColor">Df</text></svg>' },
    { id: "noanim",     label: "ביטול הנפשות",  icon: ico('<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>') },
    { id: "noimg",      label: "הסתרת תמונות",  icon: ico('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 3 18 18"/><circle cx="9" cy="9" r="1.5"/>') },
    { id: "cursor",     label: "סמן גדול",      icon: ico('<path d="M5 3l13 6.5-5.5 1.8L10 17z"/>') },
    { id: "align",      label: "יישור לאמצע",   icon: ico('<path d="M3 6h18M7 12h10M5 18h14"/>') },
  ];
  const MODES = [
    { id: "contrast",  label: "ניגודיות גבוהה", icon: ico('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>') },
    { id: "invert",    label: "מצב כהה",        icon: ico('<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>') },
    { id: "grayscale", label: "גווני אפור",     icon: ico('<path d="M12 3s6 5.5 6 10a6 6 0 0 1-12 0c0-4.5 6-10 6-10z"/>') },
  ];

  function apply() {
    TOGGLES.forEach(t => HTML.classList.toggle("a11y-" + t.id, !!state[t.id]));
    HTML.classList.remove("a11y-text1", "a11y-text2", "a11y-text3");
    if (state.text) HTML.classList.add("a11y-text" + state.text);
    HTML.classList.remove("a11y-contrast", "a11y-invert", "a11y-grayscale");
    if (state.color) HTML.classList.add("a11y-" + state.color);
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
    refresh();
  }

  // 2) Build the floating button
  const btn = document.createElement("button");
  btn.id = "a11yBtn";
  btn.setAttribute("aria-label", "תפריט נגישות");
  btn.innerHTML = ico('<circle cx="12" cy="4" r="1.6" fill="currentColor"/><path d="M5 8h14"/><path d="M12 8v6m0 0-3 6m3-6 3 6"/>');
  document.body.appendChild(btn);

  // 3) Build the panel
  const panel = document.createElement("div");
  panel.id = "a11yPanel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "הגדרות נגישות");
  panel.innerHTML = `
    <button class="a11y-close" aria-label="סגירה">${ico('<path d="M18 6 6 18M6 6l12 12"/>')}</button>
    <h2>תפריט נגישות</h2>
    <div class="a11y-grid">
      <button class="a11y-item" data-type="text" data-id="text">
        <span class="a11y-ic"><svg viewBox="0 0 24 24"><text x="2" y="18" font-size="15" font-weight="800" fill="currentColor">A</text><text x="11" y="18" font-size="11" font-weight="800" fill="currentColor">A</text></svg></span>
        <span>הגדלת טקסט</span><span class="lvl" data-lvl></span>
      </button>
      ${TOGGLES.map(t => `<button class="a11y-item" data-type="toggle" data-id="${t.id}"><span class="a11y-ic">${t.icon}</span><span>${t.label}</span></button>`).join("")}
      ${MODES.map(m => `<button class="a11y-item" data-type="mode" data-id="${m.id}"><span class="a11y-ic">${m.icon}</span><span>${m.label}</span></button>`).join("")}
    </div>
    <button class="a11y-reset">${ico('<path d="M3 12a9 9 0 1 1 3 6.7L3 21"/><path d="M3 21v-5h5"/>')} איפוס כל ההגדרות</button>
    <div class="a11y-links-row">
      <a href="accessibility.html">הצהרת נגישות</a>
      <a href="privacy.html">מדיניות פרטיות</a>
    </div>
    <p class="a11y-note">האתר עומד בתקן הנגישות הישראלי (ת"י 5568) ברמה AA.</p>
  `;
  document.body.appendChild(panel);

  function refresh() {
    panel.querySelectorAll(".a11y-item").forEach(el => {
      const id = el.dataset.id, type = el.dataset.type;
      let on = false;
      if (type === "toggle") on = !!state[id];
      else if (type === "mode") on = state.color === id;
      else if (type === "text") on = !!state.text;
      el.classList.toggle("on", on);
    });
    const lvl = panel.querySelector("[data-lvl]");
    if (lvl) lvl.textContent = state.text ? "רמה " + state.text : "";
  }

  // 4) Events
  function togglePanel(open) {
    const show = open === undefined ? !panel.classList.contains("open") : open;
    panel.classList.toggle("open", show);
    btn.classList.toggle("active", show);
  }
  btn.addEventListener("click", () => togglePanel());
  panel.querySelector(".a11y-close").addEventListener("click", () => togglePanel(false));
  document.addEventListener("keydown", e => { if (e.key === "Escape") togglePanel(false); });
  document.addEventListener("click", e => {
    if (panel.classList.contains("open") && !panel.contains(e.target) && !btn.contains(e.target)) togglePanel(false);
  });

  panel.querySelector(".a11y-grid").addEventListener("click", e => {
    const item = e.target.closest(".a11y-item");
    if (!item) return;
    const id = item.dataset.id, type = item.dataset.type;
    if (type === "toggle") state[id] = !state[id];
    else if (type === "text") state.text = ((state.text || 0) + 1) % 4;
    else if (type === "mode") state.color = state.color === id ? null : id;
    apply();
  });
  panel.querySelector(".a11y-reset").addEventListener("click", () => { state = {}; apply(); });

  // 5) Apply saved settings on load
  apply();
})();
