/* =========================================================================
   Observatoire Arizona — Rire jaune : mot du jour, bingo, langue de bois, calculette
   Aucune donnée n'est enregistrée ni transmise.
   ========================================================================= */
(function () {
  "use strict";
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- le mot jaune (pied de page) ---------- */
  var dj = document.querySelector("[data-dico]");
  var D = (window.OPUS && window.OPUS.dico) || [];
  if (dj && D.length) {
    var e = pick(D);
    dj.innerHTML = "<strong>" + esc(e.t) + "</strong> — " + esc(e.d);
    dj.setAttribute("href", "dictionnaire.html#" + e.a);
  }

  /* ---------- bingo ---------- */
  var bw = document.querySelector("[data-bingo]");
  if (bw) {
    var cells = Array.prototype.slice.call(bw.querySelectorAll(".bingo-cell"));
    var status = bw.querySelector("[data-bingo-status]");
    var LINES = [];
    for (var i = 0; i < 5; i++) {
      LINES.push([0, 1, 2, 3, 4].map(function (j) { return i * 5 + j; }));
      LINES.push([0, 1, 2, 3, 4].map(function (j) { return j * 5 + i; }));
    }
    LINES.push([0, 6, 12, 18, 24]); LINES.push([4, 8, 12, 16, 20]);
    var won = false;
    function on(c) { return c.getAttribute("aria-pressed") === "true"; }
    function check() {
      var n = cells.filter(on).length - 1;
      var line = LINES.some(function (l) { return l.every(function (k) { return on(cells[k]); }); });
      if (line && !won) { won = true; bw.classList.add("won"); status.textContent = "Bingo ! Vous avez gagné le droit de relire la page « Qui paie ». Servez-vous une frite."; }
      else if (!line) { won = false; bw.classList.remove("won"); status.textContent = n > 0 ? n + " mot" + (n > 1 ? "s" : "") + " coché" + (n > 1 ? "s" : "") + ". Tenez bon." : "Cliquez sur les mots entendus."; }
    }
    cells.forEach(function (c) {
      if (c.hasAttribute("data-free")) return;
      c.addEventListener("click", function () { c.setAttribute("aria-pressed", on(c) ? "false" : "true"); check(); });
    });
    var nb = bw.querySelector("[data-bingo-new]");
    if (nb) nb.addEventListener("click", function () {
      var free = cells.filter(function (c) { return !c.hasAttribute("data-free"); });
      var words = free.map(function (c) { return c.textContent; });
      for (var k = words.length - 1; k > 0; k--) { var r = Math.floor(Math.random() * (k + 1)); var t = words[k]; words[k] = words[r]; words[r] = t; }
      free.forEach(function (c, idx) { c.textContent = words[idx]; c.setAttribute("aria-pressed", "false"); });
      check();
    });
    check();
  }

  /* ---------- langue de bois ---------- */
  var L = document.querySelector("[data-ldb]");
  if (L) {
    var A = ["Dans un esprit de responsabilité,", "Face aux défis qui sont les nôtres,", "Sans tabou mais avec courage,", "Conformément à la trajectoire européenne,", "Pour les générations futures,", "Dans le respect de l'accord de coalition,", "Au terme d'un conclave constructif,", "Sans toucher au pouvoir d'achat,", "Comme Héraclès à la croisée des chemins,", "Après avoir cuit le gâteau,"];
    var B = ["le gouvernement", "la coalition", "chaque partenaire", "le kern", "notre majorité", "l'équipe fédérale"];
    var C = ["activera", "responsabilisera", "optimisera", "rationalisera", "réformera structurellement", "sanctuarisera", "fera porter un effort équilibré sur", "protégera"];
    var Dd = ["les épaules les plus larges", "les allocataires de longue durée", "la lasagne budgétaire", "les voitures de société", "le gâteau avant son partage", "la trajectoire du redressement", "les recettes non documentées", "l'index, mais en cents"];
    var E = [", dans un souci d'équilibre.", ", sans nouvelle taxe.", ", d'ici 2070.", ", en concertation avec personne.", ", sous réserve de l'avis de la Cour des comptes.", ", pour que le travail paie, un jour.", " — et ce n'est qu'un début.", ", dans le respect des juges, en principe."];
    var out = L.querySelector("[data-ldb-out]");
    L.querySelector("[data-ldb-go]").addEventListener("click", function () {
      out.textContent = pick(A) + " " + pick(B) + " " + pick(C) + " " + pick(Dd) + pick(E);
    });
  }

  /* ---------- calculette de l'absurde ---------- */
  var ab = document.querySelector("[data-absurde]");
  if (ab) {
    var U = [
      ["F-35", 1670000000 / 11],
      ["années d'avantage fiscal des voitures de société", 5000000000],
      ["années de manne Euroclear pour la défense", 1163000000],
      ["jours d'aide alimentaire fédérale (budget 2026)", 15000000 / 365],
      ["minervals à 1 194 €", 1194],
      ["demandes de nationalité à 1 000 €", 1000],
      ["pertes d'index annuelles d'un salarié à 5 000 € brut", 110],
      ["taxes d'embarquement à 7 €", 7]
    ];
    var input = ab.querySelector("#ab-montant"), res = ab.querySelector("[data-ab-out]");
    function fmt(x) {
      if (x >= 100) return new Intl.NumberFormat("fr-BE", { maximumFractionDigits: 0 }).format(x);
      if (x >= 1) return new Intl.NumberFormat("fr-BE", { maximumFractionDigits: 1 }).format(x);
      if (x === 0) return "0";
      return new Intl.NumberFormat("fr-BE", { maximumSignificantDigits: 2 }).format(x);
    }
    function run() {
      var v = parseFloat(String(input.value).replace(",", "."));
      if (isNaN(v) || v < 0) { res.innerHTML = "<p>Entrez un montant positif.</p>"; return; }
      res.innerHTML = "<p class='ab-lead'>" + fmt(v) + " € équivalent à :</p>" + U.map(function (u) {
        return "<div class='out-row'><span>" + esc(u[0]) + "</span><b>" + fmt(v / u[1]) + "</b></div>";
      }).join("");
    }
    input.addEventListener("input", run);
    ab.querySelectorAll("[data-amount]").forEach(function (b) {
      b.addEventListener("click", function () { input.value = b.getAttribute("data-amount"); run(); });
    });
    run();
  }
})();
