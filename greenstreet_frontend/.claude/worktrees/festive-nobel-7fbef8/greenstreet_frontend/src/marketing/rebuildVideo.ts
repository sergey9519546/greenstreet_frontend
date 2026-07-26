function mountRebuildVideo() {
  const video = document.getElementById("gs-rebuild-video");
  const frame = document.getElementById("gs-rebuild-video-frame");
  const mute = document.getElementById("gs-rebuild-mute");
  if (!(video instanceof HTMLVideoElement) || !frame || !(mute instanceof HTMLButtonElement)) return;
  if (video.dataset.gsVideoMounted === "true") return;

  const label = mute.querySelector(".gs-mute-label");
  const sync = () => {
    mute.dataset.muted = String(video.muted);
    mute.setAttribute("aria-label", video.muted ? "Unmute video" : "Mute video");
    if (label) label.textContent = video.muted ? "Tap to unmute" : "Mute";
  };

  const toggle = () => {
    video.muted = !video.muted;
    if (!video.paused) void video.play().catch(() => {});
    sync();
  };

  frame.addEventListener("click", (event) => {
    if ((event.target as Element | null)?.closest("button")) return;
    void video.play().catch(() => {});
  });
  mute.addEventListener("click", toggle);
  video.addEventListener("volumechange", sync);

  video.muted = true;
  void video.play().catch(() => {});
  sync();
  video.dataset.gsVideoMounted = "true";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountRebuildVideo, { once: true });
} else {
  mountRebuildVideo();
}

window.addEventListener("pageshow", mountRebuildVideo);
