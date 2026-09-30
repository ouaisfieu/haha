/* =========================================================================
   Observatoire Arizona — calculateurs (Et moi ?) et arbitrage budgétaire
   Aucune donnée n'est enregistrée ni transmise.
   ========================================================================= */
(function () {
  "use strict";
  var nf0 = new Intl.NumberFormat("fr-BE", { maximumFractionDigits: 0 });
  var nf1 = new Intl.NumberFormat("fr-BE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  var nf2 = new Intl.NumberFormat("fr-BE", { maximumFractionDigits: 2 });
  function eur(x) { return nf0.format(Math.round(x)) + " €"; }
  function num(id) { var el = document.getElementById(id); if (!el) return NaN; var v = parseFloat(String(el.value).replace(",", ".")); return isNaN(v) ? NaN : v; }
  function el(id) { return document.getElementById(id); }
  function row(label, value, strong) { return "<div class='out-row" + (strong ? " out-strong" : "") + "'><span>" + label + "</span><b>" + value + "</b></div>"; }
  function bind(ids, fn) { ids.forEach(function (id) { var e = el(id); if (e) { e.addEventListener("input", fn); e.addEventListener("change", fn); } }); fn(); }

  /* ---------- 1. Index plafonné ---------- */
  if (el("ix-out")) bind(["ix-montant", "ix-type", "ix-annees"], function () {
    var m = num("ix-montant"), seuil = parseFloat(el("ix-type").value), ans = num("ix-annees");
    var out = el("ix-out");
    if (isNaN(m) || m < 0) { out.innerHTML = "<p>Indiquez un montant brut mensuel.</p>"; return; }
    if (isNaN(ans) || ans < 1) ans = 1;
    var perteMois = Math.max(0, m - seuil) * 0.02;
    if (perteMois === 0) {
      out.innerHTML = "<p class='out-verdict v-ok'>En dessous de " + eur(seuil) + " brut, l'indexation n'est pas plafonnée : vous ne perdez rien avec cette mesure.</p>";
      return;
    }
    var salaire = seuil === 4000, h = "";
    h += row("Non indexé chaque mois après 2026", eur(perteMois) + " brut");
    h += row("Après 2028 (deuxième saut partiel)", "≈ " + eur(perteMois * 2) + " brut par mois");
    if (salaire) {
      var netAn = perteMois * 5.5;
      h += row("Perte nette estimée par an, après 2026", "≈ " + eur(netAn));
      h += row("Perte nette estimée par an, après 2028", "≈ " + eur(netAn * 2));
      h += row("Sur " + nf0.format(ans) + " an" + (ans > 1 ? "s" : "") + " à partir de 2026 (net, sans rattrapage)", "≈ " + eur(netAn * Math.min(2, ans) + netAn * 2 * Math.max(0, ans - 2)), true);
    } else {
      h += row("Perte brute par an, après 2028", "≈ " + eur(perteMois * 2 * 12));
      h += row("Sur " + nf0.format(ans) + " an" + (ans > 1 ? "s" : "") + " à partir de 2026 (brut, sans rattrapage)", "≈ " + eur(perteMois * 12 * Math.min(2, ans) + perteMois * 24 * Math.max(0, ans - 2)), true);
    }
    out.innerHTML = h;
  });

  /* ---------- 2. Malus / bonus pension ---------- */
  if (el("pe-out")) bind(["pe-naissance", "pe-age", "pe-montant", "pe-35"], function () {
    var n = num("pe-naissance"), age = num("pe-age"), p = num("pe-montant"), ok35 = el("pe-35").checked;
    var out = el("pe-out");
    if (isNaN(n) || isNaN(age) || isNaN(p)) { out.innerHTML = "<p>Complétez les trois champs.</p>"; return; }
    if (n < 1961) { out.innerHTML = "<p>Les règles de malus s'appliquent aux départs à partir de 2027 : les personnes nées avant 1961 ont atteint l'âge légal avant cette date.</p>"; return; }
    var legal = n <= 1963 ? 66 : 67, h = row("Âge légal (approximation)", legal + " ans");
    var diff = legal - age;
    if (diff > 0) {
      if (age < 60) { out.innerHTML = h + "<p>La retraite anticipée n'est pas possible avant 60 ans.</p>"; return; }
      if (ok35) {
        h += "<p class='out-verdict v-ok'>Avec 35 années d'au moins 156 jours, pas de malus : votre pension n'est pas réduite pour un départ à " + age + " ans (si vous remplissez les conditions de la retraite anticipée).</p>";
      } else {
        var taux = n <= 1965 ? 2 : (n <= 1974 ? 4 : 5), malus = taux * diff;
        h += row("Malus", taux + " % × " + diff + " an" + (diff > 1 ? "s" : "") + " = " + malus + " %");
        h += row("Réduction mensuelle", "− " + eur(p * malus / 100));
        h += row("Pension après malus", eur(p * (1 - malus / 100)) + " brut / mois", true);
        h += row("Sur 20 ans de pension (hypothèse)", "− " + eur(p * malus / 100 * 12 * 20));
        h += "<p class='out-verdict v-bad'>Les carrières à temps partiel, interrompues ou marquées par le chômage et la maladie sont les plus exposées : dès 2027, une année ne compte que si elle totalise 156 jours.</p>";
      }
    } else if (diff < 0) {
      var extra = -diff;
      if (ok35) {
        var tb = n < 1963 ? 2 : (n <= 1972 ? 4 : 5), bonus = tb * extra;
        h += row("Bonus", tb + " % × " + extra + " an" + (extra > 1 ? "s" : "") + " = " + bonus + " %");
        h += row("Pension après bonus", eur(p * (1 + bonus / 100)) + " brut / mois", true);
      } else {
        h += "<p>Sans 35 années de 156 jours, pas de bonus pour les années travaillées au-delà de l'âge légal.</p>";
      }
    } else {
      h += "<p class='out-verdict v-ok'>Départ à l'âge légal : ni malus ni bonus.</p>";
    }
    out.innerHTML = h;
  });

  /* ---------- 3. Plus-values ---------- */
  if (el("pv-out")) bind(["pv-gain", "pv-avant", "pv-regime"], function () {
    var g = num("pv-gain"), av = num("pv-avant"), reg = el("pv-regime").value, out = el("pv-out");
    if (isNaN(g) || g < 0) { out.innerHTML = "<p>Indiquez une plus-value.</p>"; return; }
    if (isNaN(av) || av < 0) av = 0;
    var base = Math.max(0, g - Math.min(av, g)), tax = 0, detail = "";
    if (reg === "general") {
      tax = Math.max(0, base - 10000) * 0.10; detail = "10 % au-delà de 10 000 €";
    } else if (reg === "interne") {
      tax = base * 0.33; detail = "33 %";
    } else {
      var tr = [[1e6, 0], [2.5e6, 0.0125], [5e6, 0.025], [1e7, 0.05], [Infinity, 0.10]], prev = 0;
      tr.forEach(function (t) { if (base > prev) { tax += (Math.min(base, t[0]) - prev) * t[1]; } prev = t[0]; });
      detail = "barème progressif 0 / 1,25 / 2,5 / 5 / 10 %";
    }
    var eff = g > 0 ? tax / g * 100 : 0, h = "";
    if (av > 0) h += row("Part exonérée (latente au 31/12/2025)", eur(Math.min(av, g)));
    h += row("Base taxable", eur(base));
    h += row("Impôt (" + detail + ")", eur(tax), true);
    h += row("Taux effectif sur la plus-value totale", nf2.format(eff) + " %");
    if (reg === "important" && base > 10000) h += "<p class='out-verdict v-bad'>À comparer : la même plus-value dans le régime général (actions en bourse, fonds) serait taxée " + eur((base - 10000) * 0.10) + ", et " + eur(base * 0.33) + " en plus-value interne.</p>";
    out.innerHTML = h;
  });

  /* ---------- 4. Arbitrage budgétaire ---------- */
  var arb = document.querySelector("[data-arb]");
  if (arb) {
    var target = parseFloat(arb.getAttribute("data-target")) || 10;
    var opts = Array.prototype.slice.call(arb.querySelectorAll("[data-opt]"));
    var hyp = "mid";
    var LABELS = { patrimoine: "Grands patrimoines, revenus du capital", hauts: "Hauts revenus, avantages salariaux", menages: "Tous les ménages (consommation)", malades: "Patients, malades, soignants", entreprises: "Entreprises, employeurs", defense: "Dépenses militaires" };
    function val(o) { var lo = parseFloat(o.getAttribute("data-low")), hi = parseFloat(o.getAttribute("data-high")); return hyp === "low" ? lo : hyp === "high" ? hi : (lo + hi) / 2; }
    function update() {
      var total = 0, by = {}, n = 0;
      opts.forEach(function (o) {
        var cb = o.querySelector("input"); o.classList.toggle("is-on", cb.checked);
        if (!cb.checked) return; n++;
        var v = val(o), k = o.getAttribute("data-payer"); total += v; by[k] = (by[k] || 0) + v;
      });
      total = Math.round(total * 10) / 10;
      arb.querySelector("[data-total]").textContent = nf1.format(total) + " Md€";
      var pct = Math.min(100, total / target * 100);
      arb.querySelector("[data-fill]").style.width = pct + "%";
      arb.querySelector("[data-fill]").classList.toggle("done", total >= target);
      arb.querySelector("[data-meter]").setAttribute("aria-label", nf1.format(total) + " milliards sur un objectif de " + target);
      var st = arb.querySelector("[data-status]");
      if (!n) st.textContent = "Cochez des pistes pour composer votre budget.";
      else if (total >= target) st.textContent = "Objectif atteint avec " + n + " piste" + (n > 1 ? "s" : "") + " (" + nf1.format(total - target) + " Md€ de marge).";
      else st.textContent = "Il manque " + nf1.format(target - total) + " Md€.";
      var ul = arb.querySelector("[data-payers]"), keys = Object.keys(by).sort(function (a, b) { return by[b] - by[a]; });
      ul.innerHTML = keys.length ? keys.map(function (k) {
        var share = by[k] / total * 100;
        return "<li><span class='p-lab'>" + LABELS[k] + "</span><span class='p-bar'><span style='width:" + share.toFixed(1) + "%'></span></span><span class='p-val'>" + nf1.format(by[k]) + " Md€ · " + nf0.format(share) + " %</span></li>";
      }).join("") : "<li class='p-empty'>—</li>";
    }
    opts.forEach(function (o) { o.querySelector("input").addEventListener("change", update); });
    arb.querySelectorAll("[data-hyp]").forEach(function (b) {
      b.addEventListener("click", function () {
        hyp = b.getAttribute("data-hyp");
        arb.querySelectorAll("[data-hyp]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        update();
      });
    });
    arb.querySelectorAll("[data-preset]").forEach(function (b) {
      b.addEventListener("click", function () {
        var ids = (b.getAttribute("data-preset") || "").split(" ").filter(Boolean);
        opts.forEach(function (o) { var cb = o.querySelector("input"); cb.checked = ids.indexOf(cb.id) !== -1; });
        update();
      });
    });
    update();
  }
  document.querySelectorAll(".noscript-note").forEach(function (n) { if (n.parentNode && n.parentNode.children.length > 1) n.remove(); });
})();
