/* =========================================================
   Digital Shop — Cookie consent banner
   Self-contained: shows once until a choice is saved.
   ========================================================= */
(function () {
  // Show only on the home page
  var page = location.pathname.split("/").pop().toLowerCase();
  if (page !== "" && page !== "index.html") return;

  var KEY = "ds_cookie_consent";
  try { if (localStorage.getItem(KEY)) return; } catch (e) {}

  var bar = document.createElement("div");
  bar.id = "cookieBar";
  bar.setAttribute("role", "dialog");
  bar.setAttribute("aria-label", "הודעת עוגיות");
  bar.innerHTML =
    '<p><span class="cookie-emoji">🍪</span> אתר זה משתמש בעוגיות (Cookies) כדי לשפר את חוויית הגלישה שלך. ' +
    'לפרטים נוספים ניתן לעיין ב<a href="privacy.html">מדיניות הפרטיות</a>.</p>' +
    '<div class="cookie-actions">' +
    '<button class="btn btn--primary" data-cookie="all" type="button">מאשר/ת</button>' +
    '<button class="btn btn--ghost" data-cookie="necessary" type="button">ביטול</button>' +
    '</div>';
  document.body.appendChild(bar);

  // animate in
  setTimeout(function () { bar.classList.add("show"); }, 50);

  bar.addEventListener("click", function (e) {
    var b = e.target.closest("[data-cookie]");
    if (!b) return;
    try { localStorage.setItem(KEY, b.dataset.cookie); } catch (e) {}
    bar.classList.remove("show");
    setTimeout(function () { bar.remove(); }, 300);
  });
})();
