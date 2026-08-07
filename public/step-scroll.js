/* Greenstreet "How it works" scroll interaction.
 * The Webflow stage (.step_wrap) is pinned via CSS position:sticky over a tall
 * .step_height track; the 5 cards (.step-cards-list) are a horizontal flex row.
 * The original Webflow GSAP that scrubbed them + transitioned the band color does
 * NOT run inside the React-wrapped page (ScrollTrigger never initializes), so the
 * section was stuck on card 1 with no color change. This re-implements it with a
 * plain rAF-throttled scroll handler — no GSAP, no pin, robust to the SPA.
 *
 * Per scroll progress through .step_height it:
 *  - slides .step-cards-list left to reveal the active card,
 *  - transitions .step_layout (.u-theme-brand) bg + text to the step's
 *    data-background / data-color (the per-step "scroll color change"),
 *  - fills the active tab's .step_tab_line_highlighted progress line.
 */
(function () {
  function init() {
    var height = document.querySelector(".step_height");
    var stage  = document.querySelector(".step_wrap");
    var layout = document.querySelector(".step_layout");
    var list   = document.querySelector(".step-cards-list");
    if (!height || !stage || !layout || !list) return;
    if (layout.__stepScroll) return;
    var wraps = Array.prototype.slice.call(document.querySelectorAll(".step_tab_content_list_wrap")).slice(0, 5);
    var tabs  = Array.prototype.slice.call(document.querySelectorAll(".step_tab_link")).slice(0, 5);
    if (wraps.length < 2) return;
    layout.__stepScroll = true;

    var colors = wraps.map(function (w) {
      return { bg: "#" + (w.getAttribute("data-background") || "003738"), fg: "#" + (w.getAttribute("data-color") || "E8E9BF") };
    });
    var n = colors.length;
    layout.style.transition = "background-color .45s ease, color .45s ease";
    var lastActive = -1;

    function maxOffset() {
      var c = list.children;
      return c.length > 1 ? (c[c.length - 1].offsetLeft - c[0].offsetLeft) : 0;
    }

    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    function update() {
      var stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
      var stageH = stage.offsetHeight;
      var rect = height.getBoundingClientRect();
      var dist = rect.height - stageH;
      if (dist <= 0) return;
      var progress = clamp((stickyTop - rect.top) / dist);

      list.style.transform = "translate3d(" + (-progress * maxOffset()) + "px,0,0)";

      var p = progress * (n - 1);
      var active = Math.round(p);
      var i = Math.floor(p), sub = p - i;

      if (active !== lastActive) {
        layout.style.backgroundColor = colors[active].bg;
        layout.style.color = colors[active].fg;
        lastActive = active;
      }
      for (var k = 0; k < tabs.length; k++) {
        tabs[k].classList.toggle("is-active", k === active);
        var hl = tabs[k].querySelector(".step_tab_line_highlighted");
        if (hl) hl.style.width = (k < i ? 100 : k === i ? Math.round(sub * 100) : 0) + "%";
      }
    }

    var ticking = false;
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { update(); ticking = false; }); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();
    setTimeout(update, 400);
  }

  // Elements may mount late (React overlays the marketing HTML); retry a few times.
  function boot() { try { init(); } catch (e) {} }
  if (document.readyState !== "loading") boot(); else document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
})();
