import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import homepageMarkup from "./home-markup.html?raw";

const CLAIM_REPLACEMENTS = [
  ["Book a demo", "Apply for a loan"],
  ["Get started", "Apply for a DSCR loan"],
  ["See InvestGO in action", "Open the deal workspace"],
  ["Match lenders", "Request facts"],
  ["State rules", "State checklist"],
  ["Lock the rate", "Continue request"],
  [
    "DSCR financing for real estate investors — qualify on the property’s rental income, not personal income tax returns.",
    "A clearer path to a DSCR loan — from property math to a preliminary request.",
  ],
  [
    "Direct DSCR lending for real estate investors, foreign nationals, and short-term-rental hosts — we underwrite and fund in-house.",
    "Model the deal, understand the assumptions, and continue into a preliminary loan request without entering the same facts twice.",
  ],
  [
    "Verified pricing, instant program matching, and 50-state rules in one connected workflow.",
    "Connected deal tools, transparent assumptions, and one preliminary loan-request flow.",
  ],
  [
    "Run your entire DSCR loan from one unified system — powered by ",
    "Move from property numbers to a preliminary DSCR loan request in one connected workflow — powered by ",
  ],
  [
    "Verified pricing across a full suite of wholesale DSCR programs. Trusted by brokers nationwide.",
    "A connected DSCR financing workflow for brokers and real estate investors.",
  ],
  [
    '<div class="u-text-style-h1">11 lenders</div>',
    '<div class="u-text-style-h1">Property</div>',
  ],
  [
    "Verified wholesale DSCR lenders in the engine — matched by FICO, LTV, DSCR, and property type",
    "Property value, purpose, and type establish the entered loan request",
  ],
  [
    '<div class="u-text-style-h1">6.125%</div>',
    '<div class="u-text-style-h1">Rate input</div>',
  ],
  [
    "Best available rate tier for 740+ FICO, ≤75% LTV files — June 2026 rate sheet pull",
    "Payment math uses the visitor’s interest-rate and loan-term assumptions",
  ],
  [
    '<div class="u-text-style-h1">50 states</div>',
    '<div class="u-text-style-h1">Location</div>',
  ],
  [
    "PPP and usury rules mapped and updated monthly — including TX, MN, OH, PA, NJ",
    "Property state stays attached so jurisdiction-specific questions remain visible",
  ],
  [
    '<div class="u-text-style-h1">21–30 days</div>',
    '<div class="u-text-style-h1">Timing</div>',
  ],
  [
    "Typical close time on a clean DSCR file with verified lender match",
    "Requested timing carries into the preliminary loan request as a borrower input",
  ],
  [
    "(Composite, based on real Greenstreet broker data)",
    "(Representative borrower story — fictional example, not a real person or customer endorsement)",
  ],
  ["Five questions to a real rate tier", "Five questions to start your loan request"],
  [
    "Answer five questions about your file — FICO, LTV, property type, state, and rent — and get a preliminary rate tier from Greenstreet's matched programs. A preliminary estimate, not a commitment to lend.",
    "Answer five questions about the property and borrower context, review the preliminary math, and continue into a loan request when you are ready.",
  ],
  [
    "Built on PPP rules, usury caps, and business-purpose requirements for all 50 states — including TX APR ban, MN HF 3437, OH/PA thresholds, and NJ LLC risk. Updated monthly.",
    "Use the property state to open an educational source reference, then confirm the actual transaction with the responsible provider or counsel.",
  ],
  [
    "Bank-grade security and privacy that protect your critical transaction data — with smarter underwriting flows that replace invasive oversight and build trust instead of eroding it.",
    "Secure handling requires configured services, least-privilege access, monitoring, and documented retention. Do not submit SSNs, bank records, or identity documents.",
  ],
  [
    "Bank-grade data privacy and secure document storage",
    "Security controls require documented verification",
  ],
  ["Real results from teams using Greenstreet", "Borrower request paths Greenstreet is built to support"],
  [
    "Mortgage brokers, lenders, and real estate investors rely on Greenstreet to price loans, run underwriting scenarios, and lock rates across complex rental portfolios.",
    "Review fictional borrower stories that show which facts move from property math into a preliminary request. They are workflow examples, not real people, customers, or endorsements.",
  ],
  ["Case study", "Borrower story"],
  ["See all cases", "Review borrower request paths"],
  ["Est. weekly time saved on manual underwriting", "Requested loan purpose"],
  ["Greenstreet users", "Illustrative leverage input"],
  ["MoM headcount growth enabled", "Modeled payment coverage"],
  ["Legacy Spreadsheets Replaced", "Properties in the request"],
  ["Est. Reduction in Loan Origination Cycle Time", "Combined requested balance"],
  ["Legacy Platforms Replaced", "Income profile"],
  ["Faster lender program matching ", "Borrower handoff"],
  ["Trusted by DSCR brokers nationwide.", "How to evaluate a DSCR workflow."],
  [
    "Why your DSCR lender cares about Track 2 (and you should too)",
    "What PITIA includes — and why it changes DSCR",
  ],
  [
    "June 2026 DSCR rate sheet: where the 6.125% specials actually are",
    "How to review a DSCR rate sheet without treating it as a quote",
  ],
  ["Book a Live Demo", "Start a Loan Request"],
  ["Learn More Now<br/>+1 (555) 010-0000", "Apply for a <br/>DSCR Loan"],
  ['href="tel:+15550100000"', 'href="/apply"'],
  [
    "Based on sampled user sessions over the past 12 months. Results may vary by content complexity, firm setup, and reviewer availability.",
    "Borrower stories are fictional workflow examples, not real people, customer outcomes, or endorsements.",
  ],
  [
    "Based on underwriting cycle times across a sample of customers. Results may vary by deal volume, loan complexity, and firm size.",
    "Displayed timing is a borrower-request input, not a closing-time estimate.",
  ],
  [
    "Based on sampled onboarding data of customers consolidating systems into Greenstreet. Results may vary.",
    "Displayed property and balance figures are example inputs, not customer outcomes.",
  ],
  [
    "Based on annual customer retention across paid subscriptions. Customers are considered churned upon cancellation.",
    "Program availability, pricing, eligibility, and terms require provider confirmation.",
  ],
  [
    "The DSCR engine. Deterministic. 50-state clean. Underwriter-defensible.",
    "Connected DSCR tools with explicit assumptions and a preliminary loan-request path.",
  ],
  [
    "⎋</strong> Greenstreet Finance announces <strong>InvestGO</strong> — the unified DSCR loan platform",
    "÷</strong> Check your <strong>DSCR</strong> — carry the same deal into a loan request",
  ],
  [
    "All-in-one platform for non-QM and DSCR lending",
    "Connected DSCR loan tools for rental-property investors",
  ],
  ["Our DSCR Programs", "Tools that move a deal forward"],
  [
    "Learn the how and why of Greenstreet in 15 minutes",
    "See how the tools carry a deal toward a preliminary loan request",
  ],
  [
    "Get your questions answered by a member of the Greenstreet team",
    "Start with your property and requested loan amount",
  ],
  [
    "Match your deal to the right program",
    "Prepare the property details for a loan request",
  ],
  [
    "Filter 7 custom Greenstreet DSCR programs by FICO, LTV, DSCR ratio, and property type. See which program will actually fund this file — underwritten and funded in-house.",
    "Compare how FICO, LTV, DSCR ratio, and property type affect an educational scenario. Program availability, eligibility, pricing, underwriting, and funding require confirmation from the responsible licensed provider.",
  ],
  [
    "Instant pricing & scenario run-throughs",
    "Transparent scenario calculations",
  ],
  [
    "Instant pricing &amp; scenario run-throughs",
    "Transparent scenario calculations",
  ],
  [
    "50-state rules, always current",
    "State research with source verification",
  ],
  [
    "Submit clean. Close fast.",
    "Move from estimate to loan request",
  ],
  ["Price the deal in minutes", "Model the deal with visible inputs"],
  [
    "Enter the property address, rent, and rate. Get DSCR ratio, Track 1 and Track 2 analysis, break-even rate, and cash-on-cash return — in under 60 seconds.",
    "Enter the property value, rent, rate, taxes, insurance, and HOA to compare payment coverage and cash-flow assumptions without a timing promise.",
  ],
  ["Verified pricing across a full suite of wholesale DSCR programs. Trusted by brokers nationwide.", "Connected DSCR tools for rental-property borrowers and brokers."],
  [
    '"Helps us detect risk and automate more of our DSCR loan than previously possible...easy to use"',
    "A first-rental buyer has a non-owner-occupied property under contract. The workflow compares entered rent with the full payment, keeps leverage visible, and carries the same facts into a preliminary purchase-loan request.",
  ],
  [
    '"The personal support, the AI capabilities, and then the backing from the underwriting expertise makes me a lot more comfortable... knowing that we\'re doing things the right way."',
    "A portfolio borrower is refinancing four rentals. The workflow keeps balances, rent, payment coverage, and requested proceeds visible property by property before the borrower chooses which request to discuss first.",
  ],
  [
    "“I can't say they like paperwork, but I can tell you that brokers love Greenstreet”",
    "A mortgage broker is handing off a borrower file. The workflow keeps the property, requested amount, purpose, timing, and consent together without rebuilding the request.",
  ],
  [
    '"Whatever we came up with for rental scenarios, it had to move as fast as the content creators moved. Huge thanks to the Greenstreet team!"',
    "A short-term-rental borrower needs to separate long-term rent, projected STR revenue, and documented revenue so modeled income is never mistaken for provider-accepted income.",
  ],
  [
    "“Greenstreet has completely transformed our workflow….its reliability and strong security features give us peace of mind. I highly recommend this platform to any business looking to modernize operations and scale efficiently.”",
    "An international borrower is investing through an entity. The workflow surfaces identity and ownership questions early while sensitive documents remain outside the public intake.",
  ],
  [
    '"I can’t say they like paperwork, but I can tell you that brokers love Greenstreet."',
    "A mortgage broker is handing off a borrower file. The workflow keeps the property, requested amount, purpose, timing, and consent together without rebuilding the request.",
  ],
  [
    '"The personal support, the AI capabilities, and then the backing from the underwriting expertise makes me a lot more comfortable... knowing that we\'re doing things the right way." ',
    "A portfolio borrower is refinancing four rentals. The workflow keeps balances, rent, payment coverage, and requested proceeds visible property by property before the borrower chooses which request to discuss first.",
  ],
  ["Principal Broker, Nexus Financial", "First-rental request · purchase"],
  ["Managing Director, Hadley Capital Partners", "Portfolio request · refinance"],
  ["Broker &amp; COO, Marlowe Asset Group", "Broker-led borrower request"],
  ["COO &amp; broker, Marlowe Asset Group", "Broker-led borrower request"],
  ["Broker &amp; COO, Sterling Bridge Partners", "Short-term-rental request · purchase"],
  ["Director of Originations, Cedar Funding", "International borrower · entity purchase"],
  ["Maya Reynolds", "First-rental borrower"],
  ["David Chen", "Portfolio borrower"],
  ["Carlos Martinez", "Mortgage broker"],
  ["Emma Wallace", "Short-term-rental borrower"],
  ["Layla Kabbani", "International borrower"],
  ["Nexus Financial", "Purchase loan request"],
  ["Hadley Capital Partners", "Portfolio refinance request"],
  ["Marlowe Asset Group", "Broker handoff"],
  ["Sterling Bridge Partners", "Short-term-rental request"],
  ["Cedar Funding", "Entity purchase request"],
  [
    "(Composite, based on real Greenstreet broker data)",
    "(Representative borrower story — fictional example, not a real person or customer endorsement)",
  ],
  ['<div class="cs-hero-stat-nb u-text-style-h2">24 hours</div>', '<div class="cs-hero-stat-nb u-text-style-h2">Purchase</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">70+</div>', '<div class="cs-hero-stat-nb u-text-style-h2">75% LTV</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">20%</div>', '<div class="cs-hero-stat-nb u-text-style-h2">1.18x</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">100+</div>', '<div class="cs-hero-stat-nb u-text-style-h2">Timing set</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">3</div>', '<div class="cs-hero-stat-nb u-text-style-h2">4 rentals</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">60%+</div>', '<div class="cs-hero-stat-nb u-text-style-h2">$1.1M</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">2</div>', '<div class="cs-hero-stat-nb u-text-style-h2">STR</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">Hours</div>', '<div class="cs-hero-stat-nb u-text-style-h2">Entity</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">25+</div>', '<div class="cs-hero-stat-nb u-text-style-h2">Broker</div>'],
  [
    "The whitepaper will be sent to your email inbox shortly!",
    "This form is not connected. No information was sent.",
  ],
  [
    "Get The System of Action Whitepaper",
    "System of Action overview",
  ],
  [
    "Or learn more",
    "The download form is unavailable. Read the overview",
  ],
  [
    '<input class="hero_form_field_input form_main_field_input w-input" data-name="Email 2" id="email-2" maxlength="256" name="email-2" placeholder="Enter your work email address" required="" type="email"/>',
    '<div class="hero_form_field_input form_main_field_input w-input" role="note">Start a preliminary loan request</div>',
  ],
] as const;

