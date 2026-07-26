/**
 * QualifyWidget — global sticky trigger + auto-open logic for QualifyModal.
 *
 * Mount once at the App root so it overlays every view.
 *
 * Auto-open heuristic (fires at most once per visitor):
 *   • After 30 seconds idle on the page, OR
 *   • When the user scrolls past 55% of document height,
 *   whichever comes first.
 *
 * Respects localStorage key "gs_qualify_seen" — once set, never auto-opens again.
 *
 * Exposes window.openQualify and window.closeQualify for external CTAs.
 *
 * ADDED: hover state (midnight bg / pistachio text) on the sticky pill trigger.
 * Animation CSS injected via local <style> tag — no shared files modified.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import QualifyModal from "./QualifyModal";
import { swatch, font } from "../theme";

declare global {
  interface Window {
    openQualify?: () => void;
    closeQualify?: () => void;
  }
}

const STORAGE_KEY = "gs_qualify_seen";
const AUTO_OPEN_DELAY_MS = 30_000;
const SCROLL_THRESHOLD = 0.55;

// Widget-specific CSS — injected once, no shared files touched.
const WIDGET_CSS = `
  .qw-pill {
    transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease !important;
  }
  .qw-pill:hover {
    background: ${swatch.midnight} !important;
    color: ${swatch.pistachio} !important;
    box-shadow: 0 4px 16px rgba(0,55,56,0.28) !important;
  }
  .qw-pill:active {
    transform: translateY(1px);
  }
  @media (prefers-reduced-motion: reduce) {
    .qw-pill {
      transition: none !important;
    }
  }
`;

let _widgetStylesInjected = false;
function ensureWidgetStyles() {
  if (_widgetStylesInjected || typeof document === "undefined") return;
  _widgetStylesInjected = true;
  const el = document.createElement("style");
  el.setAttribute("data-qw", "1");
  el.textContent = WIDGET_CSS;
  document.head.appendChild(el);
}

export default function QualifyWidget({ showTrigger = true }: { showTrigger?: boolean }) {
  const [open, setOpen] = useState(false);
  const autoTriggeredRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inject widget CSS once on mount
  useEffect(() => {
    ensureWidgetStyles();
  }, []);

  const openModal = useCallback(() => {
    setOpen(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (_) {}
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  // Expose global helpers so any CTA on the page (including the Webflow
  // marketing layer) can open/close the modal with a single JS call.
  useEffect(() => {
    window.openQualify = openModal;
    window.closeQualify = closeModal;
    return () => {
      delete window.openQualify;
      delete window.closeQualify;
    };
  }, [openModal, closeModal]);

  // Auto-open logic — runs once per mount; guards against repeated triggers.
  useEffect(() => {
    const alreadySeen = () => {
      try {
        return localStorage.getItem(STORAGE_KEY) === "1";
      } catch (_) {
        return false;
      }
    };

    if (alreadySeen()) return;

    const trigger = () => {
      if (autoTriggeredRef.current) return;
      if (alreadySeen()) return;
      autoTriggeredRef.current = true;
      cleanup();
      openModal();
    };

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total > 0 && scrolled / total >= SCROLL_THRESHOLD) trigger();
    };

    timerRef.current = setTimeout(trigger, AUTO_OPEN_DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });

    function cleanup() {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      window.removeEventListener("scroll", onScroll);
    }

    return cleanup;
  }, [openModal]);

  return (
    <>
      {/* Sticky pill trigger — hidden while modal is open */}
      {!open && showTrigger && (
        <button
          onClick={openModal}
          aria-label="See if you qualify"
          className="qw-pill"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "12px 22px",
            borderRadius: 9999,
            background: swatch.lemon,
            color: swatch.midnight,
            border: "none",
            fontFamily: font.family,
            fontWeight: font.bold,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 2px 12px rgba(0,55,56,0.18)",
            // No perpetual animation — only a simple hover is applied via class.
            // We don't add floating/pulsing motion per brand rules.
          }}
        >
          ✓ See if you qualify
        </button>
      )}

      <QualifyModal open={open} onClose={closeModal} />
    </>
  );
}
