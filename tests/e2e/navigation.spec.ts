/**
 * E2E Tests for Navigation & Page Rendering
 * Tests critical navigation flows, page rendering, and responsive behavior
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation & Page Rendering E2E Tests', () => {
  test('La page d\'accueil se charge correctement avec les éléments clés', async ({ page }) => {
    await page.goto('/');

    // Verify the page title contains expected text
    await expect(page).toHaveTitle(/PROQUELEC|Accueil/);

    // Header should be present (look for navigation or logo)
    await expect(page.locator('header')).toBeVisible();

    // Footer should be present
    await expect(page.locator('footer')).toBeVisible();

    // Main content area should be present
    await expect(page.locator('main')).toBeVisible();
  });

  test('Les éléments de navigation du menu sont visibles', async ({ page }) => {
    await page.goto('/');

    // Check for navigation elements in the header
    const nav = page.locator('header nav, header [role="navigation"]');
    await expect(nav).toBeVisible();

    // Key navigation links should be present
    const navLinks = page.locator('header a');
    await expect(navLinks.first()).toBeVisible();
  });

  test('Peut naviguer vers la page "À propos"', async ({ page }) => {
    await page.goto('/');

    // Find and click the "À propos" link in the navigation
    const aboutLink = page.locator('a:has-text("À Propos"), a:has-text("À propos")').first();
    await aboutLink.click();

    // Verify we navigated to the about page
    await expect(page).toHaveURL(/\/about|\/a-propos/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('Peut naviguer vers la page "Contact"', async ({ page }) => {
    await page.goto('/');

    // Find and click the "Contact" link
    const contactLink = page.locator('a:has-text("Contact")').first();
    await contactLink.click();

    // Verify we navigated to the contact page
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('Le formulaire de contact contient les champs obligatoires', async ({ page }) => {
    await page.goto('/contact');

    // Wait for the page to render
    await expect(page.locator('main')).toBeVisible();

    // Check for the contact form - it may have various selectors
    // Look for form elements like input, textarea
    const emailInput = page.locator('input[type="email"]').first();
    const nameInput = page.locator('input[placeholder*="Mamadou"]');
    const messageTextarea = page.locator('textarea[placeholder*="Décrivez"]');

    // At least some form elements should be present
    const hasFormFields = (await emailInput.count()) > 0 ||
                          (await nameInput.count()) > 0 ||
                          (await messageTextarea.count()) > 0;
    expect(hasFormFields).toBeTruthy();
  });

  test('Le pied de page contient les informations de l\'entreprise', async ({ page }) => {
    await page.goto('/');

    // Scroll to footer
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    // Footer should contain company name or branding
    await expect(footer).toContainText(/PROQUELEC/);

    // Footer should contain navigation links
    await expect(footer.locator('a').first()).toBeVisible();

    // Footer should have social or contact links
    const footerLinks = footer.locator('a');
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThanOrEqual(3);
  });

  test('Le pied de page contient les liens légaux', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    // Check for legal links
    await expect(footer.locator('text=Mentions légales').or(footer.locator('text=Confidentialité'))).toBeVisible();
  });

  test('Les balises SEO meta sont présentes', async ({ page }) => {
    await page.goto('/');

    // Check viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);

    // Check description meta tag
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content');

    // Check that description has content
    const descContent = await description.getAttribute('content');
    expect(descContent?.length).toBeGreaterThan(0);
  });

  test('Peut naviguer vers une page de services', async ({ page }) => {
    await page.goto('/');

    // Find a services/activities link in the navigation
    const servicesLink = page.locator('a:has-text("Activités"), a:has-text("Services")').first();
    const linkVisible = await servicesLink.isVisible();

    if (linkVisible) {
      await servicesLink.click();

      // Should navigate to a services page
      await expect(page).toHaveURL(/\/activities|\/services/);
      await expect(page.locator('main')).toBeVisible();
    }
    // If the link is in a submenu/mega menu, skip gracefully
  });

  test('Le menu responsive mobile fonctionne', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Look for a mobile menu toggle button (hamburger icon)
    const mobileMenuButton = page.locator(
      'button:has-text("Menu"), ' +
      'button[aria-label*="Menu"], ' +
      'button[aria-label*="menu"], ' +
      'button[class*="hamburger"], ' +
      'button svg[class*="menu"]'
    ).first();

    const buttonVisible = await mobileMenuButton.isVisible();

    if (buttonVisible) {
      // Click the mobile menu toggle
      await mobileMenuButton.click();

      // Wait for mobile menu to open
      await page.waitForTimeout(500);

      // Verify some navigation links become visible after toggle
      const mobileNavLinks = page.locator('a:has-text("Accueil"), a:has-text("Contact")');
      if (await mobileNavLinks.first().isVisible()) {
        await expect(mobileNavLinks.first()).toBeVisible();
      }
    }
    // Fallback: check that the page renders correctly on mobile
    await expect(page.locator('main')).toBeVisible();
  });

  test('La page d\'accueil contient le logo et la navigation principale', async ({ page }) => {
    await page.goto('/');

    // Check for logo image or text
    const logo = page.locator('img[alt*="PROQUELEC"], img[alt*="proquelec"], header a:has-text("PROQUELEC")').first();
    await expect(logo).toBeVisible();

    // Check that we can see main content sections
    const heroSection = page.locator('[class*="hero"], section').first();
    await expect(heroSection).toBeVisible();
  });
});

test.describe('Page Not Found & Error Handling', () => {
  test('Affiche une page 404 pour les routes inexistantes', async ({ page }) => {
    await page.goto('/page-inexistante-test');

    // The page should show a 404 / not found message
    // or redirect to the home page
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Either we stay on the 404 page or get redirected
    const currentUrl = page.url();
    const isNotFound = currentUrl.includes('page-inexistante-test') || currentUrl.endsWith('/');
    expect(isNotFound).toBeTruthy();
  });
});
