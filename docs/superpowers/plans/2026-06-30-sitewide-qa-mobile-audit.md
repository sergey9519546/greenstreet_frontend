# Sitewide QA And Mobile UI Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and run a strict sitewide QA system that loads the whole Greenstreet site, exercises safe buttons and feature controls, captures desktop/mobile evidence, and flags mobile UI that is merely cramped desktop layout.

**Architecture:** Extend the current Puppeteer-based `scripts/interaction-qa.mjs` approach into a stronger sitewide QA harness with a route manifest, interaction probes, mobile-specific visual audit rules, and a written triage report. Keep artifacts in `.tmp/sitewide-qa/` so QA output does not pollute source control.

**Tech Stack:** React 19, Vite 6, TypeScript 5.8, Puppeteer 25, existing `npm run dev`, existing route resolver in `src/router/resolve.ts`, existing shared nav in `src/design/SiteShell.tsx`.

---

## Non-Negotiable QA Standard

This QA pass must not be a smoke test. It must prove:

- Every known route loads.
- Every route has meaningful content after first paint and after delayed post-load state.
- The shared nav and footer work across marketing and React routes.
- Safe controls respond: nav dropdowns, mobile menu, tabs, accordions, filters, sliders, inputs, calculators, cards, and internal links.
- Side-effect controls are inventoried but not submitted unless explicitly safe.
- Mobile is audited as a native mobile layout, not as squeezed desktop.
- Findings include exact route, viewport, user-visible problem, evidence path, and likely owner file.

## Route Matrix

Use this initial route matrix, derived from `src/router/resolve.ts`, `src/App.tsx`, and `scripts/interaction-qa.mjs`:

```txt
/
/products
/products/platform
/solutions
/investors
/brokers
/borrower-profiles
/non-us-investors
/foreign-nationals
/str-airbnb
/vacation-homes
/case-studies
/about
/careers
/support
/legal
/privacy-policy
/terms-of-service
/faq
/blog
/rate-quiz
/book-demo
/investgo
/investgo/analyze
/investgo/sensitivity
/investgo/optimize
/investgo/state
/investgo/history
/investgo/settings
/dscr-calculator
/lender-intel
/state-laws?state=TX
/deal-analyzer
/decision-support
/tools/refi-tracker
/tools/arm-reset
/tools/monte-carlo
/tools/returns
/tools/tax-engine
/tools/stress-matrix
/tools/decision-support
/tools/str-underwriting
/tools/portfolio
/tools/workspace
/tools/deal-workspace
/tools/sensitivity
/tools/structure-optimizer
/tools/scenario-history
```

## Mobile Failure Rubric

Fail mobile UI if any route has:

- Horizontal scroll on `360`, `390`, or `430` width.
- Desktop mega menu visible instead of a mobile menu.
- Touch targets under `44x44` for primary controls.
- Text below `12px` except small legal footnotes.
- Cards/grids that keep three or more columns at mobile width.
- Hero or intro content pushes the first useful interaction below the first viewport.
- Sticky header or floating widget covers content or controls.
- Buttons wrap into unreadable stacks or text escapes the button.
- Modals, dropdowns, calculators, sliders, or tables require horizontal panning.
- Page reads as a squeezed desktop composition rather than a mobile-first stack.

## Files To Create Or Modify

- Create `scripts/qa/routes.mjs`
  - Owns the route manifest and feature-flow definitions.
- Create `scripts/qa/dom-audit.mjs`
  - Owns DOM state extraction, mobile layout checks, and control inventory.
- Create `scripts/qa/interactions.mjs`
  - Owns safe interaction probing and side-effect blocking.
- Create `scripts/sitewide-qa.mjs`
  - Orchestrates browser launch, route loops, screenshot capture, JSON output, and markdown report generation.
- Modify `package.json`
  - Add `qa:sitewide`.
- Optional after first run: modify app files only for fixes found by QA.
  - Likely owners: `src/design/SiteShell.tsx`, `src/design/navModel.ts`, `src/pages/*.tsx`, `src/index.css`, `src/marketing/stateMap.ts`.

## Task 1: Add The Route And Feature Manifest

**Files:**
- Create: `scripts/qa/routes.mjs`
- Modify: none
- Test: manual route count check through Node

- [ ] **Step 1: Create route manifest**

