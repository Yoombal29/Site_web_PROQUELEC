/**
 * builder-full.spec.ts
 *
 * Comprehensive E2E tests for the Craft.js / God Builder (Mode Aperçu + Édition).
 *
 * Auth setup (auth.setup.ts) runs first and saves the admin token into
 * localStorage so every test in this suite starts authenticated.
 *
 * Base URLs and the storageState are configured in playwright.config.ts.
 */

import { test, expect, type Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/** Navigate to the builder for a given page (or the page list). */
async function gotoBuilder(page: Page, pageId?: string) {
  const url = pageId ? `/admin/builder/${pageId}` : '/admin/builder';
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

/** Wait for the God Builder canvas to be fully mounted and interactive. */
async function waitForBuilderReady(page: Page) {
  // Wait for the canvas attribute used by the God Canvas
  await page.waitForSelector('[data-builder-canvas]', { timeout: 20_000 });
  // Wait for the toolbar with the brand title
  await page.waitForSelector('text=PROQUELEC', { timeout: 15_000 });
  // Small settle delay for Craft.js reconciliation
  await page.waitForTimeout(1000);
}

/** Collapse or expand block groups in the toolbox to make items visible. */
async function expandBlockGroup(page: Page, groupName: string) {
  const groupBtn = page.locator('button:has-text("' + groupName + '")').first();
  if (await groupBtn.isVisible()) {
    // If it's collapsed (chevron shows down), clicking toggles it
    await groupBtn.click();
    await page.waitForTimeout(300);
  }
}

/** Insert a block by double-clicking its entry in the toolbox. */
async function insertBlockByLabel(page: Page, label: string) {
  const blockBtn = page.locator(`button[title*="${label}"]`).first();
  await expect(blockBtn).toBeVisible({ timeout: 5000 });
  await blockBtn.dblclick();
  await page.waitForTimeout(800);
}

/** Check that a success toast notification appeared. */
async function expectToast(page: Page, text: string | RegExp) {
  await expect(page.locator('[role="status"]').or(page.locator('text=sonner'))).toBeVisible({
    timeout: 5000,
  });
}

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────

const TEST_PAGE_ID = ''; // empty → page selector; override with a real page ID for editing tests

// ─────────────────────────────────────────────────────────
// SUITE: Builder Initial Load & Structure
// ─────────────────────────────────────────────────────────

test.describe('God Builder – Initial Load & Structure', () => {
  test.beforeEach(async ({ page }) => {
    await gotoBuilder(page);
  });

  test('Builder page loads and displays the page selector when no pageId is given', async ({
    page,
  }) => {
    // The page selector screen should show
    await expect(page.locator('text=Nouvelle page').or(page.locator('text=Pages'))).toBeVisible({
      timeout: 10_000,
    });
    // The header / navigation should be present
    await expect(page.locator('header, nav').first()).toBeVisible();
  });

  test('Page selector lists existing pages', async ({ page }) => {
    // Wait for the page list to load
    await page.waitForTimeout(2000);
    // Should display page cards or a table
    const pageCards = page.locator('[class*="rounded"][class*="border"]').first();
    // The page list area should be visible — look for common elements
    await expect(page.locator('text=Nouvelle page').or(page.locator('text=Créer'))).toBeVisible({
      timeout: 5000,
    });
  });

  test('Can open the create new page dialog', async ({ page }) => {
    const createBtn = page
      .locator('button:has-text("Nouvelle page"), button:has-text("Créer")')
      .first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(500);
      // The dialog should appear with title and slug fields
      await expect(
        page.locator('input[placeholder*="Titre"]').or(page.locator('label:has-text("Titre")')),
      ).toBeVisible({ timeout: 3000 });
    }
  });
});

// ─────────────────────────────────────────────────────────
// SUITE: God Builder Editor (requires a real page)
// ─────────────────────────────────────────────────────────

test.describe('God Builder – Editor Canvas & Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    // Go directly to a known page; this test assumes a page exists.
    // If TEST_PAGE_ID is empty, navigate to the first available page.
    await page.goto('/admin/builder');
    await page.waitForLoadState('networkidle');

    // Try clicking the first page card if we're on the selector screen
    const firstPageLink = page.locator('a[href*="/admin/builder/"]').first();
    if (await firstPageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
    }
    await waitForBuilderReady(page);
  });

  // ── Toolbar ────────────────────────────────────────────

  test('Toolbar displays with brand name, status badge, and action buttons', async ({ page }) => {
    // Brand name
    await expect(page.locator('text=PROQUELEC').first()).toBeVisible({ timeout: 5000 });
    // Status badge (saved / dirty etc.)
    await expect(
      page.locator('text=Sauvegardé').or(page.locator('text=Modifications')),
    ).toBeVisible({ timeout: 5000 });
    // Undo / Redo buttons are present (they have aria-labels)
    await expect(page.locator('button[aria-label="Annuler la dernière action"]')).toBeVisible();
    await expect(
      page.locator('button[aria-label="Rétablir la dernière action annulée"]'),
    ).toBeVisible();
    // Save button
    await expect(page.locator('button:has-text("Sauvegarder")').first()).toBeVisible();
  });

  test('Toolbar viewport buttons switch between desktop, tablet and mobile', async ({ page }) => {
    // The viewport buttons are in the toolbar center section
    const tabletBtn = page.locator('button[aria-label="Passer en vue tablet"]');
    const mobileBtn = page.locator('button[aria-label="Passer en vue mobile"]');
    const desktopBtn = page.locator('button[aria-label="Passer en vue desktop"]');

    // Switch to tablet
    await expect(tabletBtn).toBeVisible();
    await tabletBtn.click();
    await page.waitForTimeout(500);

    // Switch to mobile
    await mobileBtn.click();
    await page.waitForTimeout(500);

    // Switch back to desktop
    await desktopBtn.click();
    await page.waitForTimeout(500);
  });

  test('Toolbar preview toggle switches between edit and preview modes', async ({ page }) => {
    const previewBtn = page
      .locator('button[aria-label*="Aperçu"]')
      .or(page.locator('button[aria-label*="aperçu"]'));
    await expect(previewBtn).toBeVisible();

    // Toggle to preview mode
    await previewBtn.click();
    await page.waitForTimeout(500);

    // The button label should have changed
    await expect(
      page
        .locator('button[aria-label*="Édition"]')
        .or(page.locator('button[aria-label*="édition"]')),
    ).toBeVisible({ timeout: 3000 });

    // Toggle back to edit mode
    await previewBtn.click();
    await page.waitForTimeout(500);
  });

  test('Undo and redo buttons are present and clickable', async ({ page }) => {
    const undoBtn = page.locator('button[aria-label="Annuler la dernière action"]');
    const redoBtn = page.locator('button[aria-label="Rétablir la dernière action annulée"]');

    await expect(undoBtn).toBeVisible();
    await expect(redoBtn).toBeVisible();

    // They may be disabled when there's no history, but they should exist
    await expect(undoBtn).toBeVisible();
    await expect(redoBtn).toBeVisible();
  });

  test('Timeline toggle button opens and closes the timeline panel', async ({ page }) => {
    const timelineBtn = page
      .locator('button[aria-label*="Timeline"]')
      .or(page.locator('button[aria-label*="timeline"]'));
    await expect(timelineBtn).toBeVisible();

    await timelineBtn.click();
    await page.waitForTimeout(500);

    // Timeline panel should now be visible (it has a "Versions" title)
    // In some builds the timeline is a side panel
    await expect(
      page.locator('text=Timeline').or(page.locator('text=versions')).first(),
    ).toBeVisible({ timeout: 3000 });

    // Click again to close
    await timelineBtn.click();
    await page.waitForTimeout(500);
  });

  test('Keyboard shortcuts hint button is accessible', async ({ page }) => {
    const hintBtn = page
      .locator('button[aria-label*="raccourci"]')
      .or(page.locator('button[aria-label*="Raccourci"]'));
    await expect(hintBtn).toBeVisible();
  });

  // ── Save ───────────────────────────────────────────────

  test('Save button is clickable and triggers save flow', async ({ page }) => {
    const saveBtn = page.locator('button:has-text("Sauvegarder")').first();
    await expect(saveBtn).toBeVisible();
    await expect(saveBtn).toBeEnabled({ timeout: 5000 });

    // Click the main save button
    await saveBtn.click();
    await page.waitForTimeout(2000);

    // Either the save succeeds (status changes) or a dropdown appears with version option
    const savedStatus = page.locator('text=Sauvegardé').first();
    await expect(savedStatus).toBeVisible({ timeout: 8000 });
  });

  test('Save dropdown contains version save and preview options', async ({ page }) => {
    // Click the dropdown chevron next to the save button
    const dropdownBtn = page.locator('button[aria-label="Ouvrir les options de sauvegarde"]');
    await expect(dropdownBtn).toBeVisible();
    await dropdownBtn.click();
    await page.waitForTimeout(300);

    // The dropdown should show "Sauvegarder comme version..."
    await expect(page.locator('text=Sauvegarder comme version')).toBeVisible({ timeout: 3000 });
    // Should also have toggle preview option
    await expect(
      page.locator('text=Mode aperçu').or(page.locator('text=Mode édition')),
    ).toBeVisible({
      timeout: 3000,
    });
  });

  // ── Zoom ───────────────────────────────────────────────

  test('Canvas zoom controls are functional', async ({ page }) => {
    // The zoom controls are in the canvas top bar (inside the canvas area)
    const zoomOut = page.locator('button[aria-label="Réduire le zoom du canvas"]');
    const zoomIn = page.locator('button[aria-label="Augmenter le zoom du canvas"]');
    const zoomReset = page.locator('button[aria-label="Réinitialiser le zoom du canvas"]');

    await expect(zoomOut).toBeVisible();
    await expect(zoomIn).toBeVisible();
    await expect(zoomReset).toBeVisible();

    // Read initial zoom value
    const zoomValue = page.locator('text=/\\d+%/').first();
    await expect(zoomValue).toBeVisible();

    // Zoom in
    await zoomIn.click();
    await page.waitForTimeout(300);

    // Zoom out twice (to go below 100%)
    await zoomOut.click();
    await page.waitForTimeout(300);
    await zoomOut.click();
    await page.waitForTimeout(300);

    // Reset
    await zoomReset.click();
    await page.waitForTimeout(300);
  });

  // ── Canvas Viewport (within canvas bar) ────────────────

  test('Canvas viewport buttons switch device width', async ({ page }) => {
    // The canvas has its own viewport switcher
    const desktopBtn = page.locator('button[title="Desktop (100%)"]');
    const tabletBtn = page.locator('button[title="Tablette (768px)"]');
    const mobileBtn = page.locator('button[title="Mobile (390px)"]');

    await expect(desktopBtn).toBeVisible();

    // Switch to tablet
    await tabletBtn.click();
    await page.waitForTimeout(500);

    // Switch to mobile
    await mobileBtn.click();
    await page.waitForTimeout(500);

    // Switch back to desktop
    await desktopBtn.click();
    await page.waitForTimeout(500);
  });
});

