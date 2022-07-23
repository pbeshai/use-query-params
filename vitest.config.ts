import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './packages/use-query-params/src/__tests__/setupTests.ts',
    testTimeout: 5000,
    include: ['**/*[.-]{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
