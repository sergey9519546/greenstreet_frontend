import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";

const BASE_URL = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";
const OUT_ROOT = process.env.QA_OUT_DIR ?? path.resolve(".tmp", "interaction-qa");
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const OUT_DIR = path.join(OUT_ROOT, STAMP);

const ROUTES = [
  "/",
  "/products",
  "/products/platform",
  "/solutions",
  "/investors",
  "/borrower-profiles",
  "/non-us-investors",
  "/str-airbnb",
  "/vacation-homes",
  "/case-studies",
  "/about",
  "/careers",
  "/support",
  "/legal",
  "/faq",
  "/blog",
  "/rate-quiz",
  "/book-demo",
  "/dscr-calculator",
  "/lender-intel",
  "/state-laws?state=TX",
  "/deal-analyzer",
  "/tools/refi-tracker",
  "/tools/arm-reset",
  "/tools/monte-carlo",
  "/tools/returns",
  "/tools/tax-engine",
  "/tools/stress-matrix",
  "/tools/decision-support",
  "/tools/str-underwriting",
  "/tools/portfolio",
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

const BLOCKED_BUTTON_TEXT = /submit|send|apply|download|delete|remove|log out|sign out/i;
const IGNORE_CONSOLE = [
  /Failed to load resource/i,
  /net::ERR_ABORTED/i,
  /favicon/i,
  /cdn-cookieyes/i,
];

function findChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate));
}

function routeSlug(route) {
  return route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function goto(page, route) {
  await page.goto(new URL(route, BASE_URL).toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
  await delay(450);
}

async function collectState(page) {
  return page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) !== 0;
    };
    const labelFor = (el) => {
      const id = el.getAttribute("id");
      const aria = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title");
      if (aria) return true;
      if (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) return true;
      if (el.closest("label")) return true;
      return false;
    };
    const text = (el) => (el.innerText || el.textContent || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "").trim().replace(/\s+/g, " ");
    const controls = Array.from(document.querySelectorAll("a,button,input,select,textarea,[role='button'],[tabindex]")).filter(visible);
    controls.forEach((el, i) => el.setAttribute("data-qa-probe", String(i)));
    const anchors = Array.from(document.querySelectorAll("a")).filter(visible);
    const fields = Array.from(document.querySelectorAll("input,select,textarea")).filter((el) => visible(el) && el.type !== "hidden");
    const h1s = Array.from(document.querySelectorAll("h1")).filter(visible).map(text);
    const tinyText = Array.from(document.querySelectorAll("body *"))
      .filter(visible)
      .map((el) => ({ text: text(el).slice(0, 80), size: parseFloat(getComputedStyle(el).fontSize), tag: el.tagName.toLowerCase() }))
      .filter((row) => row.text && row.size > 0 && row.size < 10);
    const styleSamples = controls.slice(0, 80).map((el) => {
      const s = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        text: text(el).slice(0, 80),
        color: s.color,
        background: s.backgroundColor,
        borderColor: s.borderColor,
        borderRadius: s.borderRadius,
        fontSize: s.fontSize,
      };
    });
    return {
      title: document.title,
      h1s,
      viewport: { width: innerWidth, height: innerHeight },
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2,
      controls: controls.map((el, i) => ({ probe: i, tag: el.tagName.toLowerCase(), type: el.getAttribute("type") || "", text: text(el).slice(0, 100), href: el.getAttribute("href") || "" })),
      invalidAnchors: anchors
        .filter((el) => !el.getAttribute("href") || el.getAttribute("href") === "#")
        .map((el) => ({ text: text(el).slice(0, 100), html: el.outerHTML.slice(0, 180) })),
      missingLabels: fields
        .filter((el) => !labelFor(el))
        .map((el) => ({ tag: el.tagName.toLowerCase(), type: el.getAttribute("type") || "", placeholder: el.getAttribute("placeholder") || "", id: el.getAttribute("id") || "" })),
      tinyText,
      styleSamples,
    };
  });
}

