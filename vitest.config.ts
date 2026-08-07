import { defineConfig } from 'vitest/config';
import path from 'path';

// Keep test config lean: pure engine/unit tests run in node without DOM deps.
// App build still uses vite.config.ts (react + tailwind + schema plugin).
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    // Avoid setup that requires @testing-library / happy-dom for pure unit tests.
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
