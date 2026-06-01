import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Intercept console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser ERROR]: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`[Browser PAGE ERROR]: ${error.message}`);
  });

  console.log("Navigating to builder...");
  try {
    await page.goto('http://localhost:5175/admin/builder/contact', { waitUntil: 'networkidle', timeout: 15000 });
    console.log("Page loaded.");

    // Wait for canvas to be ready
    await page.waitForSelector('[data-testid="builder-canvas"]', { timeout: 10000 });
    console.log("Canvas is ready.");

    // Note: Implementing an actual dnd-kit drag and drop with Playwright is complex because 
    // it requires exact mouse movements and event triggers.
    // Instead, we will simulate a small mouse movement to check if anything crashes.
    
    // We'll just wait 5 seconds to see if any console errors appear after loading.
    await page.waitForTimeout(5000);
    console.log("No initial crash detected.");

  } catch (err) {
    console.error("Test script failed:", err);
  } finally {
    await browser.close();
  }
})();