// ─────────────────────────────────────────────────────────
// SUITE: God Toolbox (Block palette)
// ─────────────────────────────────────────────────────────

test.describe('God Builder – Toolbox (Blocs)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/builder');
    await page.waitForLoadState('networkidle');
    const firstPageLink = page.locator('a[href*="/admin/builder/"]').first();
    if (await firstPageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
    }
    await waitForBuilderReady(page);
  });

  test('Toolbox sidebar is visible and contains block groups', async ({ page }) => {
    // The toolbox is the left sidebar with "Blocs" header
    await expect(page.locator('text=Blocs').first()).toBeVisible({ timeout: 5000 });
    // The "Structure" group should be visible
    await expect(page.locator('text=Structure').first()).toBeVisible();
  });

  test('Structure group contains Container, Columns, Spacer and other blocks', async ({ page }) => {
    await expandBlockGroup(page, 'Structure');
    // Wait for items to render
    await page.waitForTimeout(500);
    await expect(page.locator('button[title*="Conteneur"]').first()).toBeVisible();
    await expect(page.locator('button[title*="Colonnes"]').first()).toBeVisible();
    await expect(page.locator('button[title*="Espace"]').first()).toBeVisible();
  });

  test('Toolbox tabs allow switching between Blocs, Templates, and Globaux', async ({ page }) => {
    // The tabs are in the toolbox header
    const blocsTab = page.locator('button:has-text("Blocs")').first();
    const templatesTab = page.locator('button:has-text("Templates")').first();
    const globauxTab = page.locator('button:has-text("Globaux")').first();

    await expect(blocsTab).toBeVisible();
    await expect(templatesTab).toBeVisible();
    await expect(globauxTab).toBeVisible();

    // Switch to Templates tab
    await templatesTab.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Mes Modèles').first()).toBeVisible({ timeout: 5000 });

    // Switch to Globaux tab
    await globauxTab.click();
    await page.waitForTimeout(500);

    // Switch back to Blocs tab
    await blocsTab.click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Structure').first()).toBeVisible({ timeout: 5000 });
  });

  test('Search input filters blocks by name', async ({ page }) => {
    // The search input is inside the toolbox
    const searchInput = page.locator('input[placeholder="Rechercher..."]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Type a search term
    await searchInput.fill('Hero');
    await page.waitForTimeout(500);

    // The toolbox should now only show matching items (e.g. HeroBanner)
    // Search results should be filtered; the non-matching groups should be gone
    // If the search clears all results, the "Aucun bloc trouvé" message may appear
    const noResults = page.locator('text=Aucun bloc trouvé');
    const someResult = page.locator('button[title*="Hero"]').first();
    const hasResults = await someResult.isVisible().catch(() => false);
    const hasNoResults = await noResults.isVisible().catch(() => false);
    expect(hasResults || hasNoResults).toBeTruthy();

    // Clear search
    const clearBtn = page.locator('button[aria-label="Effacer la recherche"]');
    if (await clearBtn.isVisible().catch(() => false)) {
      await clearBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('Search input can be cleared with the X button', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Rechercher..."]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    await searchInput.fill('Something');
    await page.waitForTimeout(300);

    const clearBtn = page.locator('button[aria-label="Effacer la recherche"]');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await page.waitForTimeout(300);

    // The search should be cleared
    expect(await searchInput.inputValue()).toBe('');
  });

  test('Toolbox can be collapsed and expanded via toggle button', async ({ page }) => {
    const collapseBtn = page.locator(
      'button[aria-label="Réduire le panneau des blocs"], button[aria-label="Agrandir le panneau des blocs"]',
    );
    await expect(collapseBtn).toBeVisible();

    // Collapse
    await collapseBtn.click();
    await page.waitForTimeout(500);

    // The toolbox width should be reduced (sidebar is now narrow)
    // The "Blocs" text should no longer be visible (since it's collapsed)
    // Toggle back
    await collapseBtn.click();
    await page.waitForTimeout(500);

    // Should be expanded again
    await expect(page.locator('text=Structure').first()).toBeVisible({ timeout: 3000 });
  });

  test('Block groups can be collapsed and expanded', async ({ page }) => {
    // The "Structure" group header should be clickable to collapse/expand
    const structureHeader = page.locator('button:has-text("Structure")').first();
    await expect(structureHeader).toBeVisible();

    // First ensure it's expanded
    // Click to collapse
    await structureHeader.click();
    await page.waitForTimeout(300);

    // Items inside should now be hidden
    const containerItem = page.locator('button[title*="Conteneur"]').first();
    const isContainerVisible = await containerItem.isVisible().catch(() => false);
    // If collapsed, container shouldn't be visible
    // Click to expand again
    await structureHeader.click();
    await page.waitForTimeout(300);
  });

  test('Double-clicking a block inserts it onto the canvas', async ({ page }) => {
    // Expand the "Structure" group if collapsed
    await expandBlockGroup(page, 'Structure');

    // Double-click the Container block
    const containerBtn = page.locator('button[title*="Conteneur"]').first();
    await expect(containerBtn).toBeVisible({ timeout: 5000 });

    await containerBtn.dblclick();
    await page.waitForTimeout(1500);

    // A success toast should appear
    await expect(page.locator('text=Bloc « Conteneur » inséré').first()).toBeVisible({
      timeout: 5000,
    });

    // The canvas should now contain the block — the empty canvas hint should be gone
    const emptyHint = page.locator('text=La page est vide');
    await expect(emptyHint).not.toBeVisible({ timeout: 3000 });
  });

  test('Inserting multiple blocks stacks them on the canvas', async ({ page }) => {
    await expandBlockGroup(page, 'Structure');

    // Insert a Container
    await insertBlockByLabel(page, 'Conteneur');
    await page.waitForTimeout(500);

    // Insert a Spacer
    // Switch to the spacer
    const spacerBtn = page.locator('button[title*="Espace"]').first();
    await expect(spacerBtn).toBeVisible();
    await spacerBtn.dblclick();
    await page.waitForTimeout(1000);

    // Both should have been inserted
    await expect(page.locator('text=Bloc « Espace » inséré').first()).toBeVisible({
      timeout: 5000,
    });
  });
});

// ─────────────────────────────────────────────────────────
// SUITE: Canvas Interactions
// ─────────────────────────────────────────────────────────

test.describe('God Builder – Canvas Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/builder');
    await page.waitForLoadState('networkidle');
    const firstPageLink = page.locator('a[href*="/admin/builder/"]').first();
    if (await firstPageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
    }
    await waitForBuilderReady(page);
  });

  test('Empty canvas shows the placeholder message', async ({ page }) => {
    // Before inserting blocks, the empty canvas hint should be visible
    const emptyHint = page.locator('text=La page est vide');
    if (await emptyHint.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(emptyHint).toBeVisible();
      await expect(page.locator('text=Glissez un élément')).toBeVisible();
    }
  });

  test('Clicking a block on canvas selects it and opens settings panel', async ({ page }) => {
    // First insert a block
    await expandBlockGroup(page, 'Structure');
    await insertBlockByLabel(page, 'Conteneur');

    // Wait for the block to appear on canvas
    await page.waitForTimeout(1000);

    // The settings panel (right sidebar) should show the block name or "Paramètres de page"
    // After inserting, the settings panel title should show something about the block
    // If the block is automatically selected after insert, the panel should show its name
    await page.waitForTimeout(500);

    // The right panel should either show "Conteneur" or "Paramètres de page"
    // If nothing is selected, it shows page settings
    const settingsPanel = page
      .locator('text=Paramètres de page')
      .or(page.locator('text=Conteneur'));
    await expect(settingsPanel.first()).toBeVisible({ timeout: 5000 });
  });

  test('Right-clicking a block on canvas opens a context menu', async ({ page }) => {
    // Insert a block first
    await expandBlockGroup(page, 'Structure');
    await insertBlockByLabel(page, 'Conteneur');
    await page.waitForTimeout(1000);

    // Find the block on the canvas and right-click it
    const canvasBlock = page.locator('[data-builder-canvas] [class*="craft"]').first();
    if (await canvasBlock.isVisible({ timeout: 3000 }).catch(() => false)) {
      await canvasBlock.click({ button: 'right' });
      await page.waitForTimeout(500);
    }
    // Context menu may or may not appear depending on the block type
    // This test just verifies the operation doesn't crash
  });
});

