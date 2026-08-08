/* Greenstreet neutral US map — marketing home reliability-hold visual.
 * Geometry is preserved so the accepted homepage composition does not fall
 * apart, but the map deliberately publishes no jurisdiction classification or
 * legal conclusion while the state-rule source set is under review. */
(function () {
  var HOLD_COLOR = "#4b7f7b";
  var HOLD_LABEL = "State rules under review";

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

  function buildLegend(legendEl) {
    if (!legendEl) return;
    legendEl.innerHTML =
      '<div class="gs-sm-legend-row">' +
      '<span class="gs-sm-dot" style="background:' + HOLD_COLOR + '"></span>' +
      '<span class="gs-sm-legend-label">' + HOLD_LABEL + "</span>" +
      '<span class="gs-sm-legend-count">50</span></div>';
  }

  function render(root) {
    if (!root || root.__gsInit) return;
    root.__gsInit = true;
    var legendEl = document.getElementById("gs-state-map-legend");

    getData().then(function (data) {
      var codes = Object.keys(data.paths);

      var svg = document.createElementNS(SVGNS, "svg");
      svg.setAttribute("viewBox", data.viewBox);
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.setAttribute("class", "gs-sm-svg");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "Neutral map of the United States; state legal classifications are under review");

      codes.forEach(function (code) {
        var p = document.createElementNS(SVGNS, "path");
        p.setAttribute("d", data.paths[code]);
        p.setAttribute("fill", HOLD_COLOR);
        p.setAttribute("class", "gs-sm-state");
        p.setAttribute("data-code", code);
        p.setAttribute("data-name", CODE_TO_NAME[code] || code);
        svg.appendChild(p);
      });

      // tooltip
      var tip = document.createElement("div");
      tip.className = "gs-sm-tip";
      tip.setAttribute("aria-hidden", "true");

      root.innerHTML = "";
      root.appendChild(svg);
      root.appendChild(tip);
      buildLegend(legendEl);

      // hover tooltip
      svg.addEventListener("mousemove", function (e) {
        var el = e.target;
        if (el && el.classList && el.classList.contains("gs-sm-state")) {
          tip.innerHTML =
            '<span class="gs-sm-tip-dot" style="background:' + HOLD_COLOR + '"></span>' +
            '<strong>' + el.getAttribute("data-name") + "</strong> · " + HOLD_LABEL;
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
      root.innerHTML = '<div class="gs-statemap-loading">Neutral map unavailable. State classifications remain under review.</div>';
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