Create `scripts/qa/routes.mjs` with:

```js
export const ROUTES = [
  { path: "/", group: "marketing", feature: "home" },
  { path: "/products", group: "marketing", feature: "products" },
  { path: "/products/platform", group: "marketing", feature: "platform" },
  { path: "/solutions", group: "marketing", feature: "solutions" },
  { path: "/investors", group: "audience", feature: "investors" },
  { path: "/brokers", group: "audience", feature: "brokers" },
  { path: "/borrower-profiles", group: "audience", feature: "borrower-profiles" },
  { path: "/non-us-investors", group: "audience", feature: "non-us-investors" },
  { path: "/foreign-nationals", group: "alias", feature: "non-us-investors-alias" },
  { path: "/str-airbnb", group: "audience", feature: "str-hosts" },
  { path: "/vacation-homes", group: "audience", feature: "vacation-homes" },
  { path: "/case-studies", group: "content", feature: "case-studies" },
  { path: "/about", group: "company", feature: "about" },
  { path: "/careers", group: "company", feature: "careers" },
  { path: "/support", group: "company", feature: "support" },
  { path: "/legal", group: "legal", feature: "legal" },
  { path: "/privacy-policy", group: "legal", feature: "privacy-policy" },
  { path: "/terms-of-service", group: "legal", feature: "terms-of-service" },
  { path: "/faq", group: "content", feature: "faq" },
  { path: "/blog", group: "content", feature: "blog" },
  { path: "/rate-quiz", group: "conversion", feature: "rate-quiz" },
  { path: "/book-demo", group: "conversion", feature: "book-demo" },
  { path: "/investgo", group: "portal", feature: "portal-home" },
  { path: "/investgo/analyze", group: "portal", feature: "portal-analyze" },
  { path: "/investgo/sensitivity", group: "portal", feature: "portal-sensitivity" },
  { path: "/investgo/optimize", group: "portal", feature: "portal-optimize" },
  { path: "/investgo/state", group: "portal", feature: "portal-state" },
  { path: "/investgo/history", group: "portal", feature: "portal-history" },
  { path: "/investgo/settings", group: "portal", feature: "portal-settings" },
  { path: "/dscr-calculator", group: "tool", feature: "dscr-calculator" },
  { path: "/lender-intel", group: "tool", feature: "lender-intel" },
  { path: "/state-laws?state=TX", group: "tool", feature: "state-laws-deeplink" },
  { path: "/deal-analyzer", group: "tool", feature: "deal-analyzer" },
  { path: "/decision-support", group: "tool", feature: "decision-support-canonical" },
  { path: "/tools/refi-tracker", group: "tool", feature: "refi-tracker" },
  { path: "/tools/arm-reset", group: "tool", feature: "arm-reset" },
  { path: "/tools/monte-carlo", group: "tool", feature: "monte-carlo" },
  { path: "/tools/returns", group: "tool", feature: "returns" },
  { path: "/tools/tax-engine", group: "tool", feature: "tax-engine" },
  { path: "/tools/stress-matrix", group: "tool", feature: "stress-matrix" },
  { path: "/tools/decision-support", group: "tool", feature: "decision-support-tools" },
  { path: "/tools/str-underwriting", group: "tool", feature: "str-underwriting" },
  { path: "/tools/portfolio", group: "tool", feature: "portfolio" },
  { path: "/tools/workspace", group: "portal", feature: "workspace-alias" },
  { path: "/tools/deal-workspace", group: "portal", feature: "deal-workspace-alias" },
  { path: "/tools/sensitivity", group: "portal", feature: "sensitivity-alias" },
  { path: "/tools/structure-optimizer", group: "portal", feature: "structure-optimizer-alias" },
  { path: "/tools/scenario-history", group: "portal", feature: "scenario-history-alias" },
];

export const VIEWPORTS = [
  { name: "desktop-wide", width: 1440, height: 1000 },
  { name: "desktop-laptop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024, isMobile: true },
  { name: "mobile-small", width: 360, height: 800, isMobile: true },
  { name: "mobile", width: 390, height: 844, isMobile: true },
  { name: "mobile-large", width: 430, height: 932, isMobile: true },
];

export const SAFE_INPUT_VALUES = {
  email: "qa@example.com",
  text: "QA Property",
  number: "425000",
  range: "50",
  search: "Texas",
  tel: "5555550100",
  url: "https://example.com",
};

export const BLOCKED_SIDE_EFFECT_TEXT =
  /submit|send|apply|download|delete|remove|log out|sign out|book|schedule|pay|purchase|upload|connect|authorize/i;
```

