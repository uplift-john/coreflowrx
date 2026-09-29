// CoreFlow Rx — small progressive-enhancement script (no dependencies).
// Kept external so the Content-Security-Policy needs no inline script handlers.
(function () {
  "use strict";

  // Plausible bootstrap. Moved out of an inline <script> in layout.njk so the
  // planned enforcing CSP (script-src 'self' https://plausible.io, no
  // 'unsafe-inline') does not block analytics. The loader tag stays in <head>.
  window.plausible =
    window.plausible ||
    function () {
      (window.plausible.q = window.plausible.q || []).push(arguments);
    };
  window.plausible.init =
    window.plausible.init ||
    function (i) {
      window.plausible.o = i || {};
    };
  window.plausible.init();
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
