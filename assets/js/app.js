/* =========================================================================
   Opus · Arizona — comportements communs (thème, sommaire, progression…)
   Amélioration progressive : tout le contenu reste lisible sans JavaScript.
   ========================================================================= */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ---------- thème clair / sombre ---------- */
  function storedTheme() { try { return localStorage.getItem("haha-theme"); } catch (e) { return null; } }
  function storeTheme(v) { try { localStorage.setItem("haha-theme", v); } catch (e) {} }
  function systemDark() { return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; }
  function currentTheme() { return root.getAttribute("data-theme") || (systemDark() ? "dark" : "light"); }
  document.querySelectorAll(".theme-toggle").forEach(function (b) {
    b.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      storeTheme(next);
      b.setAttribute("aria-label", next === "dark" ? "Passer en thème clair" : "Passer en thème sombre");
    });
  });

  /* ---------- menu mobile : fermer après navigation ---------- */
  document.querySelectorAll(".mobile-menu a, .main-nav .dropdown a").forEach(function (a) {
    a.addEventListener("click", function () {
      var d = a.closest("details"); if (d) d.removeAttribute("open");
    });
  });
  document.addEventListener("click", function (e) {
    document.querySelectorAll(".main-nav details[open]").forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute("open"); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.querySelectorAll("details[open].nav-dd, details[open].mobile-menu").forEach(function (d) { d.removeAttribute("open"); });
  });

  /* ---------- ancres sur les titres + sommaire ---------- */
  function slug(s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  }
  var main = document.querySelector(".page-main");
  var tocList = document.querySelector(".toc ol");
  if (main) {
    var used = {};
    main.querySelectorAll("h2, h3").forEach(function (h) {
      if (h.closest(".tl-card, .card, .person, .procon, figure, .status-box, .gloss")) return;
      if (!h.id) { var s = slug(h.textContent) || "section"; var id = s, n = 2; while (used[id] || document.getElementById(id)) id = s + "-" + n++; h.id = id; }
      used[h.id] = true;
      var a = document.createElement("a"); a.className = "anchor"; a.href = "#" + h.id; a.setAttribute("aria-label", "Lien vers cette section"); a.textContent = "#";
      h.appendChild(a);
      if (tocList && !h.hasAttribute("data-notoc")) {
        var li = document.createElement("li"); li.className = h.tagName === "H3" ? "lvl3" : "lvl2";
        var l = document.createElement("a"); l.href = "#" + h.id; l.textContent = h.firstChild.textContent.trim();
        li.appendChild(l); tocList.appendChild(li);
      }
    });
    if (tocList && !tocList.children.length) { var t = document.querySelector(".toc"); if (t) t.remove(); var p = document.querySelector(".page.has-toc"); if (p) p.classList.remove("has-toc"); }
  }
  if (tocList && "IntersectionObserver" in window) {
    var links = {}; tocList.querySelectorAll("a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          tocList.querySelectorAll("a.active").forEach(function (x) { x.classList.remove("active"); });
          var a = links[en.target.id]; if (a) a.classList.add("active");
        }
      });
    }, { rootMargin: "-15% 0px -75% 0px" });
    Object.keys(links).forEach(function (id) { var h = document.getElementById(id); if (h) io.observe(h); });
  }

  /* ---------- barre de progression + retour en haut ---------- */
  var prog = document.querySelector(".progress");
  var back = document.querySelector(".back-top");
  function onScroll() {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    if (prog) prog.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    if (back) back.classList.toggle("show", h.scrollTop > 900);
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if (back) back.addEventListener("click", function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- dates relatives (agenda) ---------- */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  document.querySelectorAll("[data-reldate]").forEach(function (n) {
    var d = new Date(n.getAttribute("data-reldate") + "T00:00:00");
    if (isNaN(d)) return;
    var days = Math.round((d - today) / 86400000), s;
    if (days === 0) s = "aujourd'hui";
    else if (days === 1) s = "demain";
    else if (days > 1) s = "dans " + days + " jours";
    else if (days === -1) s = "hier";
    else s = "il y a " + (-days) + " jours";
    n.textContent = s;
  });

  /* ---------- infobulle des références : titre complet au survol (natif) ---------- */
  document.querySelectorAll('a[href^="http"]').forEach(function (a) {
    if (!a.getAttribute("rel")) a.setAttribute("rel", "noopener");
  });
})();
