/* =========================================================
   Digital Shop — interactions + product rendering
   ========================================================= */

/* ---- Product data ----
   Real catalog from digital-shop.co.il is loaded via products-data.js
   (window.PRODUCTS). The small list below is only a fallback. */
const DEMO_PRODUCTS = [
  { id: 1, emoji: "📱", cat: "טלפונים וטאבלטים", title: "Samsung Galaxy S24 Ultra 256GB", price: 4290, old: 4790 },
  { id: 2, emoji: "🎧", cat: "אוזניות", title: "אוזניות אלחוטיות עם ביטול רעשים ANC", price: 349, old: 549 },
  { id: 3, emoji: "🔊", cat: "רמקולים", title: "רמקול Bluetooth נייד", price: 279, old: 359 },
  { id: 4, emoji: "🔌", cat: "אביזרים", title: "מטען מהיר 65W GaN", price: 149, old: 219 },
];
const PRODUCTS = (window.PRODUCTS && window.PRODUCTS.length) ? window.PRODUCTS : DEMO_PRODUCTS;

const NIS = n => "₪" + Number(n).toLocaleString("he-IL");
const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

function cardHTML(p) {
  // badge: explicit, else derive from discount / availability
  let badge = p.badge, badgeType = p.badgeType || "";
  if (badge === undefined) {
    if (p.available === false) { badge = "אזל מהמלאי"; badgeType = "out"; }
    else if (p.old && p.old > p.price) { badge = "-" + Math.round((1 - p.price / p.old) * 100) + "%"; badgeType = "green"; }
    else badge = "";
  }
  const badgeDir = /%|\d/.test(badge) ? ' dir="ltr"' : "";
  const badgeHTML = badge
    ? `<span class="card__badge ${badgeType === "new" ? "card__badge--new" : badgeType === "green" ? "card__badge--green" : badgeType === "out" ? "card__badge--out" : ""}"${badgeDir}>${badge}</span>`
    : "";

  // stable pseudo rating for the mockup (real catalog has no ratings)
  const id = Math.abs(p.id || 0);
  const rating = p.rating || (4.2 + (id % 8) / 10);
  const reviews = p.reviews != null ? p.reviews : (8 + (id % 200));

  const media = p.img
    ? `<img class="ph" src="${p.img}" alt="${p.title}" loading="lazy">`
    : `<span class="ph">${p.emoji || "📦"}</span>`;

  return `
  <article class="card">
    ${badgeHTML}
    <button class="card__fav" aria-label="הוסף למועדפים">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
    </button>
    <a href="product.html?id=${p.id}" class="card__media">${media}</a>
    <div class="card__body">
      <span class="card__cat">${p.cat}</span>
      <h3 class="card__title"><a href="product.html?id=${p.id}">${p.title}</a></h3>
      <div class="card__rating"><span class="stars">${stars(rating)}</span> ${rating.toFixed(1)} <span style="color:var(--ink-faint)">(${reviews})</span></div>
      <div class="card__foot">
        <div class="price"><b>${NIS(p.price)}</b>${p.old ? `<s>${NIS(p.old)}</s>` : ""}</div>
      </div>
      <div class="card__actions">
        <div class="qty qty--card">
          <button type="button" data-qdec aria-label="הפחת">−</button>
          <input type="text" value="0" inputmode="numeric" data-cardqty aria-label="כמות" readonly>
          <button type="button" data-qinc aria-label="הוסף יחידה">+</button>
        </div>
        <button class="card__add" aria-label="הוסף לעגלה" data-add="${p.id}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h2.2l2 12.5a1.5 1.5 0 0 0 1.5 1.2h9.6a1.5 1.5 0 0 0 1.5-1.2L20.5 7H6"/></svg>
          <span class="card__add-label">הוספה</span>
        </button>
      </div>
    </div>
  </article>`;
}

function render(id, list) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = list.map(cardHTML).join("");
}

/* Homepage grids — best sellers & new arrivals from the real catalog */
const onSale = PRODUCTS.filter(p => p.old && p.old > p.price);
render("bestsellers", (onSale.length >= 8 ? onSale : PRODUCTS).slice(0, 8));
render("newarrivals", PRODUCTS.slice(8, 16));

/* Related products on PDP */
render("related", PRODUCTS.slice(16, 20));

/* ---- Category page: a separate filtered view per category (?cat=) ---- */
const CAT_EMOJI = {
  "טלפונים וטאבלטים": "📱", "אוזניות": "🎧", "רמקולים": "🔊", "מחשבים ומסכים": "💻",
  "גיימינג": "🎮", "אביזרים": "🔌", "מדפסות": "🖨️", "רשת ותקשורת": "📡",
};