function sanitizeUnsupportedHomepageClaims(markup: string): string {
  return CLAIM_REPLACEMENTS.reduce(
    (result, [unsupported, replacement]) => result.replaceAll(unsupported, replacement),
    markup,
  );
}

function repairHomepageSemantics(markup: string): string {
  let burgerControlIndex = 0;
  let featuredNavNodeIndex = 0;
  let burgerNodeIndex = 0;
  let stepContentNodeIndex = 0;

  return markup
    .replace(
      /<div class="home-go-svg w-embed"><svg[\s\S]*?<\/svg><\/div>/,
      '<span class="home-go-svg u-text-style-h4">Deal workspace</span>',
    )
    .replaceAll(
      'INVEST<span style="opacity:0.5">GO</span>',
      "Deal workspace",
    )
    .replaceAll(">InvestGO<", ">Deal workspace<")
    .replaceAll(">Login<", ">Deal workspace<")
    .replace(
      /<div class="testimonial_client_headshot_wrap"><img\b[^>]*\/><\/div>/g,
      '<div aria-hidden="true" class="testimonial_client_headshot_wrap" style="display:flex;align-items:center;justify-content:center"><span class="u-text-style-small">Borrower story</span></div>',
    )
    .replace(
      /<img\b(?=[^>]*\bclass="testimonial-logo")[^>]*\/>/g,
      '<span aria-hidden="true" class="testimonial-logo u-text-style-small">Fictional workflow example</span>',
    )
    .replace(
      /<div class="hero_user_visual_wrap is-home"><img[\s\S]*?<\/div>/g,
      '<div aria-hidden="true" class="hero_user_visual_wrap is-home" style="display:flex;align-items:center;justify-content:center"><span class="u-text-style-small">Borrower story</span></div>',
    )
    .replace(
      /<img\b(?=[^>]*\bclass="cs-home-logo")[^>]*\/>/g,
      '<span aria-hidden="true" class="cs-home-logo u-text-style-h5">Illustrative request path</span>',
    )
    .replaceAll('href="/book-demo"', 'href="/apply"')
    .replaceAll('href="/case-studies/vela-capital"', 'href="/borrower-profiles"')
    .replaceAll('href="/case-studies/northshore-nonqm"', 'href="/borrower-profiles"')
    .replaceAll('href="/case-studies/quintero-co"', 'href="/borrower-profiles"')
    .replaceAll(
      'href="/blog/greenstreet-t3-survey-rating"',
      'href="/blog/what-is-dscr-how-it-works"',
    )
    .replaceAll(
      'href="/blog/track-2-dscr"',
      'href="/blog/dscr-pitia-breakdown-qualifying-income"',
    )
    .replaceAll(
      'href="/blog/system-of-action"',
      'href="/blog/why-no-llm-number-path"',
    )
    .replaceAll(
      'href="/case-studies/northshore-nonqm"',
      'href="/case-studies/northshore-non-qm"',
    )
    .replace(
      '<div class="announcement u-container u-theme-light">',
      '<a class="gs-skip-link" href="#main-content">Skip to main content</a><div class="announcement u-container u-theme-light">',
    )
    .replace(
      '<a class="link-block w-inline-block" href="/blog/greenstreet-go-launch"></a>',
      '<a aria-label="Open the DSCR Calculator" class="link-block w-inline-block" href="/dscr-calculator"></a>',
    )
    .replace(
      '<button class="announcement-close" id="">',
      '<button aria-label="Dismiss announcement" class="announcement-close">',
    )
    .replace(
      '<section class="menu-mobile-wrap">',
      '<section aria-hidden="true" aria-label="Mobile navigation" class="menu-mobile-wrap" id="mobile-navigation">',
    )
    .replace(/<div class="burger-wrap"([^>]*)>/g, (_match, attributes) => {
      burgerControlIndex += 1;
      const label =
        burgerControlIndex === 1
          ? "Open navigation menu"
          : "Close navigation menu";
      return `<div aria-controls="mobile-navigation" aria-expanded="false" aria-label="${label}" class="burger-wrap" role="button" tabindex="0"${attributes}>`;
    })
    .replace(
      'href="#"><div class="footer_bottom_link_text u-text-style-small">Cookies Settings</div>',
      'href="/legal/privacy-policy"><div class="footer_bottom_link_text u-text-style-small">Privacy information</div>',
    )
    .replace(
      'name="firstname" placeholder="First name" required=""',
      'aria-label="First name — form unavailable" disabled="" name="firstname" placeholder="Form unavailable"',
    )
    .replace(
      'name="lastname" placeholder="Last name" required=""',
      'aria-label="Last name — form unavailable" disabled="" name="lastname" placeholder="Form unavailable"',
    )
    .replace(
      'name="Email" placeholder="Email" required=""',
      'aria-label="Email — form unavailable" disabled="" name="Email" placeholder="Form unavailable"',
    )
    .replace(
      '<button class="u-btn-group u-mt-7" id="">',
      '<button aria-label="Whitepaper form unavailable" class="u-btn-group u-mt-7" disabled="">',
    )
    .replace(
      /<form class="hero_form_layout"[^>]*>/,
      '<div class="hero_form_layout">',
    )
    .replace(
      '</form><div class="form_main_success_wrap is-hero',
      '</div><div class="form_main_success_wrap is-hero',
    )
    .replace(
      /<form class="form_main_list"[^>]*>/,
      '<div class="form_main_list">',
    )
    .replace(
      '</form><div class="form_main_success_wrap w-form-done',
      '</div><div class="form_main_success_wrap w-form-done',
    )
    .replace(
      /<a class="link-item w-inline-block" href="([^"]+)"><\/a>(<div class="solution_item"[\s\S]*?<div class="list-item-txt u-text-style-large">([^<]+)<\/div>)/g,
      '<a aria-label="$3" class="link-item w-inline-block" href="$1"></a>$2',
    )
    .replace(
      /<a class="cs-abs-link" href="([^"]+)"><\/a>/g,
      '<a aria-hidden="true" class="cs-abs-link" href="$1" tabindex="-1"></a>',
    )
    .replace(
      /<div class="page_main"([^>]*)>/,
      '<main class="page_main" id="main-content"$1>',
    )
    .replace(
      '</div><div class="footer_component">',
      '</main><div class="footer_component">',
    )
    .replace(
      / id="w-node-_099235b4-dc1c-00f9-c99c-0ba16fa92a7f-6fa92a72"/g,
      (attribute) => {
        featuredNavNodeIndex += 1;
        return featuredNavNodeIndex === 1
          ? attribute
          : ' style="grid-area:span 2 / span 1 / span 2 / span 1"';
      },
    )
    .replace(
      / id="w-node-e50e2dd1-20d6-e56c-6108-ddcf65641374-65641360"/g,
      (attribute) => {
        burgerNodeIndex += 1;
        return burgerNodeIndex === 1 ? attribute : "";
      },
    )
    .replace(
      / id="w-node-d4de036a-7391-1e69-32dd-4db42159330d-21593305"/g,
      (attribute) => {
        stepContentNodeIndex += 1;
        return stepContentNodeIndex === 1 ? attribute : "";
      },
    )
    .replaceAll("InvestGO", "Deal workspace");
}

