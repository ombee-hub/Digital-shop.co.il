/* =========================================================
   Digital Shop — Cookie consent banner
   Self-contained: shows once until a choice is saved.
   ========================================================= */
(function () {
  var KEY = "ds_cookie_consent";
  try { if (localStorage.getItem(KEY)) return; } catch (e) {}

  var bar = document.createElement("div");
  bar.id = "cookieBar";
  bar.setAttribute("role", "dialog");
  bar.setAttribute("aria-label", "הודעת עוגיות");
  bar.innerHTML =
    '<h3>🍪 אנחנו משתמשים בעוגיות</h3>' +
    '<p>אנו משתמשים בעוגיות כדי לשפר את חוויית הגלישה, לנתח שימוש ולהתאים תוכן ומבצעים. ' +
    'בהמשך הגלישה את/ה מאשר/ת את השימוש בעוגיות. לפרטים נוספים עיין/ני ב<a href="privacy.html">מדיניות הפרטיות</a>.</p>' +
    '<div class="cookie-actions">' +
    '<button class="btn btn--primary" data-cookie="all" type="button">אישור הכל</button>' +
    '<button class="btn btn--ghost" data-cookie="necessary" type="button">רק הכרחיות</button>' +
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