(function initShop() {
  const grid = document.getElementById("shopGrid");
  if (!grid) return;

  // which view? category (?cat=), or a special shop mode (data-shop)
  const mode = grid.dataset.shop;
  const cat = new URLSearchParams(location.search).get("cat");
  let list;
  if (mode === "deals") list = PRODUCTS.filter(p => p.old && p.old > p.price);
  else if (mode === "new") list = PRODUCTS.slice(0, 60);
  else list = cat ? PRODUCTS.filter(p => p.cat === cat) : PRODUCTS;

  // heading, breadcrumb, title, active nav link
  if (cat) {
    const h1 = document.querySelector(".page-head h1");
    if (h1) h1.textContent = (CAT_EMOJI[cat] ? CAT_EMOJI[cat] + " " : "") + cat;
    const crumbs = document.querySelector(".page-head .crumbs");
    if (crumbs) crumbs.innerHTML =
      `<a href="index.html">בית</a><span class="sep">/</span>` +
      `<a href="category.html">כל המוצרים</a><span class="sep">/</span>` +
      `<span class="cur">${cat}</span>`;
    document.title = cat + " · דיגיטל שופ digitalShop";
  }
  document.querySelectorAll(".nav a").forEach(a => {
    const ac = new URLSearchParams((a.getAttribute("href").split("?")[1] || "")).get("cat");
    a.classList.toggle("is-active", cat ? ac === cat : a.classList.contains("nav__all"));
  });

  const PER = 24;
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const nav = document.querySelector(".pagination");
  const countEl = document.querySelector(".shop-toolbar .count");
  let page = 1;

  function renderNav() {
    if (!nav) return;
    if (pages <= 1) { nav.innerHTML = ""; return; }
    const link = (label, pg, o = {}) =>
      o.disabled ? "" : `<a href="#" data-page="${pg}" class="${o.active ? "is-active" : ""}">${label}</a>`;
    const win = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - page) <= 1) win.push(i);
      else if (win[win.length - 1] !== "…") win.push("…");
    }
    nav.innerHTML =
      link("›", page - 1, { disabled: page === 1 }) +
      win.map(i => i === "…" ? `<span style="padding:0 8px;color:var(--ink-faint)">…</span>` : link(i, i, { active: i === page })).join("") +
      link("‹", page + 1, { disabled: page === pages });
  }
  function show(pg, scroll) {
    page = Math.min(Math.max(1, pg), pages);
    if (list.length === 0) {
      grid.innerHTML = `<p style="grid-column:1/-1;color:var(--ink-soft);padding:40px 0">לא נמצאו מוצרים בקטגוריה זו.</p>`;
      if (countEl) countEl.innerHTML = `0 מוצרים`;
      if (nav) nav.innerHTML = "";
      return;
    }
    const start = (page - 1) * PER;
    const slice = list.slice(start, start + PER);
    grid.innerHTML = slice.map(cardHTML).join("");
    if (countEl) countEl.innerHTML = `מציג <b>${start + 1}–${start + slice.length}</b> מתוך <b>${list.length}</b> מוצרים`;
    renderNav();
    if (scroll) window.scrollTo({ top: grid.getBoundingClientRect().top + window.scrollY - 130, behavior: "smooth" });
  }
  nav?.addEventListener("click", e => {
    const a = e.target.closest("[data-page]");
    if (!a) return;
    e.preventDefault();
    show(+a.dataset.page, true);
  });
  show(1, false);
})();

/* ---- Card quantity: + goes up to 100, trash clears to 0 ---- */
document.addEventListener("click", e => {
  const qinc = e.target.closest("[data-qinc]");
  const qdec = e.target.closest("[data-qdec]");
  if (qinc || qdec) {
    const input = (qinc || qdec).closest(".qty").querySelector("[data-cardqty]");
    if (input) {
      let v = parseInt(input.value, 10) || 0;
      v = qinc ? Math.min(100, v + 1) : Math.max(0, v - 1);
      input.value = v;
    }
  }
});

