import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import type { UserConfig } from 'vite';
import { injectSchemaPlugin } from './vite-plugins/inject-schema';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), injectSchemaPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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
