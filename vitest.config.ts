import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Two projects, one command. `npm run test` (vitest run) executes BOTH.
//
//   node — the pure engine/unit suites (src/**/*.test.ts). Unchanged behavior:
//          no DOM, no setup file, so they stay fast and dependency-free.
//   dom  — component/page tests (src/**/*.test.tsx) under jsdom with
//          @testing-library + the shared browser-API stubs in src/test/setup.ts.
//
// `projects` (not the removed `environmentMatchGlobs`) is the supported way to
// split environments in Vitest 4.
const configDir = path.dirname(fileURLToPath(import.meta.url));
const alias = {
  '@': path.resolve(configDir, './src'),
};

// DOM tests must never reach the network. Aliasing the SDK entry points (rather
// than vi.mock-ing src/firebase.ts per file) makes that guarantee hold no matter
// which module in a rendered tree pulls Firebase in.
const firebaseStub = path.resolve(configDir, './src/test/firebaseStub.ts');
const domAlias = {
  ...alias,
  'firebase/app': firebaseStub,
  'firebase/auth': firebaseStub,
  'firebase/firestore': firebaseStub,
};

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'node',
          environment: 'node',
          globals: true,
          include: ['src/**/*.test.ts'],
        },
      },
      {
        // The React plugin gives .tsx files the automatic JSX runtime the app
        // itself is built with, so tests compile the components identically.
        plugins: [react()],
        resolve: { alias: domAlias },
        test: {
          name: 'dom',
          environment: 'jsdom',
          globals: true,
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./src/test/setup.ts'],
          // Component trees here are large (a full marketing shell per page);
          // a slightly higher ceiling keeps CI from flaking on cold transforms.
          testTimeout: 20_000,
          restoreMocks: true,
          unstubEnvs: true,
          unstubGlobals: true,
        },
      },
    ],
  },
});