/* ---- Add-to-cart (cards) — adds the chosen quantity + feedback ---- */
document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  if (add) {
    const input = add.closest(".card") && add.closest(".card").querySelector("[data-cardqty]");
    const qty = input ? (parseInt(input.value, 10) || 0) : 1;
    if (qty < 1) {
      // nothing selected yet — nudge the stepper so the user picks a quantity
      const st = add.closest(".card") && add.closest(".card").querySelector(".qty--card");
      if (st) { st.style.boxShadow = "0 0 0 2px var(--brand)"; setTimeout(() => st.style.boxShadow = "", 600); }
      return;
    }
    if (window.Cart) window.Cart.add(add.dataset.add, qty);
    const original = add.innerHTML;
    add.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg> נוסף';
    add.style.background = "var(--green)";
    add.style.color = "#fff";
    if (input) input.value = 0;
    setTimeout(() => {
      add.innerHTML = original;
      add.style.background = ""; add.style.color = "";
    }, 1100);
  }

  /* favorite toggle */
  const fav = e.target.closest(".card__fav");
  if (fav) {
    fav.style.color = fav.dataset.on ? "" : "var(--accent)";
    fav.querySelector("path").setAttribute("fill", fav.dataset.on ? "none" : "currentColor");
    fav.dataset.on = fav.dataset.on ? "" : "1";
  }
});

/* ---- Mobile drawer (full side menu, built dynamically) ---- */
const drawer = document.getElementById("drawer");
if (drawer) {
  const CATS = [
    ["📱", "טלפונים וטאבלטים"], ["🎧", "אוזניות"], ["🔊", "רמקולים"], ["💻", "מחשבים ומסכים"],
    ["🎮", "גיימינג"], ["🔌", "אביזרים"], ["🖨️", "מדפסות"], ["📡", "רשת ותקשורת"],
  ];
  const svg = s => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;
  drawer.innerHTML = `
    <div class="drawer__head">
      <a href="index.html" class="logo"><img src="img/logo-Digital-shop.webp" alt="Digital Shop"></a>
      <button class="icon-btn" data-menu-close aria-label="סגירה">${svg('<path d="M18 6 6 18M6 6l12 12"/>')}</button>
    </div>
    <div class="drawer__scroll">
      <a href="login.html" class="btn btn--primary btn--block drawer__cta">${svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>')} התחברות / הרשמה</a>
      <div class="drawer__quick">
        <a href="cart.html">${svg('<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h2.2l2 12.5a1.5 1.5 0 0 0 1.5 1.2h9.6a1.5 1.5 0 0 0 1.5-1.2L20.5 7H6"/>')} עגלה</a>
        <a href="wishlist.html">${svg('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>')} מועדפים</a>
        <a href="deals.html">${svg('<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>')} מבצעים</a>
      </div>
      <div class="drawer__sec">קטגוריות</div>
      <nav>
        <a href="category.html">${svg('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>')} כל המוצרים</a>
        ${CATS.map(([e, n]) => `<a href="category.html?cat=${encodeURIComponent(n)}">${e} ${n}</a>`).join("")}
      </nav>
      <div class="drawer__sec">קישורים מהירים</div>
      <nav>
        <a href="deals.html">🔥 מבצעים חמים</a>
        <a href="new.html">✨ חדש בחנות</a>
        <a href="brands.html">🏷️ המותגים שלנו</a>
        <a href="gift-cards.html">🎁 כרטיסי מתנה</a>
      </nav>
      <div class="drawer__sec">מידע ושירות</div>
      <nav>
        <a href="contact.html">צור קשר</a>
        <a href="faq.html">שאלות נפוצות</a>
        <a href="shipping.html">משלוחים והחזרות</a>
        <a href="warranty.html">אחריות ותיקונים</a>
        <a href="about.html">אודות</a>
      </nav>
    </div>`;
}
const backdrop = document.querySelector(".drawer-backdrop");
function openMenu() { drawer?.classList.add("open"); backdrop?.classList.add("open"); document.body.style.overflow = "hidden"; }
function closeMenu() { drawer?.classList.remove("open"); backdrop?.classList.remove("open"); document.body.style.overflow = ""; }
document.querySelectorAll("[data-menu-open]").forEach(b => b.addEventListener("click", openMenu));
document.querySelectorAll("[data-menu-close]").forEach(b => b.addEventListener("click", closeMenu));

/* ---- Auth tabs (login page) ---- */
document.querySelectorAll(".auth__tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.auth;
    document.querySelectorAll(".auth__tabs button").forEach(b => b.classList.remove("is-active"));
    document.querySelectorAll(".auth__form").forEach(f => f.classList.remove("is-active"));
    btn.classList.add("is-active");
    document.getElementById(target)?.classList.add("is-active");
  });
});

/* ---- Gift card amount selection ---- */
document.querySelectorAll(".gift-amounts").forEach(group => {
  group.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    group.querySelectorAll("button").forEach(x => x.classList.remove("is-active"));
    b.classList.add("is-active");
  });
});

/* ---- Tabs (PDP) ---- */
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("is-active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("is-active"));
    tab.classList.add("is-active");
    document.getElementById(target)?.classList.add("is-active");
  });
});

