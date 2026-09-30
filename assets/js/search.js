/* =========================================================================
   Opus · Arizona — recherche plein texte côté client (index : data/search-index.js)
   ========================================================================= */
(function () {
  "use strict";
  var INDEX = (window.OPUS && window.OPUS.search) || [];
  var input = document.getElementById("q");
  var list = document.getElementById("results");
  var status = document.getElementById("search-status");
  if (!input || !list) return;

  function norm(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  INDEX.forEach(function (e) { e._t = norm(e.t); e._x = norm(e.x); });

  function snippet(text, terms) {
    var n = norm(text), pos = -1;
    for (var i = 0; i < terms.length && pos < 0; i++) pos = n.indexOf(terms[i]);
    var start = Math.max(0, pos - 90), end = Math.min(text.length, (pos < 0 ? 0 : pos) + 200);
    var s = (start > 0 ? "… " : "") + text.slice(start, end) + (end < text.length ? " …" : "");
    return s;
  }
  function highlight(node, text, terms) {
    var n = norm(text), i = 0;
    var ranges = [];
    terms.forEach(function (t) {
      if (!t) return; var from = 0, p;
      while ((p = n.indexOf(t, from)) !== -1) { ranges.push([p, p + t.length]); from = p + t.length; }
    });
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    ranges.forEach(function (r) {
      if (r[0] < i) return;
      node.appendChild(document.createTextNode(text.slice(i, r[0])));
      var m = document.createElement("mark"); m.textContent = text.slice(r[0], r[1]); node.appendChild(m);
      i = r[1];
    });
    node.appendChild(document.createTextNode(text.slice(i)));
  }

  function run() {
    var q = norm(input.value.trim());
    list.innerHTML = "";
    if (q.length < 2) { status.textContent = "Saisissez au moins deux caractères."; return; }
    var terms = q.split(/\s+/).filter(Boolean);
    var res = [];
    INDEX.forEach(function (e) {
      var score = 0, ok = true;
      terms.forEach(function (t) {
        var inT = e._t.indexOf(t) !== -1, inX = e._x.indexOf(t) !== -1;
        if (!inT && !inX) ok = false;
        score += (inT ? 5 : 0) + (inX ? 1 : 0);
      });
      if (ok) res.push({ e: e, s: score + (e.k === "Page" ? 2 : 0) });
    });
    res.sort(function (a, b) { return b.s - a.s; });
    status.textContent = res.length ? res.length + " résultat" + (res.length > 1 ? "s" : "") : "Aucun résultat. Essayez un autre mot (par exemple « pension », « TVA », « CPAS »).";
    res.slice(0, 60).forEach(function (r) {
      var li = document.createElement("li");
      var k = document.createElement("div"); k.className = "r-kind"; k.textContent = r.e.k; li.appendChild(k);
      var a = document.createElement("a"); a.className = "r-title"; a.href = r.e.u; highlight(a, r.e.t, terms); li.appendChild(a);
      var p = document.createElement("p"); highlight(p, snippet(r.e.x, terms), terms); li.appendChild(p);
      list.appendChild(li);
    });
    try { history.replaceState(null, "", "?q=" + encodeURIComponent(input.value.trim())); } catch (e) {}
  }
  var params = new URLSearchParams(location.search);
  if (params.get("q")) input.value = params.get("q");
  input.addEventListener("input", run);
  run();
  input.focus();
})();
