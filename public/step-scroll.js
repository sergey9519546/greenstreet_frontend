/* Greenstreet "How it works" scroll interaction.
 * The Webflow stage (.step_wrap) is pinned via CSS position: sticky over a tall
 * .step_height track; the 5 cards (.step-cards-list) are a horizontal flex row.
 *
 * This script restores the original Greenboard behavior inside the SPA:
 *  - slides the card row as the section scrolls,
 *  - applies the per-step background/text colors from data attributes,
 *  - fills the tab progress lines,
 *  - mounts seekable HyperFrames compositions into each visual window.
 */
(function () {
  var SCENE_CSS_ID = "gs-hf-step-scenes-css";
  var HF_SRC = "/hyperframes/how-it-works/step-scene.html?step=";
  var HF_TIMELINE_ID = "step-scene";
  var hyperFrameTemplatePromise = null;

  function installStepSceneStyles() {
    if (document.getElementById(SCENE_CSS_ID)) return;
    var style = document.createElement("style");
    style.id = SCENE_CSS_ID;
    style.textContent = `
.step_layout .step_tab_content_visual-wrap.gs-hf-scene-window {
  background: #004041 !important;
  color: #004041 !important;
  border: 0;
  box-shadow: none;
}
.step_layout .step_tab_content_visual-wrap.gs-hf-scene-window .step_tab_content_step {
  background: #eeefd3 !important;
  color: #003738 !important;
}
.gs-hf-scene-host {
  position: relative !important;
  overflow: hidden !important;
  background: transparent !important;
  isolation: isolate;
}
.gs-hf-frame {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;
  opacity: 0;
  transition: opacity 240ms ease;
  pointer-events: none;
}
.gs-hf-scene-host.is-hf-ready .gs-hf-frame {
  opacity: 1;
}
.gs-hf-scene-host.is-hf-ready .g_visual_wrap,
.gs-hf-scene-host.is-hf-ready .g_visual_img,
.gs-hf-scene-host.is-hf-ready .g_visual_video,
.gs-hf-scene-host.is-hf-ready .g_visual_background,
.gs-hf-scene-host.is-hf-ready .g_visual_overlay,
.gs-hf-scene-host.is-hf-ready .g_visual_overlay-top,
.gs-hf-scene-host.is-hf-ready .g_visual_overlay-bottom {
  opacity: 0 !important;
  pointer-events: none !important;
}`;
    document.head.appendChild(style);
  }

  function mountHyperFrame(wraps) {
    installStepSceneStyles();
    window.__greenstreetStepFrames = window.__greenstreetStepFrames || [];

    wraps.forEach(function (wrap, index) {
      var visualWrap = wrap.querySelector(".step_tab_content_visual-wrap");
      var visualImage = wrap.querySelector(".step_tab_content_visual_image");
      if (!visualWrap || !visualImage) return;

      visualWrap.classList.add("gs-hf-scene-window");
      visualImage.classList.add("gs-hf-scene-host");

      var iframe = visualImage.querySelector(".gs-hf-frame");
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.className = "gs-hf-frame";
        iframe.title = "InvestGO step animation " + String(index + 1).padStart(2, "0");
        iframe.loading = "eager";
        iframe.setAttribute("aria-hidden", "true");
        iframe.setAttribute("allowtransparency", "true");
        iframe.addEventListener("load", function () {
          visualImage.classList.add("is-hf-ready");
        });
        visualImage.appendChild(iframe);
        loadHyperFrameInto(iframe, index + 1);
      }

      window.__greenstreetStepFrames[index] = {
        iframe: iframe,
        startedAt: 0
      };
    });
  }

  function getHyperFrameTemplate() {
    if (!hyperFrameTemplatePromise) {
      hyperFrameTemplatePromise = fetch(HF_SRC + "1", { credentials: "same-origin" }).then(function (response) {
        if (!response.ok) throw new Error("Unable to load HyperFrame source");
        return response.text();
      });
    }
    return hyperFrameTemplatePromise;
  }

  function sourceForStep(template, step) {
    return template.replace(
      /const step = Math\.min\(5, Math\.max\(1, Number\(new URLSearchParams\(window\.location\.search\)\.get\("step"\)\) \|\| 1\)\);/,
      "const step = " + step + ";"
    );
  }

  function loadHyperFrameInto(iframe, step) {
    getHyperFrameTemplate()
      .then(function (template) {
        iframe.srcdoc = sourceForStep(template, step);
      })
      .catch(function () {
        iframe.src = HF_SRC + step;
      });
  }

  function getHyperFrameTimeline(index) {
    var frame = window.__greenstreetStepFrames && window.__greenstreetStepFrames[index];
    if (!frame || !frame.iframe || !frame.iframe.contentWindow) return null;
    try {
      var win = frame.iframe.contentWindow;
      return win.__timelines && win.__timelines[HF_TIMELINE_ID];
    } catch (e) {
      return null;
    }
  }

  function getHyperFrameDuration(index, timeline) {
    var frame = window.__greenstreetStepFrames && window.__greenstreetStepFrames[index];
    var root = null;
    try {
      root = frame && frame.iframe.contentWindow.document.querySelector("[data-composition-id]");
    } catch (e) {
      root = null;
    }
    var attrDuration = root ? parseFloat(root.getAttribute("data-duration")) : 0;
    if (attrDuration > 0) return attrDuration;
    return timeline && typeof timeline.duration === "function" ? timeline.duration() || 6 : 6;
  }

  function init() {
    var height = document.querySelector(".step_height");
    var stage  = document.querySelector(".step_wrap");
    var layout = document.querySelector(".step_layout");
    var list   = document.querySelector(".step-cards-list");
    if (!height || !stage || !layout || !list) return;
    if (layout.__stepScroll) return;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      Array.prototype.forEach.call(document.querySelectorAll(".step_height video"), function (video) {
        video.autoplay = false;
        video.removeAttribute("autoplay");
        video.pause();
        try { video.currentTime = 0; } catch (e) {}
      });
    }

    var wraps = Array.prototype.slice.call(layout.querySelectorAll(".step_tab_content_list_wrap")).slice(0, 5);
    var tabs  = Array.prototype.slice.call(layout.querySelectorAll(".step_tab_link")).slice(0, 5);
    if (wraps.length < 2) return;
    layout.__stepScroll = true;

    var colors = wraps.map(function (w) {
      return {
        bg: "#" + (w.getAttribute("data-background") || "4DBD97"),
        fg: "#" + (w.getAttribute("data-color") || "004041")
      };
    });
    var n = colors.length;
    var lastActive = -1;
    var activeFrame = 0;
    var activeStartedAt = performance.now();

    if (!reduceMotion) mountHyperFrame(wraps);
    layout.style.transition = reduceMotion ? "none" : "background-color .45s ease, color .45s ease";

    function maxOffset() {
      var c = list.children;
      return c.length > 1 ? (c[c.length - 1].offsetLeft - c[0].offsetLeft) : 0;
    }

    function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    function activateFrame(index) {
      activeFrame = index;
      activeStartedAt = performance.now();
      for (var i = 0; i < n; i++) {
        var tl = getHyperFrameTimeline(i);
        if (tl && i !== index && typeof tl.pause === "function") {
          tl.pause(0);
        }
      }
    }

    function update() {
      var stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
      var stageH = stage.offsetHeight;
      var rect = height.getBoundingClientRect();
      var dist = rect.height - stageH;
      if (dist <= 0) return;
      var progress = clamp((stickyTop - rect.top) / dist);

      list.style.transform = "translate3d(" + (-progress * maxOffset()) + "px,0,0)";

      var p = progress * (n - 1);
      var active = Math.max(0, Math.min(n - 1, Math.round(p)));
      var i = Math.floor(p);
      var sub = p - i;

      if (active !== lastActive) {
        layout.style.backgroundColor = colors[active].bg;
        layout.style.color = colors[active].fg;
        activateFrame(active);
        lastActive = active;
      }

      for (var k = 0; k < tabs.length; k++) {
        tabs[k].classList.toggle("is-active", k === active);
        tabs[k].style.opacity = k === active ? "1" : "0.5";
        var hl = tabs[k].querySelector(".step_tab_line_highlighted");
        if (hl) hl.style.width = (k < i ? 100 : k === i ? Math.round(sub * 100) : 0) + "%";
      }
    }

    function tickHyperFrame(now) {
      var timeline = getHyperFrameTimeline(activeFrame);
      if (timeline && typeof timeline.time === "function") {
        var duration = getHyperFrameDuration(activeFrame, timeline);
        var elapsed = ((now - activeStartedAt) / 1000) % duration;
        timeline.time(elapsed, false).pause();
      }
      requestAnimationFrame(tickHyperFrame);
    }

    var ticking = false;
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          update();
          ticking = false;
        });
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();
    if (!reduceMotion) requestAnimationFrame(tickHyperFrame);
    setTimeout(update, 400);
  }

  function boot() { try { init(); } catch (e) {} }
  if (document.readyState !== "loading") boot(); else document.addEventListener("DOMContentLoaded", boot);
  setTimeout(boot, 800);
  setTimeout(boot, 2000);
})();
