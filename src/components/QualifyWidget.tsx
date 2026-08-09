/**
 * QualifyWidget — global sticky trigger for QualifyModal.
 *
 * Mount once at the App root so it overlays every view.
 *
 * Exposes window.openQualify and window.closeQualify for external CTAs.
 *
 * ADDED: hover state (midnight bg / pistachio text) on the sticky pill trigger.
 * Animation CSS injected via local <style> tag — no shared files modified.
 */
import React, { useState, useEffect, useCallback } from "react";
import QualifyModal from "./QualifyModal";
import { swatch, font } from "../theme";
import {
  sanitizeQualificationScenarioDraft,
  type QualificationScenarioDraft,
} from "../conversion/qualificationScenario";

declare global {
  interface Window {
    openQualify?: (draft?: QualificationScenarioDraft) => void;
    closeQualify?: () => void;
  }
}

// Widget-specific CSS — injected once, no shared files touched.
const WIDGET_CSS = `
  .qw-pill {
    transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease !important;
  }
  .qw-pill:hover {
    background: ${swatch.midnight} !important;
    color: ${swatch.pistachio} !important;
  }
  .qw-pill:active {
    transform: translateY(1px);
  }
  @media (max-width: 479px) {
    .qw-pill {
      position: static !important;
      width: calc(100% - 32px);
      min-height: 48px;
      justify-content: center;
      margin: 16px;
    }
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

export default function QualifyWidget({
  showTrigger = true,
}: {
  showTrigger?: boolean;
} = {}) {
  const [open, setOpen] = useState(false);
  const [initialDraft, setInitialDraft] = useState<QualificationScenarioDraft | null>(null);

  // Inject widget CSS once on mount
  useEffect(() => {
    ensureWidgetStyles();
  }, []);

  const openModal = useCallback((draft?: QualificationScenarioDraft) => {
    // The global helper can be invoked by untyped page scripts. Whitelist at
    // runtime so identity/contact fields can never enter this handoff state.
    setInitialDraft(sanitizeQualificationScenarioDraft(draft));
    setOpen(true);
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

  return (
    <>
      {/* Sticky pill trigger — hidden while modal is open */}
      {showTrigger && !open && (
        <button
          onClick={() => openModal()}
          aria-label="Request a scenario review"
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
            // No perpetual animation — only a simple hover is applied via class.
            // We don't add floating/pulsing motion per brand rules.
          }}
        >
          Request a scenario review →
        </button>
      )}

      <QualifyModal open={open} onClose={closeModal} initialDraft={initialDraft} />
    </>
  );
}