const LOAN_PROFILE_WIDGET = `<section class="gs-rate-widget-section" aria-label="DSCR loan profile tool"><div class="gs-rate-widget-contain"><div class="gs-rate-widget-copy"><div class="eyebrow">Loan profile</div><h2>Organize the deal before you apply.</h2><p>Answer five borrower and property questions, review what each input means, and carry the useful context into a preliminary loan request. The tool does not invent a current rate or program match.</p><a class="gs-rate-widget-cta" href="/rate-quiz">Build a loan profile -&gt;</a></div><div class="gs-rate-widget-card"><div class="gs-rate-widget-inner"><div class="gs-rate-widget-top"><div class="gs-rate-widget-kicker">Five inputs</div><div class="gs-rate-widget-progress">No credit pull</div></div><div><div class="gs-rate-widget-question">Property, credit band, leverage, coverage, borrower context.</div></div><div class="gs-rate-widget-options" role="list" aria-label="Loan profile inputs"><div class="gs-rate-widget-option is-selected" role="listitem"><b>Visible assumptions</b><span>you provide them</span></div><div class="gs-rate-widget-option" role="listitem"><b>Plain-language result</b><span>not a quote</span></div><div class="gs-rate-widget-option" role="listitem"><b>Connected request</b><span>continue when ready</span></div></div><div class="gs-rate-widget-result"><div><small>Next step</small><div class="gs-rate-widget-rate">Your choice</div></div><div class="gs-rate-widget-pill">Application path</div></div><div class="gs-rate-widget-note">Pricing, availability, eligibility, and terms require confirmation from the responsible provider.</div></div></div></div></section>`;
const STATE_REFERENCE_WIDGET = `<section class="gs-statemap-section" aria-label="State rules research reference"><div class="gs-statemap-contain u-container"><div class="gs-statemap-head"><div class="u-text-style-h5 u-mb-4">State reference</div><h2 class="u-text-style-h2">Start with the jurisdiction and verify the source.</h2><p class="u-text-style-large gs-statemap-sub">Look up educational prepayment-penalty research, inspect the displayed citation, and identify questions that need provider or counsel confirmation for the actual transaction.</p></div><div class="gs-statemap-grid"><div class="gs-statemap-canvas"><div class="gs-statemap-loading">50 states + District of Columbia</div></div><div class="gs-statemap-side"><a class="gs-statemap-cta" href="/state-laws">Open state reference →</a><div class="gs-statemap-note">Research reference only. Law and provider policy can change; this is not legal advice.</div></div></div></div></section>`;