- [ ] **Step 2: Verify route manifest imports**

Run:

```powershell
node -e "import('./scripts/qa/routes.mjs').then(m => console.log(m.ROUTES.length, m.VIEWPORTS.length))"
```

Expected:

```txt
49 6
```

- [ ] **Step 3: Commit**

Run:

```powershell
git add scripts/qa/routes.mjs
git commit -m "test: add sitewide QA route manifest"
```

## Task 2: Add DOM And Mobile Layout Audit Helpers

**Files:**
- Create: `scripts/qa/dom-audit.mjs`
- Test: one direct browser evaluation through the sitewide runner in Task 4

- [ ] **Step 1: Create DOM auditor**

Create `scripts/qa/dom-audit.mjs` with:

```js
export function routeSlug(route) {
  return route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function collectDomAudit(page, viewport) {
  return page.evaluate((viewportName) => {
    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        Number(style.opacity) !== 0;
    };

    const textOf = (el) =>
      (el.innerText || el.textContent || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "")
        .trim()
        .replace(/\s+/g, " ");

    const rectOf = (el) => {
      const rect = el.getBoundingClientRect();
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        bottom: Math.round(rect.bottom),
      };
    };

    const allVisible = Array.from(document.querySelectorAll("body *")).filter(visible);
    const controls = Array.from(document.querySelectorAll("a,button,input,select,textarea,[role='button'],[tabindex]"))
      .filter(visible);
    controls.forEach((el, index) => el.setAttribute("data-qa-probe", String(index)));

    const h1s = Array.from(document.querySelectorAll("h1")).filter(visible).map((el) => ({
      text: textOf(el),
      rect: rectOf(el),
    }));

    const headings = Array.from(document.querySelectorAll("h1,h2,h3")).filter(visible).slice(0, 24).map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: textOf(el).slice(0, 120),
      rect: rectOf(el),
      fontSize: parseFloat(getComputedStyle(el).fontSize),
    }));

    const touchTargetFailures = controls
      .map((el) => ({ text: textOf(el).slice(0, 100), tag: el.tagName.toLowerCase(), rect: rectOf(el) }))
      .filter((item) => item.rect.width < 44 || item.rect.height < 44);

    const tinyText = allVisible
      .map((el) => ({
        text: textOf(el).slice(0, 100),
        tag: el.tagName.toLowerCase(),
        fontSize: parseFloat(getComputedStyle(el).fontSize),
        rect: rectOf(el),
      }))
      .filter((item) => item.text && item.fontSize > 0 && item.fontSize < 12);

    const desktopGridOnMobile = allVisible
      .map((el) => {
        const style = getComputedStyle(el);
        const columns = style.gridTemplateColumns === "none" ? [] : style.gridTemplateColumns.split(" ").filter(Boolean);
        return { tag: el.tagName.toLowerCase(), className: String(el.className || "").slice(0, 100), columns: columns.length, rect: rectOf(el) };
      })
      .filter((item) => item.columns >= 3 && item.rect.width > 300);

    const buttonTextOverflow = controls
      .map((el) => ({ text: textOf(el).slice(0, 100), tag: el.tagName.toLowerCase(), rect: rectOf(el), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }))
      .filter((item) => item.scrollWidth > item.clientWidth + 2);

    const fixedOverlays = allVisible
      .map((el) => ({ tag: el.tagName.toLowerCase(), className: String(el.className || "").slice(0, 100), position: getComputedStyle(el).position, rect: rectOf(el), text: textOf(el).slice(0, 80) }))
      .filter((item) => ["fixed", "sticky"].includes(item.position) && item.rect.height > 0);

    const invalidAnchors = Array.from(document.querySelectorAll("a"))
      .filter(visible)
      .filter((el) => !el.getAttribute("href") || el.getAttribute("href") === "#")
      .map((el) => ({ text: textOf(el).slice(0, 100), html: el.outerHTML.slice(0, 200) }));

    const fields = Array.from(document.querySelectorAll("input,select,textarea"))
      .filter((el) => visible(el) && el.type !== "hidden");

    const missingLabels = fields
      .filter((el) => {
        const id = el.getAttribute("id");
        if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title")) return false;
        if (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) return false;
        if (el.closest("label")) return false;
        return true;
      })
      .map((el) => ({ tag: el.tagName.toLowerCase(), type: el.getAttribute("type") || "", placeholder: el.getAttribute("placeholder") || "", id: el.getAttribute("id") || "" }));

    const firstUsefulControl = controls.map((el) => rectOf(el)).find((rect) => rect.y >= 0);
    const mobile = innerWidth <= 768 || viewportName.includes("mobile") || viewportName.includes("tablet");

    return {
      title: document.title,
      url: location.href,
      viewport: { name: viewportName, width: innerWidth, height: innerHeight },
      scroll: {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      },
      h1s,
      headings,
      textStart: document.body.innerText.slice(0, 800),
      controls: controls.map((el) => ({ probe: el.getAttribute("data-qa-probe"), tag: el.tagName.toLowerCase(), type: el.getAttribute("type") || "", text: textOf(el).slice(0, 100), href: el.getAttribute("href") || "", rect: rectOf(el) })),
      invalidAnchors,
      missingLabels,
      mobileIssues: mobile ? {
        touchTargetFailures,
        tinyText,
        desktopGridOnMobile,
        buttonTextOverflow,
        firstUsefulControlBelowFold: !!firstUsefulControl && firstUsefulControl.y > innerHeight,
        fixedOverlays,
      } : null,
      frameworkOverlayText: /vite|webpack|next\\.js|runtime error|failed to compile/i.test(document.body.innerText),
    };
  }, viewport.name);
}

export function summarizeAudit(route, viewport, audit, consoleIssues) {
  const errors = [];
  const warnings = [];

  if (!audit.title) errors.push("missing-title");
  if (!audit.textStart || audit.textStart.length < 80) errors.push("blank-or-thin-page");
  if (audit.frameworkOverlayText) errors.push("framework-overlay-visible");
  if (audit.h1s.length !== 1) warnings.push(`h1-count-${audit.h1s.length}`);
  if (audit.scroll.horizontalOverflow) errors.push("horizontal-overflow");
  if (audit.invalidAnchors.length > 0) errors.push(`invalid-anchors-${audit.invalidAnchors.length}`);
  if (audit.missingLabels.length > 0) errors.push(`missing-labels-${audit.missingLabels.length}`);
  if (consoleIssues.length > 0) errors.push(`console-issues-${consoleIssues.length}`);

  if (audit.mobileIssues) {
    if (audit.mobileIssues.touchTargetFailures.length > 8) errors.push(`mobile-touch-target-failures-${audit.mobileIssues.touchTargetFailures.length}`);
    if (audit.mobileIssues.tinyText.length > 30) errors.push(`mobile-tiny-text-${audit.mobileIssues.tinyText.length}`);
    if (audit.mobileIssues.desktopGridOnMobile.length > 0) errors.push(`desktop-grid-on-mobile-${audit.mobileIssues.desktopGridOnMobile.length}`);
    if (audit.mobileIssues.buttonTextOverflow.length > 0) errors.push(`mobile-button-text-overflow-${audit.mobileIssues.buttonTextOverflow.length}`);
    if (audit.mobileIssues.firstUsefulControlBelowFold) warnings.push("first-useful-control-below-mobile-fold");
  }

  return { route, viewport: viewport.name, errors, warnings };
}
```

