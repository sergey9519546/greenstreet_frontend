/* Greenstreet rebuild video — autoplay (muted) on scroll-into-view or hover,
 * with an unmute toggle. Lives on the marketing home (index.html), right before
 * the Solutions section. Idempotent; safe to re-run as the SPA toggles the
 * #webflow-root marketing markup in and out of view. */
(function () {
  function init() {
    var frame = document.getElementById("gs-rebuild-video-frame");
    var video = document.getElementById("gs-rebuild-video");
    var btn = document.getElementById("gs-rebuild-mute");
    if (!frame || !video || !btn) return false;
    if (frame.__gsInit) return true;
    frame.__gsInit = true;

    var label = btn.querySelector(".gs-mute-label");

    function setMuted(m) {
      video.muted = m;
      btn.setAttribute("data-muted", m ? "true" : "false");
      btn.setAttribute("aria-label", m ? "Unmute video" : "Mute video");
      if (label) label.textContent = m ? "Tap to unmute" : "Mute";
    }
    setMuted(true); // muted is required for autoplay to be allowed

    function tryPlay() {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }

    // Unmute/mute toggle — never let it bubble to the frame's play/pause click.
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setMuted(!video.muted);
      if (video.paused) tryPlay();
    });

    // Click the frame to toggle play/pause.
    frame.addEventListener("click", function () {
      if (video.paused) tryPlay(); else video.pause();
    });

    // Hover starts it.
    frame.addEventListener("mouseenter", tryPlay);

    // Scroll-into-view autoplay; pause when it leaves.
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && en.intersectionRatio >= 0.5) tryPlay();
          else if (en.intersectionRatio < 0.15) video.pause();
        });
      }, { threshold: [0, 0.15, 0.5, 0.75] });
      io.observe(frame);
    } else {
      var onScroll = function () {
        var r = frame.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.8 && r.bottom > window.innerHeight * 0.2) tryPlay();
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    return true;
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
  setTimeout(init, 800);
  setTimeout(init, 2000);
})();
