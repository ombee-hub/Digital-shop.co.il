/* =========================================================
   Digital Shop — Accessibility widget (תו נגישות)
   Modeled on the AgroSoft widget layout, in the Digital Shop
   blue palette. Self-contained; effects scoped to #a11yMain.
   ========================================================= */
(function () {
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

  const S = (inner) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  const PERSON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="3.6" r="2.3"/><path d="M12 6.6c-3.2 0-5.4.5-5.4 1.7 0 .9 1.5 1.2 3.5 1.4l-.5 3.2-1.3 5.6a1.05 1.05 0 0 0 2 .6L12 15.2l1.7 3.9a1.05 1.05 0 0 0 2-.6l-1.3-5.6-.5-3.2c2-.2 3.5-.5 3.5-1.4 0-1.2-2.2-1.7-5.4-1.7z"/></svg>';

  // type: "toggle" (on/off) | "cycle" (0..max)
  const FEATURES = [
    { id: "contrast",   label: "ניגודיות",       type: "cycle", max: 2, icon: S('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/>') },
    { id: "links",      label: "הדגשת קישורים",  type: "toggle",        icon: S('<path d="M10 13a5 5 0 0 0 7.5.6l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.6l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>') },
    { id: "text",       label: "טקסט גדול",      type: "cycle", max: 3, icon: '<svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="18" font-size="14" font-weight="800">A</text><text x="12" y="18" font-size="10" font-weight="800">A</text></svg>' },
    { id: "spacing",    label: "ריווח טקסט",     type: "toggle",        icon: S('<path d="M3 12h18"/><path d="M7 8l-4 4 4 4"/><path d="M17 8l4 4-4 4"/>') },
    { id: "noanim",     label: "ביטול הנפשות",   type: "toggle",        icon: S('<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>') },
    { id: "noimg",      label: "הסתרת תמונות",   type: "toggle",        icon: S('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 3 18 18"/><circle cx="9" cy="9" r="1.5"/>') },
    { id: "readable",   label: "גופן קריא",      type: "toggle",        icon: '<svg viewBox="0 0 24 24" fill="currentColor"><text x="4" y="18" font-size="15" font-weight="800">Df</text></svg>' },
    { id: "cursor",     label: "סמן גדול",       type: "toggle",        icon: S('<path d="M5 3l13 6.5-5.5 1.8L10 17z"/>') },
    { id: "lineheight", label: "גובה שורה",      type: "cycle", max: 2, icon: S('<path d="M3 5h18M3 12h18M3 19h18"/>') },
    { id: "align",      label: "יישור טקסט",     type: "toggle",        icon: S('<path d="M3 6h18M7 12h10M5 18h14"/>') },
    { id: "grayscale",  label: "גווני אפור",     type: "toggle",        icon: S('<path d="M12 3s6 5.5 6 10a6 6 0 0 1-12 0c0-4.5 6-10 6-10z"/>') },
    { id: "readline",   label: "קו קריאה",       type: "toggle",        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="10.5" width="20" height="3" rx="1.5" fill="currentColor" stroke="none"/><path d="M5 6h14M7 18h10" opacity=".45"/></svg>' },
  ];

  /* reading guide line */
  function moveReadLine(e) { const l = document.getElementById("a11yReadLine"); if (l) l.style.top = (e.clientY - 17) + "px"; }
  function readingLine(on) {
    let l = document.getElementById("a11yReadLine");
    if (on) { if (!l) { l = document.createElement("div"); l.id = "a11yReadLine"; document.body.appendChild(l); document.addEventListener("mousemove", moveReadLine); } }
    else if (l) { l.remove(); document.removeEventListener("mousemove", moveReadLine); }
  }

  function apply() {
    HTML.classList.remove("a11y-contrast", "a11y-invert");
    if (state.contrast === 1) HTML.classList.add("a11y-contrast");
    else if (state.contrast === 2) HTML.classList.add("a11y-invert");
    HTML.classList.remove("a11y-text1", "a11y-text2", "a11y-text3");
    if (state.text) HTML.classList.add("a11y-text" + state.text);
    HTML.classList.remove("a11y-lh1", "a11y-lh2");
    if (state.lineheight) HTML.classList.add("a11y-lh" + state.lineheight);
    ["links", "spacing", "noanim", "noimg", "readable", "cursor", "align", "grayscale"].forEach(id => HTML.classList.toggle("a11y-" + id, !!state[id]));
    readingLine(!!state.readline);
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
    refresh();
  }

  function activeCount() { let n = 0; FEATURES.forEach(f => { if (state[f.id]) n++; }); return n; }

  /* floating button */
  const btn = document.createElement("button");
  btn.id = "a11yBtn";
  btn.setAttribute("aria-label", "פתיחת תפריט נגישות");
  btn.innerHTML = PERSON + '<span class="a11y-badge" id="a11yCount"></span>';
  document.body.appendChild(btn);

  /* overlay + side panel */
  const overlay = document.createElement("div");
  overlay.id = "a11yOverlay";
  document.body.appendChild(overlay);

  const panel = document.createElement("div");
  panel.id = "a11yPanel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "תפריט נגישות");
  panel.innerHTML = `
    <div class="a11y-head">
      <h2><span class="a11y-head-ic">${PERSON}</span> תו נגישות</h2>
      <button class="a11y-close" aria-label="סגירת תפריט נגישות">${S('<path d="M18 6 6 18M6 6l12 12"/>')}</button>
    </div>
    <div class="a11y-grid">
      ${FEATURES.map(f => `
        <button class="a11y-tile" data-id="${f.id}" aria-pressed="false">
          <span class="a11y-step" data-step></span>
          <span class="a11y-check" aria-hidden="true">${S('<path d="M20 6 9 17l-5-5"/>')}</span>
          <span class="a11y-ic">${f.icon}</span>
          <span class="a11y-lbl">${f.label}</span>
        </button>`).join("")}
    </div>
    <button class="a11y-reset">${S('<path d="M3 12a9 9 0 1 1 3 6.7L3 21"/><path d="M3 21v-5h5"/>')} איפוס כל ההגדרות</button>
    <div class="a11y-bottom">
      <a href="accessibility.html">הצהרת נגישות</a>
      <a href="privacy.html">מדיניות פרטיות</a>
    </div>`;
  document.body.appendChild(panel);

  function refresh() {
    panel.querySelectorAll(".a11y-tile").forEach(el => {
      const f = FEATURES.find(x => x.id === el.dataset.id);
      const v = state[f.id];
      el.classList.toggle("on", !!v);
      el.setAttribute("aria-pressed", v ? "true" : "false");
      const step = el.querySelector("[data-step]");
      if (step) step.textContent = (f.type === "cycle" && v) ? (v + "/" + f.max) : "";
    });
    const c = document.getElementById("a11yCount");
    const n = activeCount();
    if (c) { c.textContent = n; c.style.display = n > 0 ? "" : "none"; }
  }

  /* open / close */
  function openPanel(o) {
    const show = o === undefined ? !panel.classList.contains("open") : o;
    panel.classList.toggle("open", show);
    overlay.classList.toggle("open", show);
    btn.classList.toggle("active", show);
  }
  btn.addEventListener("click", () => openPanel());
  panel.querySelector(".a11y-close").addEventListener("click", () => openPanel(false));
  overlay.addEventListener("click", () => openPanel(false));
  document.addEventListener("keydown", e => { if (e.key === "Escape") openPanel(false); });

  panel.querySelector(".a11y-grid").addEventListener("click", e => {
    const tile = e.target.closest(".a11y-tile");
    if (!tile) return;
    const f = FEATURES.find(x => x.id === tile.dataset.id);
    if (f.type === "cycle") state[f.id] = ((state[f.id] || 0) + 1) % (f.max + 1);
    else state[f.id] = !state[f.id];
    apply();
  });
  panel.querySelector(".a11y-reset").addEventListener("click", () => { state = {}; apply(); });

  /* keep the button clear of the cookie banner */
  function adjustForCookie() {
    const cb = document.getElementById("cookieBar");
    btn.style.bottom = (cb && cb.classList.contains("show")) ? (cb.offsetHeight + 14) + "px" : "";
  }
  new MutationObserver(() => {
    const cb = document.getElementById("cookieBar");
    if (cb) { try { cookieObs.observe(cb, { attributes: true, attributeFilter: ["class"] }); } catch (e) {} adjustForCookie(); }
  }).observe(document.body, { childList: true });
  const cookieObs = new MutationObserver(adjustForCookie);
  setTimeout(adjustForCookie, 120);

  apply();
})();