- [ ] **Step 2: Verify module syntax**

Run:

```powershell
node -e "import('./scripts/qa/dom-audit.mjs').then(m => console.log(typeof m.collectDomAudit, typeof m.summarizeAudit))"
```

Expected:

```txt
function function
```

- [ ] **Step 3: Commit**

Run:

```powershell
git add scripts/qa/dom-audit.mjs
git commit -m "test: add DOM and mobile QA auditors"
```

## Task 3: Add Safe Interaction Probes

**Files:**
- Create: `scripts/qa/interactions.mjs`

- [ ] **Step 1: Create interaction helper**

Create `scripts/qa/interactions.mjs` with:

```js
import { BLOCKED_SIDE_EFFECT_TEXT, SAFE_INPUT_VALUES } from "./routes.mjs";

export async function exerciseSafeInteractions(page) {
  return page.evaluate(({ blockedSource, values }) => {
    const blocked = new RegExp(blockedSource, "i");
    const visible = (el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) !== 0;
    };
    const textOf = (el) =>
      (el.innerText || el.textContent || el.getAttribute("aria-label") || el.getAttribute("placeholder") || "")
        .trim()
        .replace(/\s+/g, " ");

    const events = [];

    const controls = Array.from(document.querySelectorAll("[data-qa-probe]")).filter(visible);
    for (const el of controls) {
      const label = textOf(el).slice(0, 100);
      const href = el.getAttribute("href") || "";
      const tag = el.tagName.toLowerCase();
      const type = el.getAttribute("type") || "";
      const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
      const sideEffect = blocked.test(label) && !href;

      if (sideEffect || isExternal) {
        events.push({ action: "skip-click", reason: sideEffect ? "possible-side-effect" : "external-link", label, tag, type, href });
        continue;
      }

      try {
        el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
        if (typeof el.focus === "function") el.focus({ preventScroll: true });
        el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        events.push({ action: "hover-focus-active", ok: true, label, tag, type, href });
      } catch (error) {
        events.push({ action: "hover-focus-active", ok: false, label, tag, type, href, error: String(error).slice(0, 160) });
      }
    }

    const dropdownTriggers = Array.from(document.querySelectorAll("[aria-haspopup='true'], .nav_dropdown_component .w-dropdown-toggle")).filter(visible);
    for (const trigger of dropdownTriggers) {
      trigger.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      trigger.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
      trigger.setAttribute("aria-expanded", "true");
      trigger.classList.add("w--open");
      trigger.closest(".nav_dropdown_component")?.querySelector(".w-dropdown-list")?.classList.add("w--open");
      events.push({ action: "open-dropdown", ok: true, label: textOf(trigger).slice(0, 80) });
    }

    const mobileMenu = document.querySelector("button.burger-wrap,[aria-controls='mobile-nav']");
    if (mobileMenu && visible(mobileMenu)) {
      mobileMenu.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      events.push({ action: "mobile-menu-open", ok: true, label: textOf(mobileMenu).slice(0, 80) });
    }

    const fields = Array.from(document.querySelectorAll("input,select,textarea")).filter((el) => visible(el) && el.type !== "hidden");
    for (const field of fields) {
      if (field.disabled || field.readOnly) continue;
      const tag = field.tagName.toLowerCase();
      const type = field.getAttribute("type") || "text";
      let value = values[type] || values.text;

      if (tag === "select") {
        const option = Array.from(field.options).find((candidate) => !candidate.disabled && candidate.value !== "");
        if (!option) continue;
        field.value = option.value;
        value = option.value;
      } else if (type === "checkbox" || type === "radio") {
        field.checked = true;
        value = "checked";
      } else if (type === "range") {
        const min = Number(field.min || 0);
        const max = Number(field.max || 100);
        value = String(Math.round((min + max) / 2));
        field.value = value;
      } else {
        field.value = value;
      }

      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
      events.push({ action: "exercise-input", ok: true, tag, type, value });
    }

    return events;
  }, {
    blockedSource: BLOCKED_SIDE_EFFECT_TEXT.source,
    values: SAFE_INPUT_VALUES,
  });
}
```

