import fs from 'fs';
import { test as setup } from '@playwright/test';

const authFile = '.auth/admin.json';

setup('authenticate admin', async ({ page }) => {
  fs.mkdirSync('.auth', { recursive: true });

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'e2e-admin',
        email: 'admin@proquelec.sn',
        username: 'E2E Admin',
        role: 'admin',
        is_active: true,
      }),
    });
  });

  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', 'e2e-admin-token');
  });
  await page.context().storageState({ path: authFile });
});