const STEP_SCENE_REPLACEMENTS = [
  ['"Run the numbers", "Match lenders", "Rate quiz", "State rules", "Lock the rate"', '"Example inputs", "Request facts", "Loan profile", "State checklist", "Request draft"'],
  ["Track-1 DSCR", "Example DSCR"],
  ["Qualifies", "Arithmetic only"],
  ["Greenstreet — Premier", "Property facts"],
  ["Greenstreet — STR Plus", "Income facts"],
  ["Greenstreet — No-Ratio", "Borrower facts"],
  ['<span class="hf-rank">1</span>', '<span class="hf-rank">A</span>'],
  ['<span class="hf-rank">2</span>', '<span class="hf-rank">B</span>'],
  ['<span class="hf-rank">3</span>', '<span class="hf-rank">C</span>'],
  ['<span class="hf-chip">94%</span>', '<span class="hf-chip">Entered</span>'],
  ['<span class="hf-chip is-teal">82%</span>', '<span class="hf-chip is-teal">Entered</span>'],
  ['<span class="hf-chip is-ghost">68%</span>', '<span class="hf-chip is-ghost">Verify</span>'],
  ["FICO 742", "Credit input"],
  ["LTV 72%", "Leverage input"],
  ["<b>A&minus;</b>", "<b>Facts</b>"],
  [">SFR<", ">Property type<"],
  ["Lease OK", "Rent evidence"],
  ["APR clear", "Verify APR"],
  ["Bill checked", "Verify current bill"],
  ["LLC risk OK", "Verify entity"],
  ["Scenario saved", "Draft saved"],
  [
    '<span class="hf-metric" data-count="6.875" data-suffix="%" data-dec="3">0.000%</span>',
    '<span class="hf-metric">No rate shown</span>',
  ],
  ["30-day lock &middot; clean file", "Provider review required"],
] as const;

