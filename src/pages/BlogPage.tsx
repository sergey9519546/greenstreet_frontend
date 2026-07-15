import React, { useEffect, useState } from "react";
import { DcShell, dc, Mono, H1, Lead } from "../design/dc";
import NotFoundPage from "./NotFoundPage";

const BL_ACCENT = "#eeefd3";
const BL_NAV_BORDER = "1px solid rgba(0,55,56,0.15)";
const EDITORIAL_BYLINE = "Published by Greenstreet Finance";

function usePageMetadata(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;

    let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.name = "description";
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.content = description;

    let robotsTag = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement("meta");
      robotsTag.name = "robots";
      document.head.appendChild(robotsTag);
    }
    robotsTag.content = "index, follow";

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = new URL(path, window.location.origin).href;
  }, [description, path, title]);
}

const BL_CSS = `
.bl-card { transition: transform .14s; }
.bl-card:hover { transform: translateY(-4px); }
.bl-card:focus-visible, .bl-filter:focus-visible, .bl-link:focus-visible { outline: 3px solid #00a878; outline-offset: 4px; }
.dc-nav a { color: rgba(0,55,56,0.72) !important; }
.dc-nav a.dc-cta { background: #003738 !important; color: #eeefd3 !important; }
.dc-nav { border-bottom: ${BL_NAV_BORDER} !important; background: rgba(238,239,211,1) !important; }
footer { color: rgba(0,55,56,0.55) !important; }
@media (max-width: 720px) {
  .bl-featured, .bl-grid, .bl-related { grid-template-columns: 1fr !important; }
  .bl-featured-art { min-height: 170px !important; }
}
@media (prefers-reduced-motion: reduce) {
  .bl-card { transition: none; }
  .bl-card:hover { transform: none; }
}
`;

export type ArticleBlock = {
  p?: string;
  h?: string;
  quote?: string;
  list?: string[];
};

export type ArticleSource = {
  label: string;
  href: string;
  note: string;
};

export type EditorialPost = {
  slug: string;
  date: string;
  tag: string;
  title: string;
  summary: string;
  body: ArticleBlock[];
  sources: ArticleSource[];
  glyph: string;
  glyphColor: string;
  bg: string;
  author: string;
  featured: boolean;
  reviewStatus: string;
};

const CFPB_BUSINESS_PURPOSE: ArticleSource = {
  label: "CFPB Regulation Z official interpretation, business-purpose credit",
  href: "https://www.consumerfinance.gov/rules-policy/regulations/1026/2023-01-01/interp-3/",
  note: "Scope note: this source explains Regulation Z's business-purpose exemption, including treatment of non-owner-occupied rental property. It does not establish a lender's DSCR program, pricing, approval standard, or state-law treatment.",
};

const FANNIE_1007: ArticleSource = {
  label: "Fannie Mae Form 1007, Single-Family Comparable Rent Schedule",
  href: "https://singlefamily.fanniemae.com/media/document/pdf/form-1007",
  note: "Scope note: Form 1007 is a Fannie Mae conventional appraisal form used to estimate market rent. A DSCR provider may use different rent evidence or calculations, so the form is not a universal DSCR underwriting rule.",
};

const GENERAL_METHOD: ArticleBlock[] = [
  { h: "How to use this guide" },
  { p: "Use this article to identify inputs, assumptions, and questions for a financing professional. Program terms vary by provider and can change. A calculator result is a preliminary scenario, not an approval, commitment, rate lock, legal conclusion, or tax conclusion." },
  { h: "What to verify" },
  { list: [
    "The provider's current definition of qualifying rent and monthly debt obligation.",
    "Credit, leverage, reserves, property, entity, and documentation requirements for the specific program.",
    "The interest rate, points, fees, prepayment structure, effective date, and lock assumptions used in any quote.",
    "State-law, tax, insurance, occupancy, and licensing questions with the appropriate qualified professional.",
  ] },
];

const HOLD_FOR_REVIEW = (topic: string): ArticleBlock[] => [
  { p: `This ${topic} article has been narrowed while its primary authorities and professional review are being verified. It does not state a current legal or tax conclusion.` },
  { h: "What is safe to do now" },
  { list: [
    "Identify the transaction date, jurisdiction, borrower structure, property use, and facts that could change the answer.",
    "Open the current primary authority rather than relying on a marketing summary or an undated threshold.",
    "Ask a qualified legal or tax professional to apply the authority to the specific transaction.",
    "Record the authority, effective date, reviewer, and correction history before publishing a conclusion.",
  ] },
  { quote: "When the governing source or review record is missing, the honest answer is pending verification." },
];

