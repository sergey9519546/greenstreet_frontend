import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function readSource(path: string): string {
  return readFileSync(resolve(repositoryRoot, path), "utf8");
}

const qualifyModal = readSource("src/components/QualifyModal.tsx");
const dcShell = readSource("src/design/dc.tsx");
const siteShell = readSource("src/design/SiteShell.tsx");
const appShell = readSource("src/App.tsx");
const dscrCalculatorPage = readSource("src/pages/DSCRCalculatorPage.tsx");
const faqPage = readSource("src/pages/FAQPage.tsx");
const blogPostPage = readSource("src/pages/BlogPostPage.tsx");
const notFoundPage = readSource("src/pages/NotFoundPage.tsx");

// These checks preserve source-level semantic affordances only. They do not
// replace browser, keyboard, screen-reader, contrast, or visual validation.
describe("public accessibility semantics contract", () => {
  it("exposes QualifyModal's visual pill selections as pressed buttons", () => {
    expect(qualifyModal).toMatch(/function\s+PillBtn[\s\S]*?aria-pressed=\{active\}/);
  });

  it("announces existing QualifyModal validation messages without changing their copy", () => {
    expect(qualifyModal).toContain('<p role="alert" style={errorMsgStyle}>{error}</p>');
    expect(qualifyModal).toContain('<p id={idLoanError} role="alert" style={errorMsgStyle}>Loan amount can\'t equal or exceed the property value.</p>');
    expect(qualifyModal).toContain('<p id={idStateError} role="alert" style={errorMsgStyle}>Please select the property state.</p>');
    expect(qualifyModal).toContain('<p id={idNameError} role="alert" style={errorMsgStyle}>Please enter your full name.</p>');
    expect(qualifyModal).toContain('<p id={idEmailError} role="alert" style={errorMsgStyle}>Please enter a valid email address.</p>');
    expect(qualifyModal).toContain('<p id={idContactConsentError} role="alert" style={{ ...errorMsgStyle, marginTop: -4, marginBottom: 10 }}>Please agree to be contacted so the team can respond to this request.</p>');
  });

  it("associates each invalid native QualifyModal control with its existing error message", () => {
    expect(qualifyModal).toContain("const idLoanError = `${idLoan}-error`;");
    expect(qualifyModal).toContain("aria-describedby={attempted && data.loanAmount >= data.propertyValue && data.propertyValue > 0 ? idLoanError : undefined}");
    expect(qualifyModal).toContain("<p id={idLoanError} role=\"alert\" style={errorMsgStyle}>Loan amount can't equal or exceed the property value.</p>");

    expect(qualifyModal).toContain("const idStateError = `${idState}-error`;");
    expect(qualifyModal).toContain("aria-describedby={attempted && !data.state ? idStateError : undefined}");
    expect(qualifyModal).toContain('<p id={idStateError} role="alert" style={errorMsgStyle}>Please select the property state.</p>');

    expect(qualifyModal).toContain("const idNameError = `${idName}-error`;");
    expect(qualifyModal).toContain("aria-describedby={touched.name && !nameValid ? idNameError : undefined}");
    expect(qualifyModal).toContain('<p id={idNameError} role="alert" style={errorMsgStyle}>Please enter your full name.</p>');

    expect(qualifyModal).toContain("const idEmailError = `${idEmail}-error`;");
    expect(qualifyModal).toContain("aria-describedby={touched.email && !emailValid ? idEmailError : undefined}");
    expect(qualifyModal).toContain('<p id={idEmailError} role="alert" style={errorMsgStyle}>Please enter a valid email address.</p>');

    expect(qualifyModal).toContain("const idContactConsentError = `${uid}-contact-consent-error`;");
    expect(qualifyModal).toContain("aria-describedby={touched.submit && !data.contactConsent ? idContactConsentError : undefined}");
    expect(qualifyModal).toContain('<p id={idContactConsentError} role="alert" style={{ ...errorMsgStyle, marginTop: -4, marginBottom: 10 }}>Please agree to be contacted so the team can respond to this request.</p>');
  });

  it("gives shared DcShell pages a styled skip link to their main landmark", () => {
    expect(dcShell).toContain('<a className="gs-skip-link" href="#main-content">Skip to main content</a>');
    expect(dcShell).toContain('<main id="main-content" tabIndex={-1} className="dc-main">');
  });

  it("does not give multiple fragment footer links the same current-page state", () => {
    expect(siteShell).toContain('const current = (href: string) => href.includes("#") ? undefined');
  });

  it("exposes one button label and a labelled main landmark in the application error fallback", () => {
    expect(dcShell).toContain('<div className="btn_main_text" onClick={onClick} aria-hidden="true">{label}</div>');
    expect(dcShell).toContain('<svg aria-hidden="true" focusable="false"');
    expect(appShell).toContain('<main aria-labelledby="application-error-heading"');
    expect(appShell).toContain('<h2 id="application-error-heading"');
    expect(appShell).toContain('<div aria-hidden="true" style={{ fontSize: "48px", marginBottom: "16px" }}>⚠</div>');
  });

  it("exposes DSCR Calculator views as a labelled pressed-button group", () => {
    expect(dscrCalculatorPage).toContain('role="group" aria-label="DSCR calculator view"');
    expect(dscrCalculatorPage).toContain("onClick={() => setTab('dscr')} aria-pressed={tab === 'dscr'}");
    expect(dscrCalculatorPage).toContain("onClick={() => setTab('maxprice')} aria-pressed={tab === 'maxprice'}");
  });

  it("connects every FAQ question button to its expandable answer region", () => {
    expect(faqPage).toContain("const questionId = `faq-question-${i}`;");
    expect(faqPage).toContain("const panelId = `faq-answer-${i}`;");
    expect(faqPage).toContain("id={questionId}");
    expect(faqPage).toContain("aria-expanded={open === i}");
    expect(faqPage).toContain("aria-controls={panelId}");
    expect(faqPage).toContain("id={panelId}");
    expect(faqPage).toContain('role="region"');
    expect(faqPage).toContain("aria-labelledby={questionId}");
    expect(faqPage).toContain("aria-hidden={open !== i}");
    expect(faqPage).toContain("inert={open !== i}");
  });

  it("keeps article sharing controls as labelled new-window links", () => {
    expect(blogPostPage).toContain('target="_blank"');
    expect(blogPostPage).toContain('rel="noopener noreferrer"');
    expect(blogPostPage).toContain('aria-label={label === "in" ? "Share on LinkedIn" : "Share on X"}');
    expect(blogPostPage).toContain("aria-label={`Share on ${label}`}");
    expect(blogPostPage).not.toContain('role="button"');
    expect(blogPostPage).not.toContain("window.open");
  });

  it("avoids a nested main landmark on the not-found route", () => {
    expect(notFoundPage).toContain('<section aria-labelledby="not-found-heading"');
    expect(notFoundPage).toContain('id="not-found-heading"');
    expect(notFoundPage).not.toMatch(/<main(?:\s|>)/);
  });
});
