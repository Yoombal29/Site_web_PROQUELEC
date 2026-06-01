import { chromium } from 'playwright';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:5175';

async function quickTest() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log('Testing homepage...\n');
    
    const response = await page.goto(BASE_URL + '/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });

    console.log(`Status: ${response.status()}`);
    
    // Wait for some JS to load
    await new Promise(r => setTimeout(r, 2000));

    const links = await page.evaluate(() => {
      const anchors = document.querySelectorAll('a[href]');
      return Array.from(anchors).map(a => ({
        text: a.textContent.trim().substring(0, 60),
        href: a.getAttribute('href'),
      }));
    });

    console.log(`\nFound ${links.length} links on homepage:\n`);
    
    const uniqueLinks = Array.from(new Map(links.map(l => [l.href, l])).values());
    uniqueLinks.slice(0, 30).forEach(link => {
      console.log(`  [${link.href}] ${link.text}`);
    });

    if (uniqueLinks.length > 30) {
      console.log(`  ... and ${uniqueLinks.length - 30} more`);
    }

    // Get page HTML length
    const htmlLength = await page.evaluate(() => document.documentElement.outerHTML.length);
    console.log(`\nPage HTML size: ${(htmlLength / 1024).toFixed(2)} KB`);

    // Get title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    await page.close();
    await browser.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

quickTest();
