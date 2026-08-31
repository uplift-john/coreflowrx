// CoreFlow Rx — small progressive-enhancement script (no dependencies).
// Kept external so the Content-Security-Policy needs no inline script handlers.
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  });
})();