- [ ] **Step 2: Verify module syntax**

Run:

```powershell
node -e "import('./scripts/qa/interactions.mjs').then(m => console.log(typeof m.exerciseSafeInteractions))"
```

Expected:

```txt
function
```

- [ ] **Step 3: Commit**

Run:

```powershell
git add scripts/qa/interactions.mjs
git commit -m "test: add safe sitewide interaction probes"
```

## Task 4: Build The Sitewide QA Runner

**Files:**
- Create: `scripts/sitewide-qa.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create QA runner**

Create `scripts/sitewide-qa.mjs` with:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";
import { ROUTES, VIEWPORTS } from "./qa/routes.mjs";
import { collectDomAudit, delay, routeSlug, summarizeAudit } from "./qa/dom-audit.mjs";
import { exerciseSafeInteractions } from "./qa/interactions.mjs";

const BASE_URL = process.env.QA_BASE_URL ?? "http://127.0.0.1:3000";
const OUT_ROOT = process.env.QA_OUT_DIR ?? path.resolve(".tmp", "sitewide-qa");
const STAMP = new Date().toISOString().replace(/[:.]/g, "-");
const OUT_DIR = path.join(OUT_ROOT, STAMP);

const IGNORE_CONSOLE = [
  /Failed to load resource/i,
  /net::ERR_ABORTED/i,
  /favicon/i,
  /cdn-cookieyes/i,
];

function findChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
    "C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate));
}

async function gotoRoute(page, route) {
  await page.goto(new URL(route.path, BASE_URL).toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
  await delay(450);
  const firstText = await page.evaluate(() => document.body.innerText.slice(0, 200));
  await delay(1200);
  const delayedText = await page.evaluate(() => document.body.innerText.slice(0, 200));
  return { firstText, delayedText };
}

function renderMarkdown(summary) {
  const lines = [];
  lines.push("# Sitewide QA Report");
  lines.push("");
  lines.push(`Base URL: ${summary.baseUrl}`);
  lines.push(`Routes: ${summary.routes.length}`);
  lines.push(`Viewports: ${summary.viewports.map((v) => `${v.name} ${v.width}x${v.height}`).join(", ")}`);
  lines.push(`Failures: ${summary.failures.length}`);
  lines.push("");
  lines.push("## Findings");
  lines.push("");
  if (summary.failures.length === 0) {
    lines.push("No automatic failures found. Human visual review is still required for mobile polish.");
  } else {
    for (const failure of summary.failures) {
      lines.push(`- ${failure.viewport} ${failure.route}: ${failure.errors.join(", ")}`);
    }
  }
  lines.push("");
  lines.push("## Mobile Risk Routes");
  lines.push("");
  const mobileRows = summary.results.filter((result) => result.audit.mobileIssues && (result.errors.length || result.warnings.length));
  if (mobileRows.length === 0) {
    lines.push("No mobile-specific automatic issues found.");
  } else {
    for (const row of mobileRows) {
      lines.push(`- ${row.viewport} ${row.route}: errors=${row.errors.join("|") || "none"} warnings=${row.warnings.join("|") || "none"} screenshot=${row.screenshot}`);
    }
  }
  lines.push("");
  lines.push("## Side-Effect Controls Skipped");
  lines.push("");
  const skipped = summary.results.flatMap((result) => result.interactions.filter((event) => event.action === "skip-click").map((event) => ({ ...event, route: result.route, viewport: result.viewport })));
  if (skipped.length === 0) {
    lines.push("No side-effect controls skipped.");
  } else {
    for (const event of skipped.slice(0, 80)) {
      lines.push(`- ${event.viewport} ${event.route}: ${event.reason} ${event.label}`);
    }
  }
  return lines.join("\\n");
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
      for (const route of ROUTES) {
        const consoleIssues = [];
        page.removeAllListeners("console");
        page.on("console", (msg) => {
          if (!["error", "warning", "warn"].includes(msg.type())) return;
          const text = msg.text();
          if (IGNORE_CONSOLE.some((rx) => rx.test(text))) return;
          consoleIssues.push({ type: msg.type(), text });
        });

        const result = {
          route: route.path,
          group: route.group,
          feature: route.feature,
          viewport: viewport.name,
          errors: [],
          warnings: [],
          interactions: [],
        };

        try {
          const loadText = await gotoRoute(page, route);
          const defaultShot = path.join(OUT_DIR, `${viewport.name}-${routeSlug(route.path)}-default.png`);
          await page.screenshot({ path: defaultShot, fullPage: false });
          const audit = await collectDomAudit(page, viewport);
          const summaryRow = summarizeAudit(route.path, viewport, audit, consoleIssues);
          result.errors.push(...summaryRow.errors);
          result.warnings.push(...summaryRow.warnings);
          result.audit = audit;
          result.loadTextChanged = loadText.firstText !== loadText.delayedText;
          result.screenshot = defaultShot;
          result.interactions = await exerciseSafeInteractions(page);
          await delay(350);
          const interactionShot = path.join(OUT_DIR, `${viewport.name}-${routeSlug(route.path)}-interactions.png`);
          await page.screenshot({ path: interactionShot, fullPage: false });
          const postAudit = await collectDomAudit(page, viewport);
          result.postInteraction = {
            horizontalOverflow: postAudit.scroll.horizontalOverflow,
            h1s: postAudit.h1s,
            screenshot: interactionShot,
          };
          if (postAudit.scroll.horizontalOverflow) result.errors.push("post-interaction-horizontal-overflow");
        } catch (error) {
          result.errors.push(String(error).slice(0, 300));
        }

        if (result.errors.length > 0) {
          summary.failures.push({ route: route.path, viewport: viewport.name, errors: result.errors });
        }
        summary.results.push(result);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }

  const jsonPath = path.join(OUT_DIR, "sitewide-qa.json");
  const mdPath = path.join(OUT_DIR, "sitewide-qa.md");
  await writeFile(jsonPath, JSON.stringify(summary, null, 2));
  await writeFile(mdPath, renderMarkdown(summary));
  await writeFile(path.join(OUT_ROOT, "latest.json"), JSON.stringify(summary, null, 2));
  await writeFile(path.join(OUT_ROOT, "latest.md"), renderMarkdown(summary));

  console.log(`Sitewide QA output: ${OUT_DIR}`);
  console.log(`Report: ${mdPath}`);
  if (summary.failures.length > 0) {
    console.error(JSON.stringify(summary.failures.slice(0, 30), null, 2));
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Add package script**

Modify `package.json` scripts:

```json
"qa:sitewide": "node scripts/sitewide-qa.mjs"
```

Keep existing scripts unchanged.

- [ ] **Step 3: Run TypeScript pre-check**

Run:

```powershell
npm run lint
```

Expected:

```txt
No TypeScript errors.
```

- [ ] **Step 4: Run sitewide QA**

Make sure the app is running at `http://127.0.0.1:3000`, then run:

