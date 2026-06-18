import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['server/**/*.{test,spec}.{js,cjs,mjs,ts}'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