/**
 * The animated homepage frames are same-origin HTML fetched by step-scroll.js.
 * Sanitize that source before it becomes iframe srcdoc so the animation remains
 * intact without publishing a qualification, lender ranking, legal conclusion,
 * or rate-lock claim.
 */
export function sanitizeHomepageStepScene(markup: string): string {
  return STEP_SCENE_REPLACEMENTS.reduce(
    (result, [unsupported, replacement]) =>
      result.replaceAll(unsupported, replacement),
    markup,
  );
}

/**
 * The legacy marketing export includes interactive rate and legal-rule widgets.
 * Preserve its visual shell while replacing those unsupported decision outputs
 * before the markup reaches the DOM (and before embedded scripts can run).
 */
export const publicMarketingMarkup = repairHomepageSemantics(
  sanitizeUnsupportedHomepageClaims(homepageMarkup),
)
  .replace(/<section class="gs-rate-widget-section"[\s\S]*?<\/section><script>[\s\S]*?<\/script>/, LOAN_PROFILE_WIDGET)
  .replace(/<section class="gs-statemap-section"[\s\S]*?<\/section>/, STATE_REFERENCE_WIDGET);

type MarketingRuntime = Window & {
  Webflow?: {
    ready?: () => void;
    require?: (module: string) => { init?: () => void } | undefined;
  };
  initAnimations?: () => void;
  __gsStartMarketing?: () => void;
  __gsStopMarketing?: () => void;
};