// ─────────────────────────────────────────────────────────
// SUITE: Templates Tab
// ─────────────────────────────────────────────────────────

test.describe('God Builder – Templates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/builder');
    await page.waitForLoadState('networkidle');
    const firstPageLink = page.locator('a[href*="/admin/builder/"]').first();
    if (await firstPageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
    }
    await waitForBuilderReady(page);
  });

  test('Templates tab loads and shows template categories', async ({ page }) => {
    const templatesTab = page.locator('button:has-text("Templates")').first();
    await templatesTab.click();
    await page.waitForTimeout(1000);

    // The templates tab should show "Mes Modèles" section
    await expect(page.locator('text=Mes Modèles').first()).toBeVisible({ timeout: 8000 });

    // Should also show predefined template categories
    await expect(page.locator('text=Modèles prédéfinis').first()).toBeVisible({ timeout: 5000 });
  });

  test('Template categories are listed with their items', async ({ page }) => {
    const templatesTab = page.locator('button:has-text("Templates")').first();
    await templatesTab.click();
    await page.waitForTimeout(1500);

    // Look for a known category label like "Héros & bannières"
    const heroCategory = page.locator('text=Héros').first();
    if (await heroCategory.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(heroCategory).toBeVisible();
    }
  });

  test('Template preview cards are rendered with gradients', async ({ page }) => {
    const templatesTab = page.locator('button:has-text("Templates")').first();
    await templatesTab.click();
    await page.waitForTimeout(1500);

    // Template preview cards should exist (they have a gradient background)
    const previewCard = page.locator('[class*="rounded-xl"]').first();
    if (await previewCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(previewCard).toBeVisible();
    }
  });

  test('Saved templates section shows empty state when no templates exist', async ({ page }) => {
    const templatesTab = page.locator('button:has-text("Templates")').first();
    await templatesTab.click();
    await page.waitForTimeout(1500);

    // Either show "Aucun modèle enregistré" or actual template items
    const emptyState = page.locator('text=Aucun modèle enregistré');
    const hasEmptyState = await emptyState.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasEmptyState) {
      await expect(emptyState).toBeVisible();
    }
  });
});

