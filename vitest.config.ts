import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/tests/setup.ts',
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'server/**/*.{test,spec}.{js,cjs,mjs,ts}',
      'tests/performance/**/*.{test,spec}.{ts,tsx,js}',
    ],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
