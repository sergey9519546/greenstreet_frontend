/* Greenstreet 50-state PPP rule map — marketing home section (after Solutions).
 * Renders the same geographic US map + prepayment-penalty tiers used by the
 * /state-laws tool, as a self-contained, animated teaser. Geometry is fetched
 * from /us-map-paths.json (generated from src/data/usMapPaths.ts); tier data
 * mirrors StateLawsPage. Idempotent; reveals on scroll-into-view. */
(function () {
  // Tier system — identical to StateLawsPage (0 allowed → 3 effectively banned).
  var TIER_COLORS = { 0: "#4dbd97", 1: "#d8d958", 2: "#f97316", 3: "#ff6b6b" };
  var TIER_LABELS = { 0: "PPP allowed", 1: "Threshold-based", 2: "High-risk", 3: "Effectively banned" };

  // States with a non-standard tier (everything else defaults to 0 / allowed).
  var SPECIAL_TIERS = {
    AK: 2, AR: 1, CA: 1, FL: 0, GA: 0, IL: 1, KS: 3, ME: 1, MD: 3, MN: 1,
    MS: 1, NJ: 2, NM: 1, NY: 1, ND: 3, OH: 1, OK: 1, PA: 1, RI: 1, SC: 1,
    TX: 0, WA: 1, WV: 1, WI: 1,
  };

  var CODE_TO_NAME = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
    HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
    MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
    MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
    NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
    ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
    RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
    TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
    WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
  };

  var SVGNS = "http://www.w3.org/2000/svg";
  var dataPromise = null;

  function getData() {
    if (!dataPromise) {
      dataPromise = fetch("/us-map-paths.json", { credentials: "same-origin" })
        .then(function (r) { if (!r.ok) throw new Error("map data"); return r.json(); });
    }
    return dataPromise;
  }

  function tierOf(code) {
    return Object.prototype.hasOwnProperty.call(SPECIAL_TIERS, code) ? SPECIAL_TIERS[code] : 0;
  }

  function buildLegend(legendEl, counts) {
    if (!legendEl) return;
    legendEl.innerHTML = "";
    [0, 1, 2, 3].forEach(function (t) {
      var row = document.createElement("div");
      row.className = "gs-sm-legend-row";
      row.innerHTML =
        '<span class="gs-sm-dot" style="background:' + TIER_COLORS[t] + '"></span>' +
        '<span class="gs-sm-legend-label">' + TIER_LABELS[t] + "</span>" +
        '<span class="gs-sm-legend-count">' + counts[t] + "</span>";
      legendEl.appendChild(row);
    });
  }

  function render(root) {
    if (!root || root.__gsInit) return;
    root.__gsInit = true;
    var legendEl = document.getElementById("gs-state-map-legend");

    getData().then(function (data) {
      var codes = Object.keys(data.paths);
      var counts = { 0: 0, 1: 0, 2: 0, 3: 0 };

      var svg = document.createElementNS(SVGNS, "svg");
      svg.setAttribute("viewBox", data.viewBox);
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.setAttribute("class", "gs-sm-svg");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "Map of all 50 states colored by DSCR prepayment-penalty rule tier");

      codes.forEach(function (code) {
        var t = tierOf(code);
        if (code !== "DC") counts[t]++;
        var p = document.createElementNS(SVGNS, "path");
        p.setAttribute("d", data.paths[code]);
        p.setAttribute("fill", TIER_COLORS[t]);
        p.setAttribute("class", "gs-sm-state");
        p.setAttribute("data-code", code);
        p.setAttribute("data-name", CODE_TO_NAME[code] || code);
        p.setAttribute("data-tier", String(t));
        svg.appendChild(p);
      });

      // tooltip
      var tip = document.createElement("div");
      tip.className = "gs-sm-tip";
      tip.setAttribute("aria-hidden", "true");

      root.innerHTML = "";
      root.appendChild(svg);
      root.appendChild(tip);
      buildLegend(legendEl, counts);

      // hover tooltip
      svg.addEventListener("mousemove", function (e) {
        var el = e.target;
        if (el && el.classList && el.classList.contains("gs-sm-state")) {
          var t = el.getAttribute("data-tier");
          tip.innerHTML =
            '<span class="gs-sm-tip-dot" style="background:' + TIER_COLORS[t] + '"></span>' +
            '<strong>' + el.getAttribute("data-name") + "</strong> · " + TIER_LABELS[t];
          tip.classList.add("is-on");
          var r = root.getBoundingClientRect();
          var x = e.clientX - r.left, y = e.clientY - r.top;
          tip.style.left = Math.min(Math.max(x + 14, 6), r.width - 6) + "px";
          tip.style.top = Math.max(y - 14, 6) + "px";
          svg.querySelectorAll(".is-hot").forEach(function (n) { n.classList.remove("is-hot"); });
          el.classList.add("is-hot");
        } else {
          tip.classList.remove("is-on");
        }
      });
      svg.addEventListener("mouseleave", function () {
        tip.classList.remove("is-on");
        svg.querySelectorAll(".is-hot").forEach(function (n) { n.classList.remove("is-hot"); });
      });

      // staggered reveal on scroll-into-view (setTimeout fires even when rAF is throttled)
      var states = Array.prototype.slice.call(svg.querySelectorAll(".gs-sm-state"));
      function reveal() {
        states.forEach(function (s, i) { setTimeout(function () { s.classList.add("is-in"); }, i * 11); });
      }
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { reveal(); io.disconnect(); }
          });
        }, { threshold: 0.25 });
        io.observe(root);
      } else {
        reveal();
      }
      // safety: reveal after 1.6s regardless (covers paused observers)
      setTimeout(function () { states.forEach(function (s) { s.classList.add("is-in"); }); }, 1600);
    }).catch(function () {
      root.innerHTML = '<div class="gs-statemap-loading">Map unavailable. <a href="/state-laws">View all 50-state rules →</a></div>';
    });
  }

  function init() {
    var root = document.getElementById("gs-state-map-root");
    if (root) render(root);
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
  setTimeout(init, 800);
  setTimeout(init, 2000);
})();
