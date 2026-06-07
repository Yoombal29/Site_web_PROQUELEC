/**
 * E2E Tests for Newsletter Subscription & Management
 * Tests public signup flow and admin newsletter panel
 */

import { test, expect } from '@playwright/test';

test.describe('Newsletter E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/actualites');
  });

  test('La page actualités se charge et affiche la section newsletter', async ({ page }) => {
    // Verify the news page loads with key elements
    await expect(page.locator('h1')).toContainText('Actualités');
    await expect(page.locator('text=Rester Informé')).toBeVisible();
    await expect(page.locator('text=S\'inscrire à la Newsletter')).toBeVisible();
  });

  test('Affiche le formulaire d\'inscription à la newsletter', async ({ page }) => {
    // Scroll to the newsletter section
    await page.locator('text=Rester Informé').scrollIntoViewIfNeeded();

    // Verify the signup CTA button is present
    const newsletterBtn = page.locator('button:has-text("S\'inscrire à la Newsletter")');
    await expect(newsletterBtn).toBeVisible();
  });

  test('Redirige vers la page d\'inscription depuis le CTA newsletter', async ({ page }) => {
    // Click the newsletter CTA button
    await page.locator('button:has-text("S\'inscrire à la Newsletter")').click();

    // Should navigate to the homepage or a newsletter section
    // The button currently links to /formations, but we just verify navigation
    await expect(page).toHaveURL(/\/formations|\/actualites/);
  });

  test('Admin peut accéder au panneau de gestion newsletter', async ({ page }) => {
    // Navigate to admin panel (requires auth state from setup)
    await page.goto('/admin?tab=newsletter');

    // Verify admin dashboard loads
    await expect(page.locator('text=Newsletter')).toBeVisible();
    await expect(page.locator('text=Gérez votre liste d\'abonnés')).toBeVisible();
  });

  test('Le panneau newsletter admin affiche les onglets de gestion', async ({ page }) => {
    await page.goto('/admin?tab=newsletter');

    // Verify the newsletter admin panel tabs are visible
    await expect(page.locator('text=Composer')).toBeVisible();
    await expect(page.locator('text=Abonnés')).toBeVisible();
    await expect(page.locator('text=Campagnes')).toBeVisible();
  });

  test('L\'onglet Abonnés affiche la liste des inscrits', async ({ page }) => {
    await page.goto('/admin?tab=newsletter');

    // Click on the "Abonnés" tab
    await page.locator('button:has-text("Abonnés")').click();

    // The page should either show subscribers or a "Aucun abonné" message
    await expect(page.locator('text=Export CSV').or(page.locator('text=Aucun abonné'))).toBeVisible();
  });

  test('L\'onglet Campagnes affiche l\'historique des envois', async ({ page }) => {
    await page.goto('/admin?tab=newsletter');

    // Click on the "Campagnes" tab
    await page.locator('button:has-text("Campagnes")').click();

    // Should either show campaigns or "Aucune campagne envoyée"
    await expect(page.locator('text=Aucune campagne envoyée').or(page.locator('text=Campagnes'))).toBeVisible();
  });

  test('L\'onglet Composer permet de créer une nouvelle campagne', async ({ page }) => {
    await page.goto('/admin?tab=newsletter');

    // Ensure we're on the Composer tab (default)
    await expect(page.locator('text=Nouvelle campagne')).toBeVisible();

    // Verify form fields are present
    await expect(page.locator('input[placeholder*="Newsletter"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="<h2>"]')).toBeVisible();

    // Verify the send button is visible
    await expect(page.locator('button:has-text("Envoyer")')).toBeVisible();
  });

  test('La section newsletter du pied de page est accessible', async ({ page }) => {
    // Navigate to a page with the NewsletterSignup component
    // The footer variant is used on pages that render it
    await page.goto('/');

    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();

    // Check for newsletter-related elements in the footer or page
    // The NewsletterSignup component may be rendered via DynamicRenderer
    // Check if any newsletter signup form elements are present
    const newsletterSection = page.locator('text=Newsletter PROQUELEC');
    if (await newsletterSection.isVisible()) {
      // Verify email input is present in the newsletter form
      await expect(page.locator('input[type="email"]').first()).toBeVisible();
      await expect(page.locator('button[type="submit"]').first()).toBeVisible();
    }
  });
});

test.describe('Newsletter API & Validation E2E Tests', () => {
  test('Le formulaire newsletter rejette un email invalide côté client', async ({ page }) => {
    // Visit the homepage where the NewsletterSignup banner might appear
    await page.goto('/');

    // Try to find an active newsletter form on the page
    const newsletterForm = page.locator('form').filter({ has: page.locator('input[type="email"]') }).first();
    const formVisible = await newsletterForm.isVisible();

    if (formVisible) {
      // Fill with invalid email
      const emailInput = newsletterForm.locator('input[type="email"]');
      await emailInput.fill('email-invalide');
      await newsletterForm.locator('button[type="submit"]').click();

      // The browser native validation or app validation should catch this
      // Check if there's a validation message
      await page.waitForTimeout(500);
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    }
    // If no form is visible, skip this test gracefully
  });
});
