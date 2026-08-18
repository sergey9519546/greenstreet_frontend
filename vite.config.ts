import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import type { UserConfig } from 'vite';
import { replaceUnverifiedBookingEmbeds } from './src/marketing/bookingEmbed';
import { CLAIM_REPLACEMENTS } from './src/marketing/claimReplacements';
import { injectSchemaPlugin } from './vite-plugins/inject-schema';

const OPTIONAL_RELEASE_SCRIPT_MARKERS = [
  "cdn-cookieyes.com",
  "www.googletagmanager.com",
  "www.google-analytics.com",
  "cdn.vector.co",
  "static.claydar.com",
  "js.hs-scripts.com",
  "js-na2.hs-scripts.com",
  "hubspotv2.use1-marketplace-1p-apps-prod-red.if.webflow.services",
  "google_tags_first_party",
  "G-JERVW0S7X4",
  "GTM-WB2F5WH6",
] as const;

/**
 * Applies the homepage fabricated-claim replacements to index.html's static
 * #webflow-root markup at build time, so the shell and every prerendered twin
 * ship clean to non-JS crawlers. The same list drives the runtime homepage
 * (MarketingHome) and the FTC render-lock (scripts/check-ftc-contract.ts);
 * no-match pairs are no-ops, so this is safe to run on any document.
 */
export function applyClaimReplacements(html: string): string {
  return CLAIM_REPLACEMENTS.reduce(
    (result, [unsupported, replacement]) => result.replaceAll(unsupported, replacement),
    html,
  );
}

