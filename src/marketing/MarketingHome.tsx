import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import homepageMarkup from "./home-markup.html?raw";

type MarketingRuntime = Window & {
  Webflow?: {
    ready?: () => void;
    require?: (module: string) => { init?: () => void } | undefined;
  };
  initAnimations?: () => void;
  __gsStartMarketing?: () => void;
  __gsStopMarketing?: () => void;
};

function runEmbeddedScripts(root: HTMLElement) {
  root
    .querySelectorAll<HTMLScriptElement>("script:not([data-react-executed])")
    .forEach((script) => {
      const executable = document.createElement("script");

      for (const { name, value } of Array.from(script.attributes)) {
        executable.setAttribute(name, value);
      }
      executable.dataset.reactExecuted = "true";
      executable.async = false;
      executable.textContent = script.textContent;
      script.replaceWith(executable);
    });
}

function startMarketingRuntime(runtime: MarketingRuntime) {
  // The legacy runtime is parsed before React mounts. Reset its no-DOM startup,
  // then initialize it against the React-owned homepage.
  runtime.__gsStopMarketing?.();
  runtime.Webflow?.ready?.();
  runtime.Webflow?.require?.("ix2")?.init?.();
  runtime.initAnimations?.();
  runtime.__gsStartMarketing?.();
}

export default function MarketingHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const portalHost =
    typeof document === "undefined"
      ? null
      : document.getElementById("marketing-root");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const runtime = window as MarketingRuntime;
    runEmbeddedScripts(root);

    const frameId = window.requestAnimationFrame(() => {
      try {
        startMarketingRuntime(runtime);
      } catch (error) {
        console.error("Failed to initialize homepage interactions:", error);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      try {
        runtime.__gsStopMarketing?.();
      } catch (error) {
        console.error("Failed to tear down homepage interactions:", error);
      }
    };
  }, []);

  if (!portalHost) return null;

  return createPortal(
    <div
      id="webflow-root"
      ref={rootRef}
      dangerouslySetInnerHTML={{ __html: homepageMarkup }}
    />,
    portalHost,
  );
}