function installSanitizedStepSceneFetch(): () => void {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch.call(window, input, init);
    const requestUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    if (
      !requestUrl.includes("/hyperframes/how-it-works/step-scene.html") ||
      !response.ok
    ) {
      return response;
    }

    const sanitizedMarkup = sanitizeHomepageStepScene(await response.text());
    return new Response(sanitizedMarkup, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  };

  return () => {
    window.fetch = originalFetch;
  };
}

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

function installMobileMenuAccessibility(root: HTMLElement): () => void {
  const controls = Array.from(
    root.querySelectorAll<HTMLElement>(".burger-wrap"),
  );
  const menu = root.querySelector<HTMLElement>("#mobile-navigation");
  const primaryControl = controls[0];
  if (!menu || !primaryControl || controls.length < 2) return () => {};

  let isOpen = false;
  let focusTimer = 0;

  const focusableMenuItems = () =>
    Array.from(
      menu.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.getClientRects().length > 0);

  const syncState = (open: boolean) => {
    isOpen = open;
    menu.setAttribute("aria-hidden", String(!open));
    controls.forEach((control) =>
      control.setAttribute("aria-expanded", String(open)),
    );

    window.clearTimeout(focusTimer);
    if (open) {
      focusTimer = window.setTimeout(() => {
        focusableMenuItems()[0]?.focus();
      }, 450);
    }
  };

  const handleControlClick = () => {
    syncState(!isOpen);
  };

  const handleControlKeydown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).click();
  };

  const handleDocumentKeydown = (event: KeyboardEvent) => {
    if (!isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      primaryControl.click();
      primaryControl.focus();
      return;
    }

    if (event.key !== "Tab") return;
    const items = focusableMenuItems();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  controls.forEach((control) => {
    control.addEventListener("click", handleControlClick);
    control.addEventListener("keydown", handleControlKeydown);
  });
  document.addEventListener("keydown", handleDocumentKeydown);

  return () => {
    window.clearTimeout(focusTimer);
    controls.forEach((control) => {
      control.removeEventListener("click", handleControlClick);
      control.removeEventListener("keydown", handleControlKeydown);
    });
    document.removeEventListener("keydown", handleDocumentKeydown);
  };
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
    const restoreStepSceneFetch = installSanitizedStepSceneFetch();
    runEmbeddedScripts(root);
    const removeMobileMenuAccessibility =
      installMobileMenuAccessibility(root);

    const frameId = window.requestAnimationFrame(() => {
      try {
        startMarketingRuntime(runtime);
      } catch (error) {
        console.error("Failed to initialize homepage interactions:", error);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      removeMobileMenuAccessibility();
      restoreStepSceneFetch();
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
      dangerouslySetInnerHTML={{ __html: publicMarketingMarkup }}
    />,
    portalHost,
  );
}