/* ---- Gallery thumbs (PDP) ---- */
document.querySelectorAll(".gallery__thumb").forEach(thumb => {
  thumb.addEventListener("click", () => {
    document.querySelectorAll(".gallery__thumb").forEach(t => t.classList.remove("is-active"));
    thumb.classList.add("is-active");
    const main = document.querySelector(".gallery__main .ph") || document.querySelector(".gallery__main span");
    if (main) main.textContent = thumb.textContent;
  });
});

/* ---- Swatches (PDP) ---- */
document.querySelectorAll(".swatches").forEach(group => {
  group.addEventListener("click", e => {
    const sw = e.target.closest(".swatch");
    if (!sw) return;
    group.querySelectorAll(".swatch").forEach(s => s.classList.remove("is-active"));
    sw.classList.add("is-active");
  });
});

/* ---- Quantity steppers (skip the cart page — cart.js owns those) ---- */
document.querySelectorAll(".qty").forEach(q => {
  if (q.closest("#cartItems")) return;
  const input = q.querySelector("input");
  q.querySelector("[data-inc]")?.addEventListener("click", () => { input.value = +input.value + 1; });
  q.querySelector("[data-dec]")?.addEventListener("click", () => { input.value = Math.max(1, +input.value - 1); });
});

/* ---- Filters toggle (category, mobile) ---- */
document.querySelector("[data-filters-toggle]")?.addEventListener("click", () => {
  document.querySelector(".filters")?.classList.toggle("open");
});

/* ---- Product page (PDP): load the real product from ?id= ---- */
(function initPDP() {
  const pdp = document.querySelector(".pdp");
  if (!pdp) return;
  const id = new URLSearchParams(location.search).get("id");
  const p = (id && PRODUCTS.find(x => String(x.id) === String(id))) || PRODUCTS.find(x => x.img) || PRODUCTS[0];
  if (!p) return;

  const q = s => pdp.querySelector(s);
  // media
  const main = q(".gallery__main");
  if (main) {
    const media = p.img
      ? `<img class="ph" src="${p.img}" alt="${p.title}" style="width:100%;height:100%;object-fit:contain;padding:12%">`
      : `<span class="ph">${p.emoji || "📦"}</span>`;
    const disc = (p.old && p.old > p.price) ? Math.round((1 - p.price / p.old) * 100) : 0;
    main.innerHTML = (disc ? `<span class="card__badge card__badge--green" dir="ltr">-${disc}%</span>` : "") + media;
  }
  const thumbs = q(".gallery__thumbs");
  if (thumbs) thumbs.style.display = "none"; // single real image

  // info
  const cat = q(".card__cat"); if (cat) cat.textContent = p.cat;
  const h1 = q("h1"); if (h1) h1.textContent = p.title;
  const price = q(".pdp__price");
  if (price) {
    const save = (p.old && p.old > p.price) ? `<span class="save">חיסכון ${NIS(p.old - p.price)}</span>` : "";
    price.innerHTML = `<b>${NIS(p.price)}</b>${p.old && p.old > p.price ? `<s>${NIS(p.old)}</s>` : ""}${save}`;
  }
  // breadcrumb + title + rating count
  const cur = document.querySelector(".crumbs .cur"); if (cur) cur.textContent = p.title;
  const bcat = document.querySelector(".crumbs a[href^='category']"); if (bcat) { bcat.textContent = p.cat; bcat.href = "category.html?cat=" + encodeURIComponent(p.cat); }
  document.title = p.title + " · דיגיטל שופ digitalShop";

  // add to cart (reads qty) + quick buy
  const qtyInput = q(".pdp__buy .qty input");
  const addBtn = document.getElementById("pdpAdd");
  const buyBtn = document.getElementById("pdpBuy");
  const getQty = () => Math.max(1, parseInt(qtyInput && qtyInput.value, 10) || 1);
  if (addBtn) addBtn.addEventListener("click", () => {
    if (window.Cart) window.Cart.add(p.id, getQty());
    const t = addBtn.innerHTML;
    addBtn.innerHTML = "נוסף לעגלה ✓"; addBtn.style.background = "var(--green)";
    setTimeout(() => { addBtn.innerHTML = t; addBtn.style.background = ""; }, 1200);
  });
  if (buyBtn) buyBtn.addEventListener("click", e => {
    e.preventDefault();
    if (window.Cart) window.Cart.add(p.id, getQty());
    location.href = "checkout.html";
  });

  // related: same category
  const rel = document.getElementById("related");
  if (rel) {
    const same = PRODUCTS.filter(x => x.cat === p.cat && String(x.id) !== String(p.id)).slice(0, 4);
    rel.innerHTML = (same.length ? same : PRODUCTS.slice(0, 4)).map(cardHTML).join("");
  }
})();
