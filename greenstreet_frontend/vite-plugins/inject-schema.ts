import type { Plugin } from 'vite';

export function injectSchemaPlugin(): Plugin {
  return {
    name: 'inject-schema',
    transformIndexHtml(html) {
      const schemas = `
<!-- Organization Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": "Greenstreet Finance",
  "url": "https://greenstreet.com",
  "logo": "https://greenstreet.com/img/logo.png",
  "description": "DSCR loan calculator and non-QM mortgage platform for rental property investors. Compare specialized DSCR lender programs instantly.",
  "serviceType": ["DSCR Loan Calculator", "Non-QM Mortgage Brokerage", "Rental Property Financing Tools"]
}
</script>

<!-- DSCR Calculator Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DSCR Calculator",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Free DSCR (Debt Service Coverage Ratio) calculator for rental property loans. Calculate loan eligibility, compare specialized DSCR lender programs, and get instant pre-qualification.",
  "featureList": [
    "Instant DSCR ratio calculation",
    "Compare specialized DSCR lender programs",
    "Real-time loan program matching",
    "Pre-qualification in 60 seconds",
    "Multi-property portfolio analysis"
  ]
}
</script>

<!-- FAQ Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What DSCR do I need to qualify for a loan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most DSCR lenders require a minimum ratio of 1.0 to 1.25. A 1.0 DSCR means your rental income exactly covers the mortgage payment. Ratios above 1.25 qualify for better rates."
      }
    },
    {
      "@type": "Question",
      "name": "Do DSCR loans require personal income verification?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. DSCR loans qualify based on the property's rental income alone. You don't need W-2s, tax returns, or employment verification."
      }
    },
    {
      "@type": "Question",
      "name": "Can I get a DSCR loan with 1.0 ratio?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Several non-QM lenders offer 1.0 DSCR programs, meaning you can qualify even if rental income just breaks even with the mortgage payment."
      }
    }
  ]
}
</script>
`;

      return html.replace('</head>', `${schemas}\n</head>`);
    },
  };
}
