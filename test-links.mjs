import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5175';
const TIMEOUT = 15000;
const WAIT_TIME = 3000; // Wait 3 seconds for React to render

// Pages to test (from the project structure)
const PAGES = [
  '/',
  '/about',
  '/services',
  '/projects',
  '/contact',
  '/blog',
  '/dashboard',
  '/connexion',
  '/certifications',
  '/formations',
  '/actualites',
  '/events',
  '/normes-ressources',
  '/partenaires',
  '/press',
  '/showroom',
  '/documents',
  '/ged',
  '/inspections',
  '/admin',
  '/admin/partners',
  '/admin/pages',
  '/expert-lab',
  '/expert-lab/chat',
  '/expert-lab/calculators',
  '/sitemap',
];

const results = {
  testedPages: [],
  brokenLinks: [],
  workingLinks: [],
  errors: [],
  summary: {}
};

async function testPage(browser, pageUrl) {
  let page;
  try {
    page = await browser.newPage();
    const fullUrl = BASE_URL + pageUrl;
    
    console.log(`\n🔍 Testing: ${fullUrl}`);
    
    await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: TIMEOUT }).catch(err => {
      throw new Error(`Failed to load page: ${err.message}`);
    });

    // Extract all links
    const links = await page.evaluate(() => {
      const anchors = document.querySelectorAll('a[href]');
      return Array.from(anchors).map(a => ({
        text: a.textContent.trim().substring(0, 50),
        href: a.getAttribute('href'),
        target: a.getAttribute('target')
      })).filter(l => l.href && !l.href.startsWith('#')); // Exclude anchors
    });

    // Remove duplicates
    const uniqueLinks = Array.from(new Map(links.map(l => [l.href, l])).values());

    console.log(`✓ Found ${uniqueLinks.length} unique links`);

    const pageResult = {
      url: pageUrl,
      status: 'success',
      linksFound: uniqueLinks.length,
      linksToTest: [],
      brokenLinks: [],
      workingLinks: []
    };

    // Test each link
    for (const link of uniqueLinks) {
      if (link.target === '_blank' || link.href.startsWith('http') || link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
        pageResult.linksToTest.push({
          href: link.href,
          text: link.text,
          type: 'external'
        });
        continue;
      }

      // Internal links
      const testUrl = link.href.startsWith('/') ? BASE_URL + link.href : BASE_URL + '/' + link.href;
      
      try {
        const response = await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
        if (response.status() >= 200 && response.status() < 400) {
          pageResult.workingLinks.push({
            href: link.href,
            text: link.text,
            status: response.status()
          });
        } else {
          pageResult.brokenLinks.push({
            href: link.href,
            text: link.text,
            status: response.status()
          });
        }
      } catch (err) {
        pageResult.brokenLinks.push({
          href: link.href,
          text: link.text,
          error: err.message
        });
      }

      // Go back to original page
      try {
        await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
      } catch (err) {
        console.warn(`Warning: Could not return to ${fullUrl}`);
      }
    }

    results.testedPages.push(pageResult);
    results.workingLinks.push(...pageResult.workingLinks);
    results.brokenLinks.push(...pageResult.brokenLinks);

    return pageResult;
  } catch (error) {
    console.error(`✗ Error on ${pageUrl}:`, error.message);
    results.errors.push({
      page: pageUrl,
      error: error.message
    });
    results.testedPages.push({
      url: pageUrl,
      status: 'error',
      error: error.message
    });
  } finally {
    if (page) await page.close();
  }
}

async function main() {
  console.log('🚀 Starting Link Tester...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Pages to test: ${PAGES.length}`);
  
  let browser;
  
  try {
    browser = await chromium.launch();
    
    // Test each page
    for (const pageUrl of PAGES) {
      await testPage(browser, pageUrl);
    }

    // Generate summary
    results.summary = {
      totalPagesTestedSuccessfully: results.testedPages.filter(p => p.status === 'success').length,
      totalPagesWithErrors: results.testedPages.filter(p => p.status === 'error').length,
      totalLinksChecked: results.workingLinks.length + results.brokenLinks.length,
      totalWorkingLinks: results.workingLinks.length,
      totalBrokenLinks: results.brokenLinks.length
    };

    // Save results to JSON
    const reportPath = path.join(process.cwd(), 'link-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📊 Report saved to: ${reportPath}`);

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✓ Pages tested successfully: ${results.summary.totalPagesTestedSuccessfully}`);
    console.log(`✗ Pages with errors: ${results.summary.totalPagesWithErrors}`);
    console.log(`📍 Total links checked: ${results.summary.totalLinksChecked}`);
    console.log(`✓ Working links: ${results.summary.totalWorkingLinks}`);
    console.log(`✗ Broken links: ${results.summary.totalBrokenLinks}`);

    if (results.brokenLinks.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('🔴 BROKEN LINKS');
      console.log('='.repeat(60));
      results.brokenLinks.slice(0, 20).forEach(link => {
        console.log(`- ${link.href} (${link.text || 'No text'})`);
        if (link.status) console.log(`  Status: ${link.status}`);
        if (link.error) console.log(`  Error: ${link.error}`);
      });
      if (results.brokenLinks.length > 20) {
        console.log(`... and ${results.brokenLinks.length - 20} more`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

main();
