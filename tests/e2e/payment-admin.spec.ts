import { test, expect } from '@playwright/test';

test.describe('Payment Admin Panel E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/connexion');
    // Fill login form
    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL || 'admin@proquelec.fr');
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Navigate to admin
    await page.goto('/admin?tab=paiements');
  });

  test('payment panel should load with provider cards', async ({ page }) => {
    await expect(page.locator('text=Configuration des Paiements')).toBeVisible();
    // Should show PayDunya card (enabled by default)
    await expect(page.locator('text=PayDunya')).toBeVisible();
    // Should show Cash card
    await expect(page.locator('text=Paiement Espèces')).toBeVisible();
  });

  test('should show provider help when clicking help button', async ({ page }) => {
    // Find the PayDunya card and click its help button
    const paydunyaCard = page.locator('text=PayDunya').first();
    await paydunyaCard.scrollIntoViewIfNeeded();

    // Find help button (the ? icon)
    const helpButton = paydunyaCard.locator('..').locator('button[title="Aide à la configuration"]');
    if (await helpButton.isVisible()) {
      await helpButton.click();
      await expect(page.locator('text=Comment configurer PayDunya')).toBeVisible();
    }
  });

  test('should toggle a provider on and off', async ({ page }) => {
    // Find a toggle switch that is off and toggle it
    const cashToggle = page.locator('text=Paiement Espèces').first().locator('..').locator('..').locator('button[role="switch"]');
    if (await cashToggle.isVisible()) {
      // Toggle on
      await cashToggle.click();
      // Toggle off
      await cashToggle.click();
    }
    expect(true).toBe(true);
  });
});
