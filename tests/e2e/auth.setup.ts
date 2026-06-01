/**
 * auth.setup.ts
 * Playwright global setup: authenticates via API and saves state.
 * Runs once before all tests. Saves auth state to .auth/admin.json.
 */

import { test as setup } from '@playwright/test';
import * as fs from 'fs';

const AUTH_FILE = '.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  // Call the login API directly
  const response = await page.request.post('http://localhost:5175/api/auth/login', {
    data: {
      email: process.env.TEST_ADMIN_EMAIL ?? 'admin@proquelec.fr',
      password: process.env.TEST_ADMIN_PASSWORD ?? 'Admin123!'
    }
  });

  if (!response.ok()) {
    console.warn('[auth.setup] Login failed:', response.status(), await response.text());
    fs.mkdirSync('.auth', { recursive: true });
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }));
    return;
  }

  const data = await response.json();
  const token: string = data.access_token;

  // Navigate to the app origin so we can set localStorage on the correct origin
  await page.goto('http://localhost:5175/');
  await page.waitForLoadState('domcontentloaded');

  // Inject token into localStorage
  await page.evaluate((t) => {
    localStorage.setItem('token', t);
  }, token);

  // Save auth state (cookies + localStorage origins)
  fs.mkdirSync('.auth', { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });

  console.log('[auth.setup] Auth state saved to', AUTH_FILE);
});