export const POSTS: EditorialPost[] = [
  {
    slug: "greenstreet-go-launch",
    date: "June 25, 2026",
    tag: "Product",
    title: "How InvestGO supports preliminary DSCR scenario analysis",
    summary: "A role-neutral overview of how one set of deal inputs can support coverage, stress, and program-assumption comparisons without representing an approval.",
    body: [
      { p: "InvestGO is presented as a scenario-analysis workspace for rental-property financing questions. It can organize user-entered assumptions and calculation outputs, but those outputs should be treated as educational estimates until a qualified provider reviews the complete file." },
      { h: "What the workflow can organize" },
      { list: [
        "Rental-income and payment assumptions used in a DSCR calculation.",
        "Alternative financing structures and stress scenarios supplied by the user.",
        "Questions about borrower profile, property type, reserves, and state limitations.",
        "A traceable list of inputs to discuss with a financing professional.",
      ] },
      { h: "What it does not establish" },
      { p: "A scenario does not establish eligibility, available programs, final pricing, enforceability of a loan term, or a commitment to lend. Those decisions depend on the provider, complete documentation, current rules, and underwriting." },
    ],
    sources: [CFPB_BUSINESS_PURPOSE],
    glyph: "GO",
    glyphColor: dc.lemon,
    bg: dc.dark,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Editorial scope reviewed; product claims require business verification",
  },
  {
    slug: "what-is-dscr-how-it-works",
    date: "June 25, 2026",
    tag: "Lending",
    title: "What is DSCR? How rental-income coverage is calculated",
    summary: "DSCR compares a defined amount of qualifying rental income with a defined monthly debt obligation. The exact inputs and minimum ratio vary by provider and program.",
    body: [
      { p: "Debt service coverage ratio, or DSCR, is a coverage calculation used in some business-purpose rental-property financing. A common expression is qualifying monthly rent divided by the monthly debt obligation defined by the provider." },
      { h: "Illustrative arithmetic" },
      { p: "Illustrative example only: if qualifying rent is $2,500 and the defined monthly obligation is $2,000, the calculation is $2,500 divided by $2,000, or 1.25. This example demonstrates arithmetic, not a qualifying threshold or available program." },
      { h: "Why definitions matter" },
      { p: "Providers may differ in how they treat lease rent, market rent, short-term-rental history, taxes, insurance, association dues, interest-only periods, and other costs. Ask which numerator and denominator apply before comparing results." },
      { h: "DSCR is not the same as cash flow" },
      { p: "A coverage calculation may omit vacancy, maintenance, management, capital expenditures, and other operating costs. Evaluate those costs separately before making an investment decision." },
    ],
    sources: [FANNIE_1007, CFPB_BUSINESS_PURPOSE],
    glyph: "DSCR",
    glyphColor: dc.lemon,
    bg: dc.dark,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Editorially reviewed for scope; provider-specific thresholds intentionally omitted",
  },
  {
    slug: "dscr-pitia-breakdown-qualifying-income",
    date: "June 25, 2026",
    tag: "Lending",
    title: "PITIA explained: inputs used in a DSCR scenario",
    summary: "A practical checklist for modeling principal, interest, taxes, insurance, and association dues with visible, property-specific assumptions.",
    body: [
      { p: "PITIA commonly refers to principal, interest, property taxes, insurance, and association dues. A DSCR scenario is only as useful as these inputs, and a provider may define the required monthly obligation differently." },
      { h: "Use property-specific inputs" },
      { list: [
        "Use the proposed loan amount, note structure, and an explicitly labeled interest-rate assumption.",
        "Verify current and post-transfer tax treatment with the relevant taxing authority.",
        "Obtain an actual insurance quote and identify flood, wind, and other required coverage separately.",
        "Use current association dues and ask whether assessments or other housing expenses are included.",
      ] },
      { h: "Keep estimates distinct from quotes" },
      { p: "Any rate, tax, insurance, or payment entered before documentation is an illustrative assumption. Label the source and date of each input so it can be replaced when verified information becomes available." },
    ],
    sources: [FANNIE_1007],
    glyph: "PITI",
    glyphColor: dc.dark,
    bg: dc.lemon,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Editorially reviewed for scope; figures are user-supplied assumptions",
  },
  {
    slug: "dscr-ltv-down-payment-fico",
    date: "June 24, 2026",
    tag: "Lending",
    title: "How LTV, credit, and loan structure can affect a DSCR scenario",
    summary: "A non-pricing framework for testing how leverage, credit profile, loan structure, and prepayment terms can change a financing scenario.",
    body: GENERAL_METHOD,
    sources: [CFPB_BUSINESS_PURPOSE],
    glyph: "LTV",
    glyphColor: dc.rain,
    bg: dc.mintBg,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Pricing and program thresholds removed pending a dated source of truth",
  },
  {
    slug: "dscr-refinance-rate-term-cashout-seasoning",
    date: "June 23, 2026",
    tag: "Lending",
    title: "DSCR refinance planning: rate-term and cash-out questions",
    summary: "A preliminary planning framework for refinance purpose, proceeds, payment change, costs, prepayment terms, and provider-specific seasoning rules.",
    body: [
      { p: "Rate-term and cash-out refinances can be evaluated differently by financing providers. Do not assume a universal leverage limit, seasoning period, reserve rule, or closing-cost range." },
      { h: "Build a comparison with verified inputs" },
      { list: [
        "Current payoff, proposed proceeds, property value source, and proposed loan structure.",
        "Itemized closing costs and any prepayment amount taken directly from the existing note or payoff statement.",
        "Current and proposed monthly obligations using the same cost categories.",
        "The provider's current rules for transaction purpose, ownership history, valuation, and cash back.",
      ] },
      { h: "Illustrative break-even method" },
      { p: "Illustrative method only: divide verified transaction costs by an estimated monthly payment reduction to estimate a simple break-even period. This does not account for taxes, opportunity cost, future rates, property performance, or another refinance." },
    ],
    sources: [CFPB_BUSINESS_PURPOSE],
    glyph: "REFI",
    glyphColor: dc.lemon,
    bg: dc.dark,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Universal seasoning, leverage, and pricing claims removed",
  },
  {
    slug: "dscr-approval-issues-sub-10-fico-reserves",
    date: "June 23, 2026",
    tag: "Underwriting",
    title: "Common DSCR scenario issues to review before an application",
    summary: "A checklist of coverage, credit, liquidity, entity, property, rent-evidence, and state-rule questions to review without predicting approval.",
    body: GENERAL_METHOD,
    sources: [FANNIE_1007, CFPB_BUSINESS_PURPOSE],
    glyph: "CHECK",
    glyphColor: dc.emerald,
    bg: dc.teal,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Approval predictions and unsupported thresholds removed",
  },
  {
    slug: "dscr-non-us-investors-itin",
    date: "June 22, 2026",
    tag: "Lending",
    title: "DSCR planning for non-U.S. investors and ITIN borrowers",
    summary: "A scoped checklist for identity, credit references, entity structure, funds sourcing, reserves, property documents, and cross-border professional advice.",
    body: [
      { p: "Eligibility for a non-U.S. investor or ITIN borrower varies by provider, country of residence, identity documents, credit evidence, entity structure, funds sourcing, reserves, property, and transaction purpose. Property income does not eliminate borrower or transaction documentation." },
      { h: "Questions to resolve early" },
      { list: [
        "Which identity and credit-reference documents the specific provider accepts.",
        "How funds, reserves, ownership, guarantees, and entity documents must be verified.",
        "Whether remote signing, banking, currency transfer, and local counsel are needed.",
        "Which U.S. and home-country tax questions require qualified cross-border advice.",
      ] },
      { p: "A scenario result is not evidence that a program is available to a particular borrower or jurisdiction." },
    ],
    sources: [CFPB_BUSINESS_PURPOSE],
    glyph: "INTL",
    glyphColor: dc.lemon,
    bg: dc.dark,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Country, program, tax, and documentation claims require provider review",
  },
  {
    slug: "obbba-2025-real-estate-tax-changes",
    date: "June 23, 2026",
    tag: "Tax",
    title: "Real estate tax changes: an editorial verification checklist",
    summary: "Tax figures and conclusions are withheld until current primary authority and qualified tax review are attached to the article.",
    body: HOLD_FOR_REVIEW("tax"),
    sources: [],
    glyph: "TAX",
    glyphColor: dc.dark,
    bg: dc.lemon,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Held for primary-source and qualified tax review",
  },
  {
    slug: "mn-hf3437-business-purpose",
    date: "June 22, 2026",
    tag: "Compliance",
    title: "Minnesota business-purpose loan rules: verify before relying",
    summary: "The prior legal conclusion has been removed pending direct statutory authority, effective-date confirmation, and qualified legal review.",
    body: HOLD_FOR_REVIEW("state-law"),
    sources: [CFPB_BUSINESS_PURPOSE],
    glyph: "LAW",
    glyphColor: dc.lemon,
    bg: dc.dark,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Held for direct state authority and qualified legal review",
  },
  {
    slug: "qoz-qrof-permanent-obbba",
    date: "June 21, 2026",
    tag: "Tax",
    title: "Opportunity Zone changes: questions for a tax professional",
    summary: "A verification checklist that avoids publishing tax percentages, dates, or planning conclusions without current primary authority and review.",
    body: HOLD_FOR_REVIEW("tax"),
    sources: [],
    glyph: "QOZ",
    glyphColor: dc.rain,
    bg: dc.mintBg,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Held for primary-source and qualified tax review",
  },
  {
    slug: "section-1071-final-rule-dscr",
    date: "June 19, 2026",
    tag: "Compliance",
    title: "Section 1071 and DSCR lending: verify coverage and timing",
    summary: "The previous compliance thresholds and dates have been removed until the applicable CFPB authority and qualified compliance review are attached.",
    body: HOLD_FOR_REVIEW("compliance"),
    sources: [],
    glyph: "1071",
    glyphColor: dc.dark,
    bg: dc.lemon,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Held for applicable CFPB authority and compliance review",
  },
  {
    slug: "june-2026-rate-sheet",
    date: "June 18, 2026",
    tag: "Rates",
    title: "How to compare DSCR rate scenarios without headline pricing",
    summary: "A framework for comparing dated, assumption-controlled scenarios without presenting an unverified rate sheet or promising available pricing.",
    body: [
      { p: "The prior rate claims have been removed because no approved, dated rate source with complete assumptions was attached. A rate comparison should identify the observation date, provider or sample, FICO, LTV, DSCR, loan size, property type, points, fees, term, lock period, and prepayment structure." },
      { h: "Separate three different things" },
      { list: [
        "An illustrative calculator assumption used only to model a payment.",
        "An observed program scenario with a documented source and effective date.",
        "A personalized quote or rate lock issued after the required review.",
      ] },
      { p: "Until that source exists, use the calculator to test sensitivity rather than to infer an available rate." },
    ],
    sources: [],
    glyph: "RATE",
    glyphColor: dc.lemon,
    bg: dc.dark,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Unverified rate sheet removed; dated pricing source required",
  },
  {
    slug: "fema-rr2-coastal-dscr",
    date: "June 17, 2026",
    tag: "Underwriting",
    title: "Flood insurance and DSCR scenarios: what to verify",
    summary: "A property-specific checklist for flood determination, current insurance quotes, coverage assumptions, and payment sensitivity without unsupported market statistics.",
    body: [
      { p: "Flood and other property insurance can materially change the monthly obligation used in a DSCR scenario. Do not use a broad market average as a substitute for a current property-specific determination and quote." },
      { h: "Before relying on the scenario" },
      { list: [
        "Confirm the current flood determination and map information for the property.",
        "Obtain current coverage and premium quotes from qualified insurance sources.",
        "Identify which premiums, escrows, deductibles, and coverage requirements the provider includes.",
        "Replace every placeholder in the calculator and rerun the stress scenario.",
      ] },
    ],
    sources: [],
    glyph: "FLOOD",
    glyphColor: dc.emerald,
    bg: dc.teal,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Unsupported insurance statistics removed",
  },
  {
    slug: "why-no-llm-number-path",
    date: "May 12, 2026",
    tag: "Product",
    title: "Why scenario calculations should be deterministic and traceable",
    summary: "A product-method principle: financing calculations should expose inputs, formulas, assumptions, and limitations instead of relying on generated prose for authoritative numbers.",
    body: [
      { p: "A financing scenario should return the same result when the same inputs and formula are used. Generated explanations can help a reader understand an output, but they should not silently create rates, rules, thresholds, or underwriting conclusions." },
      { h: "A trustworthy number path should show" },
      { list: [
        "Every user-entered or sourced input and the date or assumption attached to it.",
        "The formula and intermediate values used to produce the output.",
        "Which constraints were tested and which were not.",
        "A clear distinction between arithmetic, program assumptions, and provider decisions.",
      ] },
      { quote: "Use generated language to explain a scenario, not to invent the scenario's authoritative inputs." },
    ],
    sources: [],
    glyph: "DET",
    glyphColor: dc.lemon,
    bg: dc.dark,
    author: EDITORIAL_BYLINE,
    featured: true,
    reviewStatus: "Editorially reviewed as a methodology principle",
  },
  {
    slug: "dscr-str-airbnb-qualifying-income",
    date: "June 25, 2026",
    tag: "STR",
    title: "STR income in DSCR scenarios: rent evidence and provider variation",
    summary: "A source-conscious framework for comparing lease rent, market rent, and documented short-term-rental history without claiming a universal haircut or hierarchy.",
    body: [
      { p: "Short-term-rental income treatment varies by provider and program. A projection, platform statement, lease, or appraisal rent schedule may serve different purposes; none should be assumed to control without the specific provider's current guidance." },
      { h: "Build an evidence table" },
      { list: [
        "List each rent source, coverage period, property match, gross or net basis, and document date.",
        "Ask which source the provider accepts and whether a documented adjustment applies.",
        "Confirm local short-term-rental permissions separately from financing eligibility.",
        "Stress-test the property using a conservative rent assumption and full operating costs.",
      ] },
    ],
    sources: [FANNIE_1007, CFPB_BUSINESS_PURPOSE],
    glyph: "STR",
    glyphColor: dc.dark,
    bg: dc.lemon,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Universal STR haircuts and program claims removed",
  },
  {
    slug: "dscr-loan-document-checklist",
    date: "June 25, 2026",
    tag: "Process",
    title: "DSCR loan document checklist: what may be requested",
    summary: "A non-exhaustive checklist for property, rent, entity, credit, asset, insurance, appraisal, and transaction documents that may be requested.",
    body: [
      { p: "DSCR programs may focus on property rental income rather than qualifying primarily on employment income, but documentation is still required. The exact list depends on the provider, borrower, entity, property, and transaction." },
      { h: "Document categories to ask about" },
      { list: [
        "Identity, credit authorization or credit evidence, entity, and ownership documents.",
        "Funds-to-close, reserves, bank statements, and source-of-funds records.",
        "Purchase, payoff, title, appraisal, rent, lease, insurance, and association documents.",
        "Property-use, business-purpose, short-term-rental, and jurisdiction-specific records.",
      ] },
      { p: "Request a current, provider-specific checklist before relying on this overview." },
    ],
    sources: [FANNIE_1007, CFPB_BUSINESS_PURPOSE],
    glyph: "DOCS",
    glyphColor: dc.rain,
    bg: dc.mintBg,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Absolute no-documentation claims removed",
  },
  {
    slug: "dscr-loan-process-after-prequalify",
    date: "June 24, 2026",
    tag: "Process",
    title: "What may happen after a preliminary DSCR scenario",
    summary: "A role-neutral process map from initial scenario through provider review, disclosures, appraisal, underwriting, conditions, and a possible closing decision.",
    body: [
      { p: "A preliminary scenario is not a preapproval, approval, commitment, or rate lock. A financing provider determines its own process, required disclosures, documentation, appraisal, underwriting conditions, timing, and final decision." },
      { h: "A possible sequence" },
      { list: [
        "Review the scenario inputs and identify missing or placeholder information.",
        "Request current provider terms and disclosures for the specific transaction.",
        "Submit required borrower, entity, property, asset, insurance, and appraisal documents.",
        "Respond to underwriting conditions and review final documents with the appropriate advisers.",
      ] },
      { p: "Timing varies. Do not plan a closing around an unsupported same-day or fixed-duration claim." },
    ],
    sources: [CFPB_BUSINESS_PURPOSE, FANNIE_1007],
    glyph: "FLOW",
    glyphColor: dc.lemon,
    bg: dc.dark,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Approval and timing promises removed",
  },
  {
    slug: "how-to-improve-dscr-before-applying",
    date: "June 24, 2026",
    tag: "Lending",
    title: "Ways to test a DSCR scenario before applying",
    summary: "A sensitivity-testing framework for rent, loan amount, rate assumption, amortization, taxes, insurance, and association dues without promising eligibility.",
    body: [
      { p: "If a preliminary DSCR result is weak, change one assumption at a time and record the effect. This shows which input drives the arithmetic; it does not prove that a provider offers or will approve the revised structure." },
      { h: "Run controlled comparisons" },
      { list: [
        "Replace estimated rent with the rent evidence the provider says it will consider.",
        "Test a lower loan amount while preserving enough verified liquidity for the transaction and reserves.",
        "Use an explicitly dated rate assumption and test adverse rate scenarios.",
        "Replace estimated taxes, insurance, and association dues with property-specific figures.",
      ] },
      { quote: "Sensitivity analysis explains the math. Only a qualified provider can determine whether a structure is available and approvable." },
    ],
    sources: [FANNIE_1007],
    glyph: "TEST",
    glyphColor: dc.lemon,
    bg: dc.dark,
    author: EDITORIAL_BYLINE,
    featured: false,
    reviewStatus: "Unsupported pricing and program levers removed",
  },
];