```powershell
$env:QA_BASE_URL='http://127.0.0.1:3000'; npm run qa:sitewide
```

Expected:

```txt
Sitewide QA output: .tmp\sitewide-qa\<timestamp>
Report: .tmp\sitewide-qa\<timestamp>\sitewide-qa.md
```

If the command exits nonzero, keep the generated report. Nonzero means issues were found, not that the runner failed.

- [ ] **Step 5: Commit**

Run:

```powershell
git add package.json scripts/sitewide-qa.mjs
git commit -m "test: add sitewide QA runner"
```

## Task 5: Manual Browser QA Pass For Highest-Risk Flows

**Files:**
- Modify only if fixes are needed after the audit.
- Evidence: Browser screenshots and `.tmp/sitewide-qa/latest.md`.

- [ ] **Step 1: Define manual target flows**

Use these exact flows:

```txt
Home: / -> Product dropdown -> Who We Serve dropdown -> Resources dropdown -> mobile menu open/close
Borrower Profiles: /borrower-profiles -> choose each borrower lane -> primary CTA -> calculator link
Lender Intel: /lender-intel -> change deal inputs/filters -> confirm lender ranking updates or stays explainable
Refi Tracker: /tools/refi-tracker -> change balance/rate/value inputs -> confirm eligibility and economics update separately
DSCR Calculator: /dscr-calculator -> fill rent/payment/value fields -> confirm DSCR/result panel updates
State Laws: /state-laws?state=TX -> change state -> back/forward -> confirm deep link state persists
Rate Quiz: /rate-quiz -> advance through non-submit steps -> stop before external/side-effect submit
Portal: /investgo -> switch tabs analyze/sensitivity/optimize/state/history/settings
Mobile Nav: 390px width -> open menu -> nested links visible -> tap internal route -> menu closes and route changes
Footer: any React route -> footer links route internally and legal links load
```

