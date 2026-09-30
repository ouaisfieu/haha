/* =========================================================================
   Opus · Arizona — filtres génériques (chronologie, suivi, sources, glossaire)
   Structure attendue :
     [data-filter-root]
       [data-filter-search]            champ texte (optionnel)
       [data-filter-group="nom"] > button.chip[data-value]   (optionnel, un ou plusieurs groupes)
       [data-filter-toggle="attr"]     case à cocher masquant les éléments data-attr="1" (optionnel)
       [data-filter-count]             compteur (optionnel)
       [data-item][data-nom="valeur valeur2"]  éléments filtrables
       [data-group-head]               titres de groupe masqués s'ils n'ont plus d'éléments (optionnel)
   ========================================================================= */
(function () {
  "use strict";
  function norm(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  document.querySelectorAll("[data-filter-root]").forEach(function (rootEl) {
    var items = Array.prototype.slice.call(rootEl.querySelectorAll("[data-item]"));
    var input = rootEl.querySelector("[data-filter-search]");
    var counter = rootEl.querySelector("[data-filter-count]");
    var groups = Array.prototype.slice.call(rootEl.querySelectorAll("[data-filter-group]"));
    var toggles = Array.prototype.slice.call(rootEl.querySelectorAll("[data-filter-toggle]"));
    var heads = Array.prototype.slice.call(rootEl.querySelectorAll("[data-group-head]"));
    items.forEach(function (it) { it._txt = norm(it.textContent); });

    // lecture de l'URL (?q=…&theme=…)
    var params = new URLSearchParams(location.search);
    if (input && params.get("q")) input.value = params.get("q");
    groups.forEach(function (g) {
      var name = g.getAttribute("data-filter-group"), v = params.get(name);
      if (v) g.querySelectorAll("button[data-value]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.value === v ? "true" : "false"); });
    });

    function apply() {
      var q = input ? norm(input.value.trim()) : "";
      var terms = q ? q.split(/\s+/) : [];
      var active = {};
      groups.forEach(function (g) {
        var name = g.getAttribute("data-filter-group");
        var on = Array.prototype.slice.call(g.querySelectorAll('button[aria-pressed="true"]')).map(function (b) { return b.dataset.value; }).filter(function (v) { return v !== "*"; });
        if (on.length) active[name] = on;
      });
      var hideAttrs = toggles.filter(function (t) { return !t.checked; }).map(function (t) { return t.getAttribute("data-filter-toggle"); });
      var shown = 0;
      items.forEach(function (it) {
        var ok = terms.every(function (t) { return it._txt.indexOf(t) !== -1; });
        if (ok) for (var name in active) {
          var vals = (it.getAttribute("data-" + name) || "").split(" ");
          if (!active[name].some(function (v) { return vals.indexOf(v) !== -1; })) { ok = false; break; }
        }
        if (ok) hideAttrs.forEach(function (a) { if (it.getAttribute("data-" + a) === "1") ok = false; });
        it.hidden = !ok; if (ok) shown++;
      });
      heads.forEach(function (h) {
        var key = h.getAttribute("data-group-head"), any = false;
        items.forEach(function (it) { if (!it.hidden && it.getAttribute("data-group") === key) any = true; });
        h.hidden = !any;
      });
      if (counter) counter.textContent = shown + " élément" + (shown > 1 ? "s" : "") + " affiché" + (shown > 1 ? "s" : "") + " sur " + items.length;
    }

    groups.forEach(function (g) {
      var multi = g.hasAttribute("data-multi");
      g.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-value]"); if (!b) return;
        var all = g.querySelector('button[data-value="*"]');
        if (b.dataset.value === "*") {
          g.querySelectorAll("button[data-value]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        } else if (multi) {
          b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
          var anyOn = g.querySelector('button[data-value]:not([data-value="*"])[aria-pressed="true"]');
          if (all) all.setAttribute("aria-pressed", anyOn ? "false" : "true");
        } else {
          g.querySelectorAll("button[data-value]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        }
        apply();
      });
    });
    if (input) input.addEventListener("input", apply);
    toggles.forEach(function (t) { t.addEventListener("change", apply); });
    apply();
  });
})();