const GRID_POSTS = POSTS.filter((post) => !post.featured);
const FEATURED_POST = POSTS.find((post) => post.featured) ?? POSTS[0];
const ALL_TAGS = ["All", ...Array.from(new Set(POSTS.map((post) => post.tag)))];

function navigateToPost(slug: string) {
  window.history.pushState({}, "", `/blog/${slug}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.h) {
          return <h2 key={index} style={{ color: dc.dark, fontSize: "clamp(20px,2vw,26px)", fontWeight: 600, margin: "36px 0 14px", lineHeight: 1.15 }}>{block.h}</h2>;
        }
        if (block.quote) {
          return <blockquote key={index} style={{ borderLeft: `3px solid ${dc.lemon}`, padding: "14px 24px", margin: "32px 0", color: dc.dark, fontSize: "clamp(18px,1.6vw,22px)", lineHeight: 1.4, fontWeight: 600 }}>{block.quote}</blockquote>;
        }
        if (block.list) {
          return (
            <ul key={index} style={{ margin: "0 0 22px", paddingLeft: 24 }}>
              {block.list.map((item, itemIndex) => <li key={itemIndex} style={{ color: "rgba(0,55,56,0.75)", fontSize: "clamp(15px,1.25vw,17px)", lineHeight: 1.65, marginBottom: 10 }}>{item}</li>)}
            </ul>
          );
        }
        return <p key={index} style={{ color: "rgba(0,55,56,0.75)", fontSize: "clamp(16px,1.35vw,18px)", lineHeight: 1.75, marginBottom: 20, fontWeight: 500 }}>{block.p}</p>;
      })}
    </>
  );
}

function EditorialPanel({ post, onNavigate }: { post: EditorialPost; onNavigate: (view: string) => void }) {
  const links = [
    { href: "/dscr-calculator", label: "Model a preliminary DSCR scenario", view: "dscr-calculator" },
    { href: "/faq", label: "Review DSCR requirements and limitations", view: "faq" },
    { href: "/state-laws", label: "Review state-rule limitations", view: "state-laws" },
    { href: "/how-it-works", label: "See how scenario analysis works", view: "how-it-works" },
  ];

  return (
    <>
      <aside style={{ marginTop: 40, padding: 24, border: `1px solid ${dc.faded}`, borderRadius: 10, background: dc.mintBg }}>
        <h2 style={{ color: dc.rain, fontSize: 13, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", margin: 0 }}>Editorial record</h2>
        <p style={{ color: dc.dark, fontWeight: 600, lineHeight: 1.55, margin: "10px 0 6px" }}>{post.author}</p>
        <p style={{ color: "rgba(0,55,56,0.68)", lineHeight: 1.55, margin: "0 0 6px" }}>Publication date: <time>{post.date}</time></p>
        <p style={{ color: "rgba(0,55,56,0.68)", lineHeight: 1.55, margin: "0 0 6px" }}>Last modified: not recorded</p>
        <p style={{ color: "rgba(0,55,56,0.68)", lineHeight: 1.55, margin: 0 }}>Review status: {post.reviewStatus}</p>
        <p style={{ color: "rgba(0,55,56,0.68)", lineHeight: 1.55, margin: "14px 0 0" }}>Method: figures are omitted or labeled illustrative unless a directly linked primary source supports the claim. <a className="bl-link" href="/support" onClick={(event) => { event.preventDefault(); onNavigate("support"); }} style={{ color: dc.rain, fontWeight: 700 }}>Review support and correction pathways</a>.</p>
      </aside>

      <section aria-labelledby="article-sources" style={{ marginTop: 36 }}>
        <h2 id="article-sources" style={{ color: dc.dark, fontSize: 24, marginBottom: 14 }}>Sources and scope</h2>
        {post.sources.length > 0 ? (
          post.sources.map((source) => (
            <div key={source.href} style={{ marginBottom: 18 }}>
              <a className="bl-link" href={source.href} target="_blank" rel="noopener noreferrer" style={{ color: dc.rain, fontWeight: 700 }}>{source.label}</a>
              <p style={{ color: "rgba(0,55,56,0.68)", lineHeight: 1.6, margin: "6px 0 0" }}>{source.note}</p>
            </div>
          ))
        ) : (
          <p style={{ color: "rgba(0,55,56,0.68)", lineHeight: 1.6 }}>Primary-source verification is pending. This article intentionally avoids a current rate, legal, tax, or program conclusion.</p>
        )}
      </section>

      <nav aria-label="Related tools and guidance" style={{ marginTop: 36, display: "grid", gap: 10 }}>
        {links.map((link) => (
          <a key={link.href} className="bl-link" href={link.href} onClick={(event) => { event.preventDefault(); onNavigate(link.view); }} style={{ color: dc.rain, fontWeight: 700, textDecoration: "none" }}>{link.label} -&gt;</a>
        ))}
      </nav>
    </>
  );
}

function PostDetail({ post, onNavigate }: { post: EditorialPost; onNavigate: (view: string) => void }) {
  usePageMetadata(`${post.title} | Greenstreet Finance`, post.summary, `/blog/${post.slug}`);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [post.slug]);

  const related = POSTS.filter((candidate) => candidate.slug !== post.slug).slice(0, 2);

  return (
    <DcShell onNavigate={onNavigate} navLinks={[{ label: "DSCR Calc", view: "dscr-calculator" }, { label: "FAQ", view: "faq" }, { label: "State Rules", view: "state-laws" }]} cta={{ label: "Model a scenario", view: "dscr-calculator" }}>
      <style>{BL_CSS}</style>
      <header style={{ background: dc.dark, color: dc.cream, padding: `clamp(56px,7vh,96px) ${dc.pad} clamp(48px,6vh,64px)` }}>
        <div id="gs-hero-content" style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: dc.lemon, marginBottom: 16 }}>{post.tag} | <time>{post.date}</time></div>
          <H1 id="article-title" style={{ margin: "0 0 20px", maxWidth: "24ch" }}>{post.title}</H1>
          <Lead style={{ color: "rgba(238,239,211,0.72)", maxWidth: "56ch", margin: 0 }}>{post.summary}</Lead>
          <a className="bl-link" href="/blog" onClick={(event) => { event.preventDefault(); onNavigate("blog"); }} style={{ display: "inline-block", color: dc.lemon, fontWeight: 700, marginTop: 24 }}>Browse all published guidance</a>
        </div>
      </header>
      <article aria-labelledby="article-title" style={{ background: dc.cream, padding: `clamp(48px,6vw,72px) ${dc.pad}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <ArticleBody blocks={post.body} />
          <EditorialPanel post={post} onNavigate={onNavigate} />
          <div style={{ marginTop: 52 }}>
            <h2 style={{ color: dc.dark, fontSize: 24 }}>Related guides</h2>
            <nav aria-label="Related published guides" className="dc-band-2 bl-related" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {related.map((item) => (
                <a key={item.slug} className="bl-card" href={`/blog/${item.slug}`} onClick={(event) => { event.preventDefault(); navigateToPost(item.slug); }} style={{ background: dc.mintBg, borderRadius: 8, border: `1px solid ${dc.faded}`, padding: 20, textDecoration: "none", color: dc.dark, fontWeight: 700, lineHeight: 1.35 }}>{item.title}</a>
              ))}
            </nav>
          </div>
        </div>
      </article>
    </DcShell>
  );
}