async function probeInteractions(page, route, viewportName) {
  const events = await page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) !== 0;
    };
    const text = (el) => (el.innerText || el.textContent || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "").trim().replace(/\s+/g, " ");
    const controls = Array.from(document.querySelectorAll("[data-qa-probe]"))
      .filter(visible)
      .map((el) => ({
        element: el,
        probe: el.getAttribute("data-qa-probe"),
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute("type") || "",
        href: el.getAttribute("href") || "",
        text: text(el).slice(0, 100),
      }));
    const events = [];
    for (const control of controls) {
      const el = control.element;
      if (/submit|send|apply|download|delete|remove|log out|sign out/i.test(control.text) && !control.href) {
        events.push({ action: "skip-side-effect", control: { ...control, element: undefined } });
        continue;
      }
      try {
        el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        if (typeof el.focus === "function") el.focus({ preventScroll: true });
        el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        events.push({ action: "hover-focus-active", ok: true, control: { ...control, element: undefined } });
      } catch (error) {
        events.push({ action: "hover-focus-active", ok: false, error: String(error).slice(0, 160), control: { ...control, element: undefined } });
      }
    }
    for (const trigger of Array.from(document.querySelectorAll("[aria-haspopup='true'], .nav_dropdown_component .w-dropdown-toggle")).filter(visible)) {
      trigger.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      trigger.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
      trigger.setAttribute("aria-expanded", "true");
      trigger.classList.add("w--open");
      trigger.closest(".nav_dropdown_component")?.querySelector(".w-dropdown-list")?.classList.add("w--open");
      events.push({ action: "open-dropdown", ok: true, text: text(trigger).slice(0, 80) });
    }
    const mobile = document.querySelector("button.burger-wrap,[aria-controls='mobile-nav']");
    if (mobile && visible(mobile)) {
      mobile.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      events.push({ action: "mobile-menu-open", ok: true });
    }
    const sampleValue = (el) => {
      if (el.tagName === "SELECT") return "select";
      if (el.type === "email") return "qa@example.com";
      if (el.type === "text") return el.placeholder?.includes("state") ? "TX" : "QA Property";
      if (el.type === "number") return "425000";
      if (el.type === "range") return String((Number(el.min || 0) + Number(el.max || 100)) / 2);
      return null;
    };
    const fields = Array.from(document.querySelectorAll("input,select,textarea")).filter((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden" && el.type !== "hidden";
    });
    for (const field of fields) {
      const value = sampleValue(field);
      if (value == null) continue;
      if (field.tagName === "SELECT") {
        const options = Array.from(field.options).filter((option) => !option.disabled);
        if (options[0]) field.value = options[0].value;
      } else {
        field.value = value;
      }
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }
    events.push({ action: "exercise-inputs", ok: true, count: fields.length });
    return events;
  });
  await page.screenshot({ path: path.join(OUT_DIR, `${viewportName}-${routeSlug(route)}-interactions.png`), fullPage: false });
  return events;
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  const executablePath = findChrome();
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const summary = {
    baseUrl: BASE_URL,
    outDir: OUT_DIR,
    routes: ROUTES,
    viewports: VIEWPORTS,
    failures: [],
    results: [],
  };

  try {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage();
      await page.setViewport(viewport);
      const consoleIssues = [];
      page.on("console", (msg) => {
        if (!["error", "warning"].includes(msg.type())) return;
        const text = msg.text();
        if (IGNORE_CONSOLE.some((rx) => rx.test(text))) return;
        consoleIssues.push({ type: msg.type(), text });
      });

      for (const route of ROUTES) {
        const result = { route, viewport: viewport.name, errors: [], warnings: [], interactions: [] };
        try {
          await goto(page, route);
          await page.screenshot({ path: path.join(OUT_DIR, `${viewport.name}-${routeSlug(route)}-default.png`), fullPage: false });
          const state = await collectState(page);
          result.state = state;
          if (!state.title) result.errors.push("missing-title");
          if (state.h1s.length !== 1) result.errors.push(`h1-count-${state.h1s.length}`);
          if (state.horizontalOverflow) result.errors.push("horizontal-overflow");
          if (state.invalidAnchors.length > 0) result.errors.push(`invalid-anchors-${state.invalidAnchors.length}`);
          if (state.missingLabels.length > 0) result.errors.push(`missing-labels-${state.missingLabels.length}`);
          if (state.tinyText.length > 30) result.warnings.push(`many-tiny-text-${state.tinyText.length}`);
          result.interactions = await probeInteractions(page, route, viewport.name);
          const after = await collectState(page);
          result.afterInteraction = {
            url: page.url(),
            h1s: after.h1s,
            horizontalOverflow: after.horizontalOverflow,
            invalidAnchors: after.invalidAnchors,
            missingLabels: after.missingLabels,
          };
          if (after.horizontalOverflow) result.errors.push("post-interaction-horizontal-overflow");
        } catch (error) {
          result.errors.push(String(error).slice(0, 240));
        }
        if (consoleIssues.length > 0) {
          result.errors.push(`console-issues-${consoleIssues.length}`);
          result.consoleIssues = consoleIssues.splice(0);
        }
        if (result.errors.length) summary.failures.push({ route, viewport: viewport.name, errors: result.errors });
        summary.results.push(result);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }

  await writeFile(path.join(OUT_DIR, "interaction-qa.json"), JSON.stringify(summary, null, 2));
  await writeFile(path.join(OUT_ROOT, "latest.json"), JSON.stringify(summary, null, 2));
  console.log(`Interaction QA output: ${OUT_DIR}`);
  if (summary.failures.length) {
    console.error(JSON.stringify(summary.failures.slice(0, 20), null, 2));
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
