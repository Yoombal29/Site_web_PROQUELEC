import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
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

  await page.route('**/api/settings', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ site_name: 'PROQUELEC' }),
    });
  });

  await page.route('**/api/analytics**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ userActivity: [], popularContent: [] }),
    });
  });
});

test('le centre de capacités CMS est accessible dans l’admin', async ({ page }) => {
  await page.goto('/admin?tab=cms-capabilities');

  await expect(page.getByText('Centre de capacités CMS')).toBeVisible();
  await expect(page.getByText('Exploiter gratuitement les outils utiles au CMS PROQUELEC')).toBeVisible();

  await page.getByRole('tab', { name: 'Automatisation' }).click();
  await expect(page.getByText('npm run cms:audit')).toBeVisible();
  await expect(page.getByText('npm run test:e2e:cms')).toBeVisible();
});

test('la page outils expose les outils gratuits et la recherche', async ({ page }) => {
  await page.goto('/outils');

  await expect(page.getByText(/Applications|Outils/i).first()).toBeVisible();
  await page.getByPlaceholder('Rechercher un outil...').fill('Diagnostic');
  await expect(page.getByText('Diagnostic Sécurité Maison')).toBeVisible();
});
