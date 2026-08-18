/**
 * Fabricated / unsupported homepage claims and their safe replacements.
 *
 * Single source of truth for three consumers, so the lock can never drift
 * from the render path:
 *
 *  1. MarketingHome (runtime) — `sanitizeUnsupportedHomepageClaims` swaps
 *     these before the homepage markup is rendered.
 *  2. vite.config.ts (build) — the release-html-sanitizer applies the same
 *     swaps to index.html's static #webflow-root markup, so the shell and
 *     every prerendered twin ship clean (a no-JS crawler never sees them).
 *  3. scripts/check-ftc-contract.ts (CI) — the `unsupported` side of each
 *     pair is the banned-fabricated-content list; the lock fails the build if
 *     any of it appears in shipped HTML again.
 *
 * The FTC render-lock exists because 16 CFR 465 (fake reviews/endorsements)
 * is live-enforced with per-violation penalties. The claims below are the
 * inventory of what the product's governed posture says must not be published
 * as fact — fabricated rates, fabricated lender stats, in-house lending
 * claims, fake testimonials, and placeholder contact details. The source
 * markup is kept (owner instruction); only rendering is banned.
 */

export const CLAIM_REPLACEMENTS = [
  [
    "DSCR financing for real estate investors — qualify on the property’s rental income, not personal income tax returns.",
    "DSCR scenario tools for real estate investors — compare a property’s rental income with its estimated monthly payment.",
  ],
  [
    "Direct DSCR lending for real estate investors, foreign nationals, and short-term-rental hosts — we underwrite and fund in-house.",
    "Educational DSCR modeling for real estate investors, foreign nationals, and short-term-rental hosts — with a path to request human review.",
  ],
  [
    "Verified pricing, instant program matching, and 50-state rules in one connected workflow.",
    "Transparent scenario math, labeled assumptions, and reliability holds in one connected workflow.",
  ],
  [
    "Run your entire DSCR loan from one unified system — powered by ",
    "Explore a DSCR scenario in one unified workspace — powered by ",
  ],
  [
    "Verified pricing across a full suite of wholesale DSCR programs. Trusted by brokers nationwide.",
    "An illustrative DSCR workflow for brokers and real estate investors.",
  ],
  [
    '<div class="u-text-style-h1">11 lenders</div>',
    '<div class="u-text-style-h1">No live rates</div>',
  ],
  [
    "Verified wholesale DSCR lenders in the engine — matched by FICO, LTV, DSCR, and property type",
    "Pricing and provider matching are disabled until governed source data is approved",
  ],
  [
    '<div class="u-text-style-h1">6.125%</div>',
    '<div class="u-text-style-h1">User-entered</div>',
  ],
  [
    "Best available rate tier for 740+ FICO, ≤75% LTV files — June 2026 rate sheet pull",
    "The calculator uses the visitor’s rate assumption and does not publish current pricing",
  ],
  [
    '<div class="u-text-style-h1">50 states</div>',
    '<div class="u-text-style-h1">Legal hold</div>',
  ],
  [
    "PPP and usury rules mapped and updated monthly — including TX, MN, OH, PA, NJ",
    "State conclusions are disabled pending counsel review and effective-date sourcing",
  ],
  [
    '<div class="u-text-style-h1">21–30 days</div>',
    '<div class="u-text-style-h1">No promise</div>',
  ],
  [
    "Typical close time on a clean DSCR file with verified lender match",
    "No unverified response-time or closing-time commitment is published",
  ],
  [
    "(Composite, based on real Greenstreet broker data)",
    "(Constructed example; not a customer endorsement)",
  ],
  ["Five questions to a real rate tier", "Five questions to organize a scenario"],
  [
    "Answer five questions about your file — FICO, LTV, property type, state, and rent — and get a preliminary rate tier from Greenstreet's matched programs. A preliminary estimate, not a commitment to lend.",
    "Answer five questions about the property and borrower context. Pricing and program conclusions remain unavailable until approved source data is connected.",
  ],
  [
    "Built on PPP rules, usury caps, and business-purpose requirements for all 50 states — including TX APR ban, MN HF 3437, OH/PA thresholds, and NJ LLC risk. Updated monthly.",
    "State-specific conclusions are withheld until primary sources, effective dates, counsel review, and an accountable update process are complete.",
  ],
  [
    "Bank-grade security and privacy that protect your critical transaction data — with smarter underwriting flows that replace invasive oversight and build trust instead of eroding it.",
    "Secure handling requires configured services, least-privilege access, monitoring, and documented retention. Do not submit SSNs, bank records, or identity documents.",
  ],
  [
    "Bank-grade data privacy and secure document storage",
    "Security controls require documented verification",
  ],
  ["Real results from teams using Greenstreet", "Constructed workflow examples"],
  [
    "Mortgage brokers, lenders, and real estate investors rely on Greenstreet to price loans, run underwriting scenarios, and lock rates across complex rental portfolios.",
    "These are illustrative teaching scenarios, not customer endorsements, verified transactions, pricing claims, or measured performance results.",
  ],
  ["Est. weekly time saved on manual underwriting", "Illustrative workflow-time input"],
  ["Greenstreet users", "Illustrative team-size input"],
  ["MoM headcount growth enabled", "Illustrative growth input"],
  ["Legacy Spreadsheets Replaced", "Illustrative systems input"],
  ["Est. Reduction in Loan Origination Cycle Time", "Illustrative cycle-time input"],
  ["Legacy Platforms Replaced", "Illustrative systems input"],
  ["Faster lender program matching ", "Illustrative workflow timing"],
  ["Trusted by DSCR brokers nationwide.", "How to evaluate a DSCR workflow."],
  [
    "June 2026 DSCR rate sheet: where the 6.125% specials actually are",
    "How to review a DSCR rate sheet without treating it as a quote",
  ],
  ["Book a Live Demo", "Request a Scenario Review"],
  ["Learn More Now<br/>+1 (555) 010-0000", "Request a<br/>Scenario Review"],
  ['href="tel:+15550100000"', 'href="/book-demo"'],
  [
    "Based on sampled user sessions over the past 12 months. Results may vary by content complexity, firm setup, and reviewer availability.",
    "Illustrative workflow example only; no verified customer performance sample is published.",
  ],
  [
    "Based on underwriting cycle times across a sample of customers. Results may vary by deal volume, loan complexity, and firm size.",
    "Illustrative workflow example only; no verified underwriting-cycle sample is published.",
  ],
  [
    "Based on sampled onboarding data of customers consolidating systems into Greenstreet. Results may vary.",
    "Illustrative workflow example only; no verified onboarding sample is published.",
  ],
  [
    "Based on annual customer retention across paid subscriptions. Customers are considered churned upon cancellation.",
    "Illustrative workflow example only; no verified retention metric is published.",
  ],
  [
    "The DSCR engine. Deterministic. 50-state clean. Underwriter-defensible.",
    "Educational DSCR scenarios with explicit assumptions and reliability holds.",
  ],
  [
    // The markup wraps the ⎋ glyph inside the strong tag (<strong>⎋</strong>),
    // not before it — the original version of this pair never matched, so the
    // fabricated announcement rendered in the shell, every prerendered twin,
    // and the runtime homepage. Fixed 2026-08-18 (FTC render-lock).
    "<strong>⎋</strong> Greenstreet Finance announces <strong>InvestGO</strong> — the unified DSCR loan platform",
    "<strong>⎋</strong> Explore <strong>InvestGO</strong> — an educational DSCR workflow concept",
  ],
  [
    "All-in-one platform for non-QM and DSCR lending",
    "Educational scenario tools for rental-property analysis",
  ],
  ["Our DSCR Programs", "Product overview"],
  [
    "Learn the how and why of Greenstreet in 15 minutes",
    "Review the educational workflow and its current limitations",
  ],
  [
    "Get your questions answered by a member of the Greenstreet team",
    "Request a preliminary review of your scenario assumptions",
  ],
  [
    "Match your deal to the right program",
    "Compare the assumptions that shape a scenario",
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
    "State-rule conclusions are under review",
  ],
  [
    "Submit clean. Close fast.",
    "Prepare a clearer scenario for review",
  ],
  [
    '"Helps us detect risk and automate more of our DSCR loan than previously possible...easy to use"',
    "Illustrative workflow: organize inputs, inspect risk assumptions, and identify what still needs human confirmation.",
  ],
  [
    '"The personal support, the AI capabilities, and then the backing from the underwriting expertise makes me a lot more comfortable... knowing that we\'re doing things the right way."',
    "Illustrative workflow: compare the same scenario assumptions across tools before requesting a qualified review.",
  ],
  [
    "“I can't say they like paperwork, but I can tell you that brokers love Greenstreet”",
    "Illustrative workflow: make the requested inputs and unresolved questions easier to review.",
  ],
  [
    '"Whatever we came up with for rental scenarios, it had to move as fast as the content creators moved. Huge thanks to the Greenstreet team!"',
    "Illustrative workflow: revise rental assumptions without presenting the result as a quote or approval.",
  ],
  [
    "“Greenstreet has completely transformed our workflow….its reliability and strong security features give us peace of mind. I highly recommend this platform to any business looking to modernize operations and scale efficiently.”",
    "Illustrative workflow: keep scenario inputs together while security and provider controls remain subject to independent verification.",
  ],
  [
    '"I can’t say they like paperwork, but I can tell you that brokers love Greenstreet."',
    "Illustrative workflow: make the requested inputs and unresolved questions easier to review.",
  ],
  [
    '"The personal support, the AI capabilities, and then the backing from the underwriting expertise makes me a lot more comfortable... knowing that we\'re doing things the right way." ',
    "Illustrative workflow: compare the same scenario assumptions across tools before requesting a qualified review.",
  ],
  ["Maya Reynolds", "Constructed scenario"],
  ["David Chen", "Constructed scenario"],
  ["Carlos Martinez", "Constructed scenario"],
  ["Emma Wallace", "Constructed scenario"],
  ["Layla Kabbani", "Constructed scenario"],
  ["Nexus Financial", "Illustrative workflow"],
  ["Hadley Capital Partners", "Illustrative workflow"],
  ["Marlowe Asset Group", "Illustrative workflow"],
  ["Sterling Bridge Partners", "Illustrative workflow"],
  ["Cedar Funding", "Illustrative workflow"],
  ["(Composite, based on real Greenstreet broker data)", "(Constructed example; not a customer endorsement)"],
  ['<div class="cs-hero-stat-nb u-text-style-h2">24 hours</div>', '<div class="cs-hero-stat-nb u-text-style-h2">Illustrative</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">70+</div>', '<div class="cs-hero-stat-nb u-text-style-h2">Example</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">20%</div>', '<div class="cs-hero-stat-nb u-text-style-h2">Not measured</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">100+</div>', '<div class="cs-hero-stat-nb u-text-style-h2">Example</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">3</div>', '<div class="cs-hero-stat-nb u-text-style-h2">Illustrative</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">60%+</div>', '<div class="cs-hero-stat-nb u-text-style-h2">Not measured</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">2</div>', '<div class="cs-hero-stat-nb u-text-style-h2">Illustrative</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">Hours</div>', '<div class="cs-hero-stat-nb u-text-style-h2">Not measured</div>'],
  ['<div class="cs-hero-stat-nb u-text-style-h2">25+</div>', '<div class="cs-hero-stat-nb u-text-style-h2">Example</div>'],
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
    '<div class="hero_form_field_input form_main_field_input w-input" role="note">Continue to request a scenario review</div>',
  ],
] as const;