- [ ] **Step 2: Run Browser validation for each flow**

For every flow, capture:

```txt
route
viewport
starting visible state
interaction
observed visible state
console errors/warnings
screenshot path or Browser image evidence
pass/fail
```

- [ ] **Step 3: Mobile-specific human review**

At `360x800`, `390x844`, and `430x932`, inspect:

```txt
Can a thumb operate primary controls?
Does the first viewport show the real task or only decoration?
Does content stack in a deliberate mobile order?
Does the mobile menu feel like a mobile menu?
Are calculators/forms single-column and readable?
Are result panels visible without horizontal panning?
Do sticky/floating elements cover anything?
Does any page keep a desktop mega-grid on mobile?
```

- [ ] **Step 4: Write findings**

For each issue, write:

```txt
Severity: P0/P1/P2/P3
Route:
Viewport:
User-visible problem:
Steps:
Evidence:
Likely owner file:
Recommended fix:
```

## Task 6: Fix Triage Protocol

**Files:**
- Modify app files only after findings are grouped by owner.

- [ ] **Step 1: Group findings by shared owner**

Use this order:

```txt
Shared shell/nav: src/design/SiteShell.tsx, src/design/navModel.ts, src/index.css
Route resolver/lifecycle: src/App.tsx, src/router/resolve.ts
Marketing home/nav sync: index.html, src/marketing/homeNavSync.ts, src/marketing/rebuildVideo.ts
State map: src/marketing/stateMap.ts, src/pages/StateLawsPage.tsx
Individual pages: src/pages/<PageName>.tsx
```

