/**
 * E2E Tests for Builder Page
 * Tests critical flows: drag-and-drop, save, undo/redo
 */

import { test, expect } from '@playwright/test';

test.describe('Builder Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to builder page (adjust URL as needed)
    await page.goto('/admin/builder/test-page');
  });

  test('should load builder page successfully', async ({ page }) => {
    // Check that main builder elements are present
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('should add a block via drag and drop', async ({ page }) => {
    // Find a draggable block in the sidebar
    const heroBlock = page.locator('[data-testid="draggable-hero"]').first();
    
    // Find the drop zone in the canvas
    const canvas = page.locator('[data-testid="builder-canvas"]');
    
    // Drag and drop
    await heroBlock.dragTo(canvas);
    
    // Verify block was added
    await expect(page.locator('[data-block-type="hero"]')).toBeVisible();
  });

  test('should save page changes', async ({ page }) => {
    // Add a block first
    const heroBlock = page.locator('[data-testid="draggable-hero"]').first();
    const canvas = page.locator('[data-testid="builder-canvas"]');
    await heroBlock.dragTo(canvas);
    
    // Click save button
    await page.click('[data-testid="save-button"]');
    
    // Verify success message
    await expect(page.locator('text=Page sauvegardée')).toBeVisible();
  });

  test('should perform undo operation', async ({ page }) => {
    // Add a block
    const heroBlock = page.locator('[data-testid="draggable-hero"]').first();
    const canvas = page.locator('[data-testid="builder-canvas"]');
    await heroBlock.dragTo(canvas);
    
    // Click undo
    await page.click('[data-testid="undo-button"]');
    
    // Verify block was removed
    await expect(page.locator('[data-block-type="hero"]')).not.toBeVisible();
  });

  test('should perform redo operation', async ({ page }) => {
    // Add a block
    const heroBlock = page.locator('[data-testid="draggable-hero"]').first();
    const canvas = page.locator('[data-testid="builder-canvas"]');
    await heroBlock.dragTo(canvas);
    
    // Undo
    await page.click('[data-testid="undo-button"]');
    
    // Redo
    await page.click('[data-testid="redo-button"]');
    
    // Verify block was restored
    await expect(page.locator('[data-block-type="hero"]')).toBeVisible();
  });

  test('should use keyboard shortcuts', async ({ page }) => {
    // Add a block
    const heroBlock = page.locator('[data-testid="draggable-hero"]').first();
    const canvas = page.locator('[data-testid="builder-canvas"]');
    await heroBlock.dragTo(canvas);
    
    // Test Ctrl+Z for undo
    await page.keyboard.press('Control+Z');
    
    // Verify block was removed
    await expect(page.locator('[data-block-type="hero"]')).not.toBeVisible();
    
    // Test Ctrl+Y for redo
    await page.keyboard.press('Control+Y');
    
    // Verify block was restored
    await expect(page.locator('[data-block-type="hero"]')).toBeVisible();
  });

  test('should select and edit block properties', async ({ page }) => {
    // Add a block
    const heroBlock = page.locator('[data-testid="draggable-hero"]').first();
    const canvas = page.locator('[data-testid="builder-canvas"]');
    await heroBlock.dragTo(canvas);
    
    // Click on the block to select it
    await page.click('[data-block-type="hero"]');
    
    // Verify property panel is visible
    await expect(page.locator('[data-testid="property-panel"]')).toBeVisible();
    
    // Edit a property
    await page.fill('[data-testid="prop-title"]', 'New Title');
    
    // Verify change was applied
    await expect(page.locator('[data-block-type="hero"]')).toContainText('New Title');
  });

  test('should delete selected block', async ({ page }) => {
    // Add a block
    const heroBlock = page.locator('[data-testid="draggable-hero"]').first();
    const canvas = page.locator('[data-testid="builder-canvas"]');
    await heroBlock.dragTo(canvas);
    
    // Select the block
    await page.click('[data-block-type="hero"]');
    
    // Press Delete key
    await page.keyboard.press('Delete');
    
    // Verify block was removed
    await expect(page.locator('[data-block-type="hero"]')).not.toBeVisible();
  });

  test('should switch between view modes', async ({ page }) => {
    // Click tablet view
    await page.click('[data-testid="view-tablet"]');
    
    // Verify canvas width changed
    const canvas = page.locator('[data-testid="builder-canvas"]');
    await expect(canvas).toHaveClass(/max-w-\[768px\]/);
    
    // Click mobile view
    await page.click('[data-testid="view-mobile"]');
    
    // Verify canvas width changed
    await expect(canvas).toHaveClass(/max-w-\[375px\]/);
    
    // Click desktop view
    await page.click('[data-testid="view-desktop"]');
    
    // Verify canvas width changed
    await expect(canvas).toHaveClass(/max-w-6xl/);
  });
});