export function sanitizeReleaseHtml(html: string): string {
  return replaceUnverifiedBookingEmbeds(
    html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) =>
      OPTIONAL_RELEASE_SCRIPT_MARKERS.some((marker) => script.includes(marker))
        ? ""
        : script
    )
  );
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "release-html-sanitizer",
        enforce: "pre",
        transformIndexHtml(html) {
          return applyClaimReplacements(sanitizeReleaseHtml(html)
            // Optional analytics and de-anonymization are disabled until a
            // consent owner, retention policy, and verified production domain
            // are configured. The unverified legacy booking embed is replaced
            // by an owned /book-demo fallback before release.
            // A stale Webflow export contained an opaque path with no matching
            // asset. Leaving it in the document causes browsers to fetch the
            // SPA fallback as JavaScript and emit a production console error.
            .replace(
              /<script async="" src="\/wvxwa3jtwetcNjdkMGE4YTkxNTZiN2I3YmQ0NmZmZGZk\/nq6SdY9yd98sJXX5znRjqfSpD1o"><\/script>/,
              ""
            )
            // This static whitepaper form has no delivery backend. Replace the
            // native form element so it cannot leak entered PII through a GET
            // even when JavaScript is disabled or blocked.
            .replace(
              /<form\b(?=[^>]*\bid="wf-form-System-Action-Form")([^>]*)>([\s\S]*?)<\/form>/,
              (_form, rawAttributes: string, contents: string) => {
                const attributes = rawAttributes.replace(
                  /\s+(?:action|method|name|onsubmit)="[^"]*"/gi,
                  ""
                );
                return `<div role="form"${attributes}>${contents}</div>`;
              }
            )
            // This form has no submission endpoint. Keep it out of Webflow's
            // form bootstrapper, which otherwise emits a misleading runtime
            // error for a deliberately disabled form.
            .replace(
              /(<div class="soa-form-popup">[\s\S]*?<div class="form_main_wrap) w-form(">)/,
              "$1$2"
            )
            .replace(
              /(<div class="soa-form-popup">[\s\S]*?<div class="form_main_success_text u-text-style-large">)[^<]*(<\/div>)/,
              "$1This form is not accepting requests yet. No information was sent.$2"
            )
            .replace(
              /(<div class="soa-form-popup">[\s\S]*?<div class="form_main_error_text">)[^<]*(<\/div>)/,
              "$1This form is not accepting requests yet. No information was sent.$2"
            )
            // The legacy Webflow hero form redirects to an unverified external
            // CRM and shows a generic success message. Make it a booking-only
            // CTA until its delivery path is owned and verified. Removing the
            // `w-form` wrapper also keeps Webflow from trying to submit it.
            .replace(
              /<div class="hero_form_wrap w-form"([^>]*)>/,
              '<div class="hero_form_wrap"$1>'
            )
            .replace(
              /<form class="hero_form_layout"[^>]*\bid="email-form"[^>]*>/,
              '<form class="hero_form_layout" id="email-form" onsubmit="event.preventDefault();window.location.assign(\'/book-demo\');return false;">'
            )
            .replace(
              /<input\b(?=[^>]*\bid="email-2")[^>]*\/>/,
              '<p class="hero_form_field_input form_main_field_input">Book a demo to discuss your DSCR financing options.</p>'
            )
            .replace(
              /(<div class="hero_form_wrap"[\s\S]*?<div class="form_main_success_text u-text-style-h5">)[^<]*(<\/div>)/,
              "$1Book a demo to connect with our team.$2"
            )
            .replace(
              /(<div class="hero_form_wrap"[\s\S]*?<div class="form_main_error_text">)[^<]*(<\/div>)/,
              "$1This form does not submit information. Use Book a demo to continue.$2"
            )
            // Fabricated claims in the static Webflow export (rates, lender
            // stats, in-house funding, fake testimonials, placeholder phone)
            // are swapped by applyClaimReplacements below — the same list the
            // runtime homepage applies, so no-JS crawlers get the clean copy.
            // The markup already points at the correct image; only its stale
            // responsive source set references a file that was never shipped.
            .replaceAll(
              "/img/logos/cs-quintero-co.png",
              "/img/logos/case-03-hadley-capital-partners.png"
            )
            // The Webflow export includes a placeholder phone number. Route
            // that CTA to the real booking flow instead of publishing fiction.
            .replaceAll('href="tel:+15550100000"', 'href="/book-demo"')
            .replaceAll("+1 (555) 010-0000", "Book a demo")
            // The apex redirects to www; keep canonical and share metadata
            // aligned with the active production host.
            .replaceAll("https://greenstreet.com", "https://www.greenstreet.finance")
          );
        },
      },
      injectSchemaPlugin(),
    ],
    resolve: {
      alias: {
        // No `@/` imports exist anywhere in the repo today (verified via
        // `grep -rn "from ['\"]@/" .` outside node_modules) — this alias is
        // currently unused. Points at src/ (the conventional target) rather
        // than repo root so any future `@/foo` import resolves predictably
        // to src/foo instead of a root-level file.
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            const nid = id.replace(/\\/g, '/');
            if (nid.includes('/react/') || nid.includes('/react-dom/') || nid.includes('/scheduler/')) return 'react';
            if (nid.includes('/gsap/') || nid.includes('/@gsap/')) return 'gsap';
            // Firebase's bulk lives in the scoped @firebase/* packages, not the
            // thin `firebase` wrapper — match both (firebase-admin is server-only).
            if ((nid.includes('/firebase/') || nid.includes('/@firebase/')) && !nid.includes('/firebase-admin/')) return 'firebase';
            if (nid.includes('/@anthropic-ai/')) return 'anthropic';
            // Heavy deps split out of the catch-all so they cache independently
            // and only download with the routes that use them.
            if (nid.includes('/recharts/') || nid.includes('/d3-') || nid.includes('/victory-')) return 'charts';
            if (nid.includes('/lucide-react/')) return 'icons';
            if (nid.includes('/motion/') || nid.includes('/framer-motion/')) return 'motion';
            if (/\/(react-markdown|micromark|remark|rehype|mdast|hast|unist|unified|vfile|property-information|character-entities|decode-named-character-reference|space-separated-tokens|comma-separated-tokens|trim-lines|html-url-attributes|estree|ccount|markdown-table|longest-streak|zwitch|bail|trough|devlop|is-plain-obj)/.test(nid)) return 'markdown';
            return 'vendor';
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  };
});