function BlogIndex({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [tag, setTag] = useState("All");

  usePageMetadata(
    "DSCR Guides for Rental Property Scenarios | Greenstreet Finance",
    "Browse Greenstreet Finance guidance on DSCR calculations, scenario inputs, documentation, provider variation, and topics pending source review.",
    "/blog",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filtered = tag === "All" ? GRID_POSTS : GRID_POSTS.filter((post) => post.tag === tag);

  return (
    <DcShell onNavigate={onNavigate} accent={BL_ACCENT} navLinks={[{ label: "DSCR Calc", view: "dscr-calculator" }, { label: "FAQ", view: "faq" }, { label: "State Rules", view: "state-laws" }]} cta={{ label: "Model a scenario", view: "dscr-calculator" }}>
      <style>{BL_CSS}</style>
      <section aria-labelledby="blog-title" style={{ background: dc.cream, padding: `clamp(56px,7vh,88px) ${dc.pad} clamp(32px,4vh,48px)` }}>
        <div id="gs-hero-content" style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: dc.rain, marginBottom: 18 }}>Greenstreet Finance Guidance</div>
          <H1 id="blog-title" style={{ margin: "0 0 16px", maxWidth: "20ch" }}>Source-conscious DSCR guidance.</H1>
          <Lead style={{ color: "rgba(0,55,56,0.64)", maxWidth: "58ch", margin: 0 }}>Plain-language education for preliminary rental-property financing scenarios. Provider terms vary, and no article is an approval, commitment, rate lock, legal opinion, or tax opinion.</Lead>
          <p style={{ color: "rgba(0,55,56,0.64)", maxWidth: 760, lineHeight: 1.65, marginTop: 20 }}>Each article shows its publication label, review status, source scope, and correction pathway. Named individual bylines have been removed pending identity and credential verification.</p>
        </div>
      </section>

      <section aria-label="Featured published guidance" style={{ background: dc.cream, padding: `0 ${dc.pad} clamp(40px,5vw,64px)` }}>
        <a className="bl-card bl-featured dc-hero" href={`/blog/${FEATURED_POST.slug}`} onClick={(event) => { event.preventDefault(); navigateToPost(FEATURED_POST.slug); }} style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", maxWidth: dc.maxW, margin: "0 auto", background: dc.dark, borderRadius: 12, overflow: "hidden", textDecoration: "none" }}>
          <div style={{ padding: "clamp(36px,4vw,60px)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: dc.lemon, marginBottom: 16 }}>Featured | <time>{FEATURED_POST.date}</time></div>
            <h2 style={{ fontSize: "clamp(24px,2.8vw,38px)", fontWeight: 600, color: dc.cream, margin: "0 0 16px", lineHeight: 1.08 }}>{FEATURED_POST.title}</h2>
            <p style={{ fontSize: 16, lineHeight: 1.55, color: "rgba(238,239,211,0.7)", margin: "0 0 24px" }}>{FEATURED_POST.summary}</p>
            <span style={{ color: dc.emerald, fontWeight: 700 }}>{EDITORIAL_BYLINE}</span>
          </div>
          <div className="bl-featured-art" aria-hidden="true" style={{ background: dc.teal, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}><Mono style={{ fontSize: "clamp(40px,5vw,72px)", fontWeight: 700, color: dc.lemon }}>DET</Mono></div>
        </a>
      </section>

      <section aria-label="Filter published guidance" style={{ background: dc.cream, padding: `0 ${dc.pad} 20px` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ALL_TAGS.map((item) => <button key={item} type="button" className="bl-filter" aria-pressed={tag === item} aria-controls="published-guidance-list" onClick={() => setTag(item)} style={{ padding: "8px 16px", borderRadius: 999, border: `1.5px solid ${tag === item ? dc.rain : dc.faded}`, background: tag === item ? dc.mintBg : "transparent", color: tag === item ? dc.rain : dc.dark, cursor: "pointer", fontWeight: 600, minHeight: 40 }}>{item}</button>)}
        </div>
      </section>

      <section aria-labelledby="published-guidance-title" style={{ background: dc.cream, padding: `0 ${dc.pad} clamp(72px,10vh,120px)` }}>
        <div style={{ maxWidth: dc.maxW, margin: "0 auto" }}>
          <h2 id="published-guidance-title" style={{ color: dc.dark, fontSize: "clamp(24px,3vw,36px)", margin: "0 0 24px" }}>{tag === "All" ? "Published guidance" : `${tag} guidance`}</h2>
        <div id="published-guidance-list" className="dc-band-3 bl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {filtered.map((post) => (
            <a key={post.slug} className="bl-card" href={`/blog/${post.slug}`} onClick={(event) => { event.preventDefault(); navigateToPost(post.slug); }} style={{ background: dc.mintBg, borderRadius: 12, overflow: "hidden", border: `1px solid ${dc.faded}`, textDecoration: "none", display: "flex", flexDirection: "column" }}>
              <div style={{ aspectRatio: "16/7", minHeight: 120, background: post.bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Mono style={{ fontSize: "clamp(24px,3vw,40px)", fontWeight: 700, color: post.glyphColor }}>{post.glyph}</Mono></div>
              <div style={{ padding: "clamp(20px,2.4vw,28px)", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ color: dc.rain, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>{post.tag} | <time>{post.date}</time></div>
                <h3 style={{ fontSize: "clamp(16px,1.5vw,20px)", fontWeight: 700, lineHeight: 1.25, color: dc.dark, margin: "0 0 10px" }}>{post.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: "rgba(0,55,56,0.62)", margin: "0 0 18px", flex: 1 }}>{post.summary}</p>
                <span style={{ fontSize: 13, fontWeight: 700, color: dc.rain }}>{EDITORIAL_BYLINE} -&gt;</span>
              </div>
            </a>
          ))}
        </div>
        </div>
      </section>
    </DcShell>
  );
}

export default function BlogPage({ onNavigate, path }: { onBack?: () => void; onNavigate: (view: any) => void; path?: string }) {
  const resolvedPath = path ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const slug = resolvedPath.startsWith("/blog/") ? resolvedPath.replace("/blog/", "").replace(/\/$/, "") : null;
  const post = slug ? POSTS.find((candidate) => candidate.slug === slug) ?? null : null;

  if (slug && !post) return <NotFoundPage />;
  return post ? <PostDetail post={post} onNavigate={onNavigate} /> : <BlogIndex onNavigate={onNavigate} />;
}