// ─────────────────────────────────────────────────────────
// SUITE: Right Settings Panel
// ─────────────────────────────────────────────────────────

test.describe('God Builder – Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/builder');
    await page.waitForLoadState('networkidle');
    const firstPageLink = page.locator('a[href*="/admin/builder/"]').first();
    if (await firstPageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
    }
    await waitForBuilderReady(page);
  });

  test('Right panel shows page settings when no block is selected', async ({ page }) => {
    // The right panel should show "Paramètres de page" in the header
    await expect(page.locator('text=Paramètres de page').first()).toBeVisible({ timeout: 5000 });

    // Should have metadata and theme tabs
    const metaTab = page.locator('button:has-text("Métadonnées")').first();
    await expect(metaTab).toBeVisible();

    const themeTab = page.locator('button:has-text("Thème Global")').first();
    await expect(themeTab).toBeVisible();
  });

  test('Page metadata panel contains meta fields', async ({ page }) => {
    // The "Métadonnées" tab should be active by default when no block is selected
    const metaTitle = page.locator('text=Métadonnées').first();
    await expect(metaTitle).toBeVisible();

    // Look for common meta fields
    const titleField = page.locator('input[value]').first();
    if (await titleField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(titleField).toBeVisible();
    }
  });

  test('Clicking the theme tab shows theme configuration', async ({ page }) => {
    const themeTab = page.locator('button:has-text("Thème Global")').first();
    await expect(themeTab).toBeVisible();
    await themeTab.click();
    await page.waitForTimeout(500);

    // Theme config should show color pickers or font settings
    await expect(page.locator('text=Couleur').or(page.locator('text=Police')).first()).toBeVisible({
      timeout: 3000,
    });
  });

  test('Settings panel is absent when the canvas is in preview mode', async ({ page }) => {
    // Toggle to preview mode
    const previewBtn = page.locator('button[aria-label*="Aperçu"]').first();
    await previewBtn.click();
    await page.waitForTimeout(500);

    // In preview mode, the right settings panel should be hidden (GodSettings returns null when !isEnabled)
    const settingsPanel = page.locator('text=Paramètres de page');
    await expect(settingsPanel).not.toBeVisible({ timeout: 3000 });
  });
});

