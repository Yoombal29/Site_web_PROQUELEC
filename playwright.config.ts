import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration.
 *
 * Auth flow:
 *   1. "setup" project runs auth.setup.ts → logs in via API → saves token
 *      to localStorage → stores state in .auth/admin.json
 *   2. "chromium" project depends on "setup" and loads the saved auth state
 *      so every test starts as an authenticated admin.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,          // Run serially to avoid race conditions on the DB
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,                    // One worker — DB state must be deterministic
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,               // 30s per test
  use: {
    baseURL: 'http://localhost:5175',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    // ── Auth setup (runs first, produces .auth/admin.json) ────────────────
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // ── Main tests (depend on auth setup) ────────────────────────────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Load the saved auth state (token in localStorage)
        storageState: '.auth/admin.json',
      },
      dependencies: ['setup'],
    },
  ],
});
