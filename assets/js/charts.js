/* =========================================================================
   Opus · Arizona — mini-bibliothèque de graphiques SVG (vanilla, sans dépendance)
   Lit les données dans window.OPUS.chiffres (data/chiffres.js).
   Chaque graphique a une version tableau pré-rendue dans le HTML (<details>).
   ========================================================================= */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var DATA = (window.OPUS && window.OPUS.chiffres) || {};
  var tooltip;

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(name, attrs, content, parent) {
    var n = el(name, attrs, parent);
    n.textContent = content;
    return n;
  }
  function fmt(v, dec) {
    if (v === null || v === undefined || isNaN(v)) return "–";
    return Number(v).toLocaleString("fr-BE", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  function niceStep(v) {
    if (v <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / p;
    var m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return m * p;
  }
  function niceMax(v) {
    if (v <= 0) return 1;
    var step = niceStep(v / 4);
    return Math.ceil(v / step) * step;
  }
  function ticks(max, count) {
    var step = niceStep(max / count);
    var out = [];
    for (var t = 0; t <= max + 1e-9; t += step) out.push(+t.toFixed(6));
    return out;
  }
  function roundedTopRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h);
    return "M" + x + "," + (y + h) + " L" + x + "," + (y + r) + " Q" + x + "," + y + " " + (x + r) + "," + y +
      " L" + (x + w - r) + "," + y + " Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + r) +
      " L" + (x + w) + "," + (y + h) + " Z";
  }
  function roundedRightRect(x, y, w, h, r) {
    r = Math.min(r, h / 2, w);
    return "M" + x + "," + y + " L" + (x + w - r) + "," + y + " Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + r) +
      " L" + (x + w) + "," + (y + h - r) + " Q" + (x + w) + "," + (y + h) + " " + (x + w - r) + "," + (y + h) +
      " L" + x + "," + (y + h) + " Z";
  }
  function textWidth(s, size) { return s.length * size * 0.58; }

  /* ---------- tooltip ---------- */
  function ensureTooltip() {
    if (tooltip) return tooltip;
    tooltip = document.createElement("div");
    tooltip.className = "chart-tooltip";
    tooltip.setAttribute("role", "status");
    tooltip.setAttribute("aria-live", "polite");
    document.body.appendChild(tooltip);
    return tooltip;
  }
  function showTip(evt, rows, target) {
    var t = ensureTooltip();
    t.innerHTML = "";
    rows.forEach(function (r, i) {
      var line = document.createElement("div");
      if (i === 0 && r.strong) {
        var s = document.createElement("strong");
        s.textContent = r.strong;
        line.appendChild(s);
      } else {
        line.className = "tt-row" + (r.muted ? " tt-muted" : "");
        if (r.color) {
          var k = document.createElement("span");
          k.className = "tt-key";
          k.style.background = r.color;
          line.appendChild(k);
        }
        var sp = document.createElement("span");
        sp.textContent = r.text;
        line.appendChild(sp);
      }
      t.appendChild(line);
    });
    var x, y;
    if (evt && evt.clientX !== undefined && evt.type.indexOf("pointer") === 0) { x = evt.clientX; y = evt.clientY; }
    else { var b = target.getBoundingClientRect(); x = b.left + b.width / 2; y = b.top; }
    t.classList.add("show");
    var tw = t.offsetWidth, th = t.offsetHeight;
    var left = Math.min(Math.max(8, x + 14), window.innerWidth - tw - 8);
    var top = y - th - 12; if (top < 8) top = y + 18;
    t.style.left = left + "px"; t.style.top = top + "px";
  }
  function hideTip() { if (tooltip) tooltip.classList.remove("show"); }
  function bindTip(node, rowsFn) {
    node.setAttribute("tabindex", "0");
    node.addEventListener("pointerenter", function (e) { showTip(e, rowsFn(), node); });
    node.addEventListener("pointermove", function (e) { showTip(e, rowsFn(), node); });
    node.addEventListener("pointerleave", hideTip);
    node.addEventListener("focus", function (e) { showTip(e, rowsFn(), node); });
    node.addEventListener("blur", hideTip);
  }
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  /* ---------- 1. colonnes (une série, statut réalisé / prévision / objectif) ---------- */
  function columns(host, cfg) {
    var d = DATA[cfg.key]; if (!d) return;
    var pts = d.points, dec = +(host.dataset.decimals || 1), suffix = host.dataset.suffix || "";
    var W = Math.max(300, host.clientWidth), H = +(host.dataset.height || 260);
    var m = { t: 24, r: 8, b: 46, l: 38 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var max = niceMax(Math.max.apply(null, pts.map(function (p) { return p.value; })) * 1.1);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": d.titre });
    var defs = el("defs", null, svg);
    var pat = el("pattern", { id: "hatch-" + cfg.key, width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    el("rect", { width: 6, height: 6, fill: cssVar("--series-1"), opacity: .35 }, pat);
    el("line", { x1: 0, y1: 0, x2: 0, y2: 6, stroke: cssVar("--series-1"), "stroke-width": 2.2 }, pat);
    var g = el("g", { transform: "translate(" + m.l + "," + m.t + ")" }, svg);
    ticks(max, 4).forEach(function (t) {
      var y = ih - (t / max) * ih;
      el("line", { class: t === 0 ? "baseline" : "gridline", x1: 0, x2: iw, y1: y, y2: y }, g);
      txt("text", { class: "tick", x: -8, y: y + 4, "text-anchor": "end" }, fmt(t, t % 1 ? 1 : 0), g).setAttribute("class", "tick-text");
    });
    g.querySelectorAll(".tick-text").forEach(function (n) { n.setAttribute("style", "fill:var(--chart-muted);font-size:12px"); });
    var band = iw / pts.length, bw = Math.min(56, band * 0.56);
    pts.forEach(function (p, i) {
      var h = (p.value / max) * ih, x = i * band + (band - bw) / 2, y = ih - h;
      var fill = p.statut === "prévision" ? "url(#hatch-" + cfg.key + ")" : p.statut === "objectif" ? cssVar("--series-2") : cssVar("--series-1");
      var row = el("g", { class: "row" }, g);
      el("path", { class: "mark", d: roundedTopRect(x, y, bw, h, 4), fill: fill }, row);
      txt("text", { class: "val-label", x: x + bw / 2, y: y - 7, "text-anchor": "middle" }, fmt(p.value, dec) + suffix, row);
      var lab = p.label, words = lab.split(" (");
      txt("text", { class: "cat-label", x: x + bw / 2, y: ih + 18, "text-anchor": "middle" }, words[0], row);
      if (words[1]) txt("text", { class: "axis-label", x: x + bw / 2, y: ih + 33, "text-anchor": "middle" }, "(" + words[1], row);
      var hit = el("rect", { class: "hit", role: "img", x: i * band, y: 0, width: band, height: ih + 36, "aria-label": lab + " : " + fmt(p.value, dec) + suffix + (p.statut ? " (" + p.statut + ")" : "") }, row);
      bindTip(hit, function () {
        return [{ strong: fmt(p.value, dec) + suffix }, { text: lab }, p.statut ? { text: p.statut, muted: true } : null].filter(Boolean);
      });
    });
    host.innerHTML = ""; host.appendChild(svg);
  }

  /* ---------- 2. barres horizontales (une série) ---------- */
  function hbars(host, cfg) {
    var d = DATA[cfg.key]; if (!d) return;
    var pts = d.points, dec = +(host.dataset.decimals || 1), suffix = host.dataset.suffix || "";
    var top = host.dataset.labels === "top";
    var W = Math.max(300, host.clientWidth);
    function lab(p) { return p.display || (fmt(p.value, dec) + suffix); }
    var labelW = top ? 0 : Math.min(230, Math.max.apply(null, pts.map(function (p) { return textWidth(p.label, 12.5) * 1.12; })) + 12);
    var valW = Math.max.apply(null, pts.map(function (p) { return textWidth(lab(p), 12.5) * 1.1; })) + 10;
    var rowH = top ? 50 : 34, m = { t: 6, r: Math.max(60, valW), b: 8, l: top ? 2 : labelW };
    var H = m.t + m.b + pts.length * rowH, iw = W - m.l - m.r;
    var max = niceMax(Math.max.apply(null, pts.map(function (p) { return p.value; })));
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": d.titre });
    var g = el("g", { transform: "translate(" + m.l + "," + m.t + ")" }, svg);
    el("line", { class: "baseline", x1: 0, x2: 0, y1: 0, y2: pts.length * rowH }, g);
    pts.forEach(function (p, i) {
      var y = top ? i * rowH + 24 : i * rowH + (rowH - 18) / 2, w = (p.value / max) * iw;
      var row = el("g", { class: "row" }, g);
      var hl = cfg.highlight && p.label === cfg.highlight;
      if (top) txt("text", { class: "cat-label", x: 6, y: i * rowH + 16, "font-weight": hl ? 700 : 400 }, p.label, row);
      else txt("text", { class: "cat-label", x: -10, y: y + 13, "text-anchor": "end", "font-weight": hl ? 700 : 400 }, p.label, row);
      el("path", { class: "mark", d: roundedRightRect(0, y, Math.max(w, 2), 18, 4), fill: hl ? cssVar("--series-2") : cssVar("--series-1") }, row);
      txt("text", { class: "val-label", x: Math.max(w, 2) + 6, y: y + 13 }, lab(p), row);
      var hit = el("rect", { class: "hit", role: "img", x: top ? -2 : -labelW, y: i * rowH, width: W, height: rowH, "aria-label": p.label + " : " + lab(p) }, row);
      bindTip(hit, function () { return [{ strong: lab(p) }, { text: p.label }]; });
    });
    host.innerHTML = ""; host.appendChild(svg);
  }

  /* ---------- 3. haltères (sondage 2024 -> 2026) ---------- */
  function dumbbell(host, cfg) {
    var d = DATA.sondages; if (!d) return;
    var reg = d.regions[cfg.region]; if (!reg) return;
    var pts = reg.partis;
    var W = Math.max(290, host.clientWidth);
    var labelW = Math.min(190, Math.max.apply(null, pts.map(function (p) { return textWidth(p.parti + (p.arizona ? " ●" : ""), 12.5) * 1.1; })) + 12);
    var rowH = 30, m = { t: 22, r: 104, b: 6, l: labelW };
    var H = m.t + m.b + pts.length * rowH, iw = W - m.l - m.r;
    var max = 35;
    var c1 = cssVar("--series-1"), c2 = cssVar("--series-2");
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Intentions de vote " + cfg.region });
    var g = el("g", { transform: "translate(" + m.l + "," + m.t + ")" }, svg);
    [0, 10, 20, 30].forEach(function (t) {
      var x = (t / max) * iw;
      el("line", { class: t === 0 ? "baseline" : "gridline", x1: x, x2: x, y1: -4, y2: pts.length * rowH }, g);
      txt("text", { x: x, y: -8, "text-anchor": "middle", style: "fill:var(--chart-muted);font-size:11px" }, t + " %", g);
    });
    pts.forEach(function (p, i) {
      var cy = i * rowH + rowH / 2;
      var row = el("g", { class: "row" }, g);
      txt("text", { class: "cat-label", x: -10, y: cy + 4, "text-anchor": "end", "font-weight": p.arizona ? 700 : 400 }, p.parti + (p.arizona ? " ●" : ""), row);
      var x2 = (p.v2026 / max) * iw;
      if (p.v2024 !== null && p.v2024 !== undefined) {
        var x1 = (p.v2024 / max) * iw;
        el("line", { x1: x1, x2: x2, y1: cy, y2: cy, stroke: cssVar("--line-2"), "stroke-width": 2, "stroke-linecap": "round" }, row);
        el("circle", { class: "mark", cx: x1, cy: cy, r: 5, fill: cssVar("--surface"), stroke: c1, "stroke-width": 2.5 }, row);
      }
      el("circle", { class: "mark", cx: x2, cy: cy, r: 6, fill: c2, stroke: cssVar("--surface"), "stroke-width": 2 }, row);
      var delta = (p.v2024 !== null && p.v2024 !== undefined) ? (p.v2026 - p.v2024) : null;
      var lab = fmt(p.v2026, 1) + " %" + (delta !== null ? "  (" + (delta >= 0 ? "+" : "−") + fmt(Math.abs(delta), 1) + ")" : "");
      txt("text", { class: "val-label", x: iw + 8, y: cy + 4, style: "font-size:12px" }, lab, row);
      var hit = el("rect", { class: "hit", role: "img", x: -labelW, y: i * rowH, width: W, height: rowH,
        "aria-label": p.parti + " : " + fmt(p.v2026, 1) + " % en septembre 2026" + (delta !== null ? ", " + fmt(p.v2024, 1) + " % en 2024" : "") }, row);
      bindTip(hit, function () {
        var r = [{ strong: p.parti }, { text: "Sept. 2026 : " + fmt(p.v2026, 1) + " %", color: c2 }];
        if (delta !== null) {
          r.push({ text: "2024 : " + fmt(p.v2024, 2) + " %", color: c1 });
          r.push({ text: "Écart : " + (delta >= 0 ? "+" : "−") + fmt(Math.abs(delta), 1) + " point(s)", muted: true });
        }
        if (p.arizona) r.push({ text: "Parti de la majorité fédérale", muted: true });
        return r;
      });
    });
    host.innerHTML = ""; host.appendChild(svg);
  }

  /* ---------- 4. intervalles (estimations basse / haute) ---------- */
  function range(host, cfg) {
    var d = DATA[cfg.key]; if (!d) return;
    var pts = d.points;
    var W = Math.max(300, host.clientWidth);
    var labelW = 100, rowH = 34, m = { t: 22, r: 18, b: 6, l: labelW };
    var H = m.t + m.b + pts.length * rowH, iw = W - m.l - m.r;
    var max = 150000;
    var c1 = cssVar("--series-1"), c2 = cssVar("--series-2");
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": d.titre });
    var g = el("g", { transform: "translate(" + m.l + "," + m.t + ")" }, svg);
    [0, 50000, 100000, 150000].forEach(function (t) {
      var x = (t / max) * iw;
      el("line", { class: t === 0 ? "baseline" : "gridline", x1: x, x2: x, y1: -4, y2: pts.length * rowH }, g);
      txt("text", { x: x, y: -8, "text-anchor": t === 0 ? "start" : "middle", style: "fill:var(--chart-muted);font-size:11px" }, t === 0 ? "0" : (t / 1000) + " 000", g);
    });
    pts.forEach(function (p, i) {
      var cy = i * rowH + rowH / 2, x1 = (p.low / max) * iw, x2 = (p.high / max) * iw;
      var row = el("g", { class: "row" }, g);
      txt("text", { class: "cat-label", x: -10, y: cy + 4, "text-anchor": "end" }, p.label, row);
      if (p.high > p.low) el("line", { x1: x1, x2: x2, y1: cy, y2: cy, stroke: cssVar("--line-2"), "stroke-width": 6, "stroke-linecap": "round" }, row);
      el("circle", { class: "mark", cx: x1, cy: cy, r: 6, fill: c1, stroke: cssVar("--surface"), "stroke-width": 2 }, row);
      if (p.high > p.low) el("circle", { class: "mark", cx: x2, cy: cy, r: 6, fill: c2, stroke: cssVar("--surface"), "stroke-width": 2 }, row);
      var hit = el("rect", { class: "hit", role: "img", x: -labelW, y: i * rowH, width: W, height: rowH,
        "aria-label": p.label + " : de " + fmt(p.low, 0) + " à " + fmt(p.high, 0) + " participants" }, row);
      bindTip(hit, function () {
        return [{ strong: p.label }, { text: "Estimation basse : " + fmt(p.low, 0), color: c1 }, { text: "Estimation haute : " + fmt(p.high, 0), color: c2 }];
      });
    });
    host.innerHTML = ""; host.appendChild(svg);
  }

  var RENDER = { columns: columns, hbars: hbars, dumbbell: dumbbell, range: range };
  function renderAll() {
    document.querySelectorAll("[data-chart]").forEach(function (host) {
      var type = host.dataset.chart, fn = RENDER[type];
      if (!fn) return;
      try { fn(host, { key: host.dataset.key, region: host.dataset.region, highlight: host.dataset.highlight }); }
      catch (e) { host.innerHTML = '<p class="noscript-note">Graphique indisponible — voir le tableau de données.</p>'; if (window.console) console.error(e); }
    });
  }
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(renderAll, 150); });
  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) if (muts[i].attributeName === "data-theme") { renderAll(); break; }
  }).observe(document.documentElement, { attributes: true });
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", renderAll);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderAll); else renderAll();
})();
