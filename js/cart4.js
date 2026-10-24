/* =========================================================
   Digital Shop — shopping cart (localStorage) + checkout
   Loaded after products-data.js, before app.js.
   ========================================================= */
(function () {
  console.log("%c🛒 DigitalShop cart4 loaded (minus removes at qty 1) ✓ (delete enabled)", "color:#18a957;font-weight:bold");
  const KEY = "ds_cart";
  const FREE_SHIP = 199;
  const nis = n => "₪" + Number(n || 0).toLocaleString("he-IL");
  const products = () => window.PRODUCTS || [];
  const find = id => products().find(p => String(p.id) === String(id));

  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} updateBadges(); }
  function count() { return read().reduce((n, x) => n + (x.qty || 0), 0); }
  function add(id, qty) {
    qty = qty || 1;
    const c = read();
    const it = c.find(x => String(x.id) === String(id));
    if (it) it.qty += qty; else c.push({ id: String(id), qty });
    save(c);
  }
  function setQty(id, qty) {
    const c = read();
    const it = c.find(x => String(x.id) === String(id));
    if (it) { it.qty = Math.max(1, qty); save(c); }
  }
  function remove(id) { save(read().filter(x => String(x.id) !== String(id))); }
  function clear() { save([]); }
  function detailed() { return read().map(x => ({ qty: x.qty, p: find(x.id) })).filter(x => x.p); }
  function totals() {
    let sub = 0, disc = 0, tot = 0, n = 0;
    detailed().forEach(({ qty, p }) => {
      const old = (p.old && p.old > p.price) ? p.old : p.price;
      sub += old * qty; disc += (old - p.price) * qty; tot += p.price * qty; n += qty;
    });
    return { sub, disc, tot, n };
  }
  function updateBadges() {
    const n = count();
    document.querySelectorAll('a[href="cart.html"] .badge').forEach(b => {
      b.textContent = n; b.style.display = n > 0 ? "" : "none";
    });
  }

  window.Cart = { read, add, setQty, remove, clear, count, detailed, totals, updateBadges, find, nis };

  /* ---------- Cart page ---------- */
  function renderCartPage() {
    const itemsEl = document.getElementById("cartItems");
    if (!itemsEl) return;
    const layout = document.getElementById("cartLayout");
    const empty = document.getElementById("cartEmpty");
    const subtitle = document.getElementById("cartSubtitle");
    const d = detailed();

    if (d.length === 0) {
      if (layout) layout.style.display = "none";
      if (empty) empty.hidden = false;
      if (subtitle) subtitle.textContent = "אין מוצרים בעגלה";
      return;
    }
    if (layout) layout.style.display = "";
    if (empty) empty.hidden = true;

    itemsEl.innerHTML = d.map(({ qty, p }) => {
      const old = (p.old && p.old > p.price) ? p.old : 0;
      const media = p.img
        ? `<img src="${p.img}" alt="${p.title}" style="width:100%;height:100%;object-fit:contain;padding:8%">`
        : (p.emoji || "📦");
      return `
      <div class="cart-row" data-id="${p.id}">
        <div class="cart-row__media">${media}</div>
        <div class="cart-row__info">
          <span class="card__cat">${p.cat}</span>
          <h3>${p.title}</h3>
          <button type="button" class="rm" data-remove>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg> הסרה
          </button>
        </div>
        <div class="cart-row__end">
          <div class="price"><b>${nis(p.price * qty)}</b>${old ? `<s>${nis(old * qty)}</s>` : ""}</div>
          <div class="qty">
            <button type="button" data-dec aria-label="הפחת">−</button>
            <input type="text" value="${qty}" inputmode="numeric" aria-label="כמות" data-qty>
            <button type="button" data-inc aria-label="הוסף">+</button>
          </div>
        </div>
      </div>`;
    }).join("");

    updateSummary();
  }

  /* Document-level delegation (same mechanism as the working add-to-cart).
     Bound once; works regardless of re-render, re-parenting, or CSP on inline handlers. */
  const curQty = id => { const it = read().find(x => String(x.id) === String(id)); return it ? it.qty : 1; };
  let bound = false;
  function bindCartEvents() {
    if (bound) return; bound = true;
    const removeRow = (rowEl, id) => {
      rowEl.style.transition = "opacity .2s, transform .2s";
      rowEl.style.opacity = "0"; rowEl.style.transform = "translateX(-12px)";
      setTimeout(function () { remove(id); renderCartPage(); }, 200);
    };
    document.addEventListener("click", function (e) {
      const rowEl = e.target.closest && e.target.closest("#cartItems .cart-row");
      if (!rowEl) return;
      const id = rowEl.getAttribute("data-id");
      if (e.target.closest("[data-remove]")) {
        removeRow(rowEl, id);
      } else if (e.target.closest("[data-inc]")) { setQty(id, curQty(id) + 1); renderCartPage(); }
      else if (e.target.closest("[data-dec]")) {
        // minus at quantity 1 removes the item from the cart
        if (curQty(id) <= 1) { removeRow(rowEl, id); }
        else { setQty(id, curQty(id) - 1); renderCartPage(); }
      }
    });
    document.addEventListener("change", function (e) {
      const inp = e.target.closest && e.target.closest("#cartItems [data-qty]");
      if (!inp) return;
      const id = inp.closest(".cart-row").getAttribute("data-id");
      setQty(id, parseInt(inp.value, 10) || 1); renderCartPage();
    });
  }

  function updateSummary() {
    const t = totals();
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set("sumSubtotal", nis(t.sub));
    set("sumDiscount", "−" + nis(t.disc));
    set("sumTotal", nis(t.tot));
    const subtitle = document.getElementById("cartSubtitle");
    if (subtitle) subtitle.textContent = t.n + (t.n === 1 ? " מוצר בעגלה" : " מוצרים בעגלה") + " · כמעט סיימתם!";
    const fill = document.getElementById("shipFill"), msg = document.getElementById("shipMsg");
    const pct = Math.min(100, Math.round((t.tot / FREE_SHIP) * 100));
    if (fill) fill.style.width = pct + "%";
    if (msg) msg.innerHTML = t.tot >= FREE_SHIP
      ? "🎉 זכאים ל<b>משלוח חינם</b> — מגיע לכם!"
      : "🚚 הוסיפו עוד <b>" + nis(FREE_SHIP - t.tot) + "</b> כדי לקבל <b>משלוח חינם</b>";
  }

  /* ---------- Checkout page ---------- */
  function initCheckout() {
    const wrap = document.getElementById("checkoutWrap");
    if (!wrap) return;
    const d = detailed(), t = totals();

    if (d.length === 0) {
      wrap.innerHTML = '<div class="cart-empty"><div class="cart-empty__icon">🛒</div><h2>העגלה ריקה</h2><p>אין מה לשלם עדיין — קודם הוסיפו מוצרים לעגלה.</p><a href="category.html" class="btn btn--primary btn--lg">למעבר לחנות</a></div>';
      return;
    }

    const sumEl = document.getElementById("checkoutSummary");
    if (sumEl) {
      sumEl.innerHTML = d.map(({ qty, p }) => `
        <div class="co-item">
          <div class="co-item__media">${p.img ? `<img src="${p.img}" alt="">` : (p.emoji || "📦")}</div>
          <div class="co-item__info"><b>${p.title}</b><span>כמות: ${qty}</span></div>
          <div class="co-item__price">${nis(p.price * qty)}</div>
        </div>`).join("") + `
        <div class="summary__row"><span>סכום ביניים</span><b>${nis(t.sub)}</b></div>
        <div class="summary__row"><span>הנחה</span><b style="color:var(--accent)" dir="ltr">−${nis(t.disc)}</b></div>
        <div class="summary__row free"><span>משלוח</span><span>חינם 🎉</span></div>
        <div class="summary__total"><span>סה"כ לתשלום</span><b>${nis(t.tot)}</b></div>`;
    }

    const form = document.getElementById("checkoutForm");
    if (form) form.addEventListener("submit", e => {
      e.preventDefault();
      const order = "DS-" + Math.floor(100000 + Math.random() * 900000);
      clear();
      wrap.innerHTML = `
        <div class="order-done">
          <div class="order-done__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg></div>
          <h2>ההזמנה התקבלה!</h2>
          <p>תודה על הרכישה 🎉 מספר ההזמנה שלך: <b>${order}</b></p>
          <p class="order-done__sub">אישור ופרטי מעקב יישלחו לאימייל שלך. נשמח לראותך שוב בדיגיטל שופ!</p>
          <a href="index.html" class="btn btn--primary btn--lg">חזרה לדף הבית</a>
        </div>`;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* run (scripts are at end of body, DOM is ready) */
  updateBadges();
  if (document.getElementById("cartItems")) { bindCartEvents(); renderCartPage(); }
  initCheckout();
})();