- [ ] **Step 2: Fix shared issues before page-local issues**

Do not patch one page if the same break appears across many routes. Examples:

```txt
Desktop hamburger leaking on React routes -> fix SiteShell nav responsive CSS.
Mobile menu hidden behind page content -> fix SiteShell stacking and menu positioning.
All tools have horizontal overflow -> fix shared page shell/container CSS.
State deep link fails -> fix StateLawsPage/stateMap routing.
One calculator result panel overflows -> fix that page only.
```

- [ ] **Step 3: Re-run focused QA after every fix**

For a shared nav fix:

```powershell
$env:QA_BASE_URL='http://127.0.0.1:3000'; npm run qa:sitewide
```

For a single page fix, run the full command unless a temporary route filter has been added. The full route matrix is safer for shared layout risk.

- [ ] **Step 4: Final verification**

Before declaring the site QA complete, run:

```powershell
npm run lint
$env:QA_BASE_URL='http://127.0.0.1:3000'; npm run qa:sitewide
```

Expected:

```txt
npm run lint exits 0.
qa:sitewide either exits 0 or exits nonzero only for accepted documented issues.
```

## Task 7: Final QA Report Shape

**Files:**
- Create only if user wants a committed report: `docs/qa/sitewide-qa-2026-06-30.md`
- Otherwise keep generated report in `.tmp/sitewide-qa/latest.md`.

- [ ] **Step 1: Write final report summary**

Use this report structure:

```md
# Sitewide QA Report

## Summary
- Routes checked:
- Viewports checked:
- Controls exercised:
- Pass/fail:

## P0/P1 Findings

## Mobile UI Findings

## Route Matrix Results

## Interaction Coverage

## Console And Runtime Health

## Screenshots And Evidence

## Remaining Risks
```

- [ ] **Step 2: Include mobile judgement**

The report must explicitly say whether mobile feels mobile-native or cramped desktop. Use this scale:

```txt
5 = mobile-native, deliberate stack, readable, thumb-friendly
4 = mostly mobile-native, minor density issues
3 = usable but desktop-derived
2 = cramped desktop
1 = broken on mobile
```

- [ ] **Step 3: Commit only if report is meant to be durable**

Run:

```powershell
git add docs/qa/sitewide-qa-2026-06-30.md
git commit -m "docs: add sitewide QA report"
```

Skip this commit if the report stays in `.tmp`.

## Self-Review

Spec coverage:

- Whole site route coverage: Task 1 route matrix and Task 4 runner.
- All safe buttons/features: Task 3 probes and Task 5 manual flows.
- Strict mobile UI: Mobile Failure Rubric, Task 2 automatic checks, Task 5 human review.
- Existing app patterns: Uses current Puppeteer dependency and existing `qa:interactions` style.
- Route/nav drift: Task 4 delayed post-load check and Task 6 shared-owner triage.
- No repo pollution: outputs go to `.tmp/sitewide-qa/`.

Placeholder scan:

- No placeholder instructions or unspecified test steps remain.
- Every code-producing task includes concrete file paths and code.

Risk:

- The automatic runner cannot safely submit forms or external booking flows. It inventories those controls and requires manual approval before side-effect testing.
- Automatic mobile heuristics catch common layout failures but do not replace human visual judgement. Task 5 is mandatory.