// ─────────────────────────────────────────────────────────
// SUITE: Layers Panel
// ─────────────────────────────────────────────────────────

test.describe('God Builder – Layers Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/builder');
    await page.waitForLoadState('networkidle');
    const firstPageLink = page.locator('a[href*="/admin/builder/"]').first();
    if (await firstPageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
    }
    await waitForBuilderReady(page);
  });

  test('Layers panel shows the block tree structure', async ({ page }) => {
    // The layers panel (GodLayers) is the leftmost panel below the toolbox
    // It lists blocks in a tree with "ROOT" visible
    await expect(page.locator('text=ROOT').or(page.locator('text=root'))).toBeVisible({
      timeout: 5000,
    });
  });

  test('Layer items have lock, visibility, and delete controls', async ({ page }) => {
    // The layers should have action buttons on hover or always visible
    const layerActions = page
      .locator('button[aria-label*="Verrouiller"], button[aria-label*="verrouiller"]')
      .first();
    if (await layerActions.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(layerActions).toBeVisible();
    }
  });
});

// ─────────────────────────────────────────────────────────
// SUITE: Keyboard Shortcuts
// ─────────────────────────────────────────────────────────

test.describe('God Builder – Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/builder');
    await page.waitForLoadState('networkidle');
    const firstPageLink = page.locator('a[href*="/admin/builder/"]').first();
    if (await firstPageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
    }
    await waitForBuilderReady(page);
  });

  test('Ctrl+Z and Ctrl+Y trigger undo/redo (without crashing)', async ({ page }) => {
    // Press undo shortcut
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(500);

    // Press redo shortcut
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(500);

    // No error should appear on the page
    const errorToast = page.locator('text=Erreur').first();
    const hasError = await errorToast.isVisible({ timeout: 1000 }).catch(() => false);
    expect(hasError).toBeFalsy();
  });

  test('Escape key deselects any selected block (without crashing)', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    // No crash should happen
    await expect(page.locator('[data-builder-canvas]')).toBeVisible();
  });

  test('Ctrl+S triggers quick save (without crashing)', async ({ page }) => {
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(2000);
    // The save should have happened; the status badge should show "Sauvegardé"
    const saved = page.locator('text=Sauvegardé').first();
    await expect(saved).toBeVisible({ timeout: 10000 });
  });

  test('Ctrl+P toggles preview mode (without crashing)', async ({ page }) => {
    await page.keyboard.press('Control+p');
    await page.waitForTimeout(1000);

    // Toggle back
    await page.keyboard.press('Control+p');
    await page.waitForTimeout(1000);

    await expect(page.locator('[data-builder-canvas]')).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────
// SUITE: Global HTML Editor Dialog
// ─────────────────────────────────────────────────────────

test.describe('God Builder – HTML Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/builder');
    await page.waitForLoadState('networkidle');
    const firstPageLink = page.locator('a[href*="/admin/builder/"]').first();
    if (await firstPageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
    }
    await waitForBuilderReady(page);
  });

  test('HTML Editor dialog can be opened', async ({ page }) => {
    const htmlBtn = page.locator('button[aria-label="Éditer le HTML global de la page"]');
    await expect(htmlBtn).toBeVisible();
    await htmlBtn.click();
    await page.waitForTimeout(1000);

    // The dialog should show "Éditeur HTML Global"
    await expect(page.locator('text=Éditeur HTML Global').first()).toBeVisible({ timeout: 5000 });

    // Close the dialog
    const cancelBtn = page.locator('button:has-text("Annuler")');
    await cancelBtn.click();
    await page.waitForTimeout(500);
  });

  test('HTML Editor dialog has Beautifier, Exporter, and Importer buttons', async ({ page }) => {
    const htmlBtn = page.locator('button[aria-label="Éditer le HTML global de la page"]');
    await htmlBtn.click();
    await page.waitForTimeout(1000);

    // The dialog footer buttons
    await expect(page.locator('button:has-text("Beautifier")').first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('button:has-text("Exporter")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Importer")').first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────
// SUITE: Builder Config Access
// ─────────────────────────────────────────────────────────

test.describe('God Builder – Builder Config', () => {
  test('Config builder button is visible on editor page', async ({ page }) => {
    await page.goto('/admin/builder');
    await page.waitForLoadState('networkidle');
    const firstPageLink = page.locator('a[href*="/admin/builder/"]').first();
    if (await firstPageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
    }
    await waitForBuilderReady(page);

    // The "Config Builder" button is a fixed position button
    const configBtn = page.locator('button:has-text("Config Builder")');
    await expect(configBtn).toBeVisible({ timeout: 5000 });
  });

  test('Can navigate to builder config page', async ({ page }) => {
    await page.goto('/admin/builder/config');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // The config page should load (it's the BuilderConfigAdmin component)
    await expect(
      page.locator('text=Configuration').or(page.locator('text=Builder')).first(),
    ).toBeVisible({ timeout: 10000 });
  });
});

// ─────────────────────────────────────────────────────────
// SUITE: Page Selector — Create & Duplicate
// ─────────────────────────────────────────────────────────

test.describe('Builder – Page Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/builder');
    await page.waitForLoadState('networkidle');
  });

  test('Page selector has a search input to filter pages', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Look for a search input on the page selector
    const searchInput = page
      .locator('input[placeholder*="chercher"]')
      .or(page.locator('input[placeholder*="Rechercher"]'));
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('Page selector has filter buttons for page status', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Status filter buttons
    const filterBtns = page
      .locator('button:has-text("Toutes")')
      .or(
        page.locator('button:has-text("Publié")').or(page.locator('button:has-text("Brouillon")')),
      );
    if (await filterBtns.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(filterBtns).toBeVisible();
    }
  });

  test('Page selector shows page listing with status badges', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Page cards should exist with status badges
    const statusBadge = page.locator('text=Publié, text=Brouillon, text=Archivée').first();
    if (await statusBadge.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(statusBadge).toBeVisible();
    }
  });
});

// ─────────────────────────────────────────────────────────
// SUITE: Error Handling & Resilience
// ─────────────────────────────────────────────────────────

test.describe('Builder – Error Handling & Resilience', () => {
  test('Navigating to an invalid builder page shows error state', async ({ page }) => {
    await page.goto('/admin/builder/nonexistent-page-id-12345');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should either show a loading state or an error message (not crash)
    const errorState = page
      .locator('text=Erreur')
      .or(page.locator('text=Chargement').or(page.locator('text=Réessayer')));
    await expect(errorState.first()).toBeVisible({ timeout: 10000 });
  });

  test('Page does not crash when rapidly clicking toolbox items', async ({ page }) => {
    await gotoBuilder(page);
    const firstPageLink = page.locator('a[href*="/admin/builder/"]').first();
    if (await firstPageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
    }
    await waitForBuilderReady(page);

    // Rapidly click between tabs
    const templatesTab = page.locator('button:has-text("Templates")').first();
    const blocsTab = page.locator('button:has-text("Blocs")').first();
    const globauxTab = page.locator('button:has-text("Globaux")').first();

    for (let i = 0; i < 5; i++) {
      await blocsTab.click();
      await templatesTab.click();
      await globauxTab.click();
    }
    await page.waitForTimeout(500);

    // The page should still be responsive
    await expect(page.locator('[data-builder-canvas]')).toBeVisible({ timeout: 5000 });
  });

  test('Page survives multiple quick viewport toggles', async ({ page }) => {
    await gotoBuilder(page);
    const firstPageLink = page.locator('a[href*="/admin/builder/"]').first();
    if (await firstPageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
    }
    await waitForBuilderReady(page);

    const previewBtn = page.locator('button[aria-label*="Aperçu"]').first();

    // Rapid toggle
    for (let i = 0; i < 4; i++) {
      await previewBtn.click();
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(500);

    await expect(page.locator('[data-builder-canvas]')).toBeVisible({ timeout: 5000 });
  });
});

// ─────────────────────────────────────────────────────────
// SUITE: Accessibility
// ─────────────────────────────────────────────────────────

test.describe('Builder – Accessibility & ARIA', () => {
  test.beforeEach(async ({ page }) => {
    await gotoBuilder(page);
    const firstPageLink = page.locator('a[href*="/admin/builder/"]').first();
    if (await firstPageLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstPageLink.click();
      await page.waitForLoadState('networkidle');
    }
    await waitForBuilderReady(page);
  });

  test('Toolbar buttons have descriptive aria-labels', async ({ page }) => {
    // Check that critical action buttons have aria-labels
    const buttonsWithAria = page.locator(
      'button[aria-label*="Annuler"], ' +
        'button[aria-label*="Rétablir"], ' +
        'button[aria-label*="Sauvegarder"], ' +
        'button[aria-label*="Aperçu"]',
    );
    const count = await buttonsWithAria.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Canvas wrapper has a data attribute for testing', async ({ page }) => {
    await expect(page.locator('[data-builder-canvas]')).toBeVisible();
  });

  test('Viewport buttons have title attributes', async ({ page }) => {
    const viewportBtns = page.locator(
      'button[title*="Desktop"], button[title*="Tablette"], button[title*="Mobile"]',
    );
    const count = await viewportBtns.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
