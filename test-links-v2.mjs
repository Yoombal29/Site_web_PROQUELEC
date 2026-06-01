import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5175';
const TIMEOUT = 15000;
const WAIT_TIME = 3000;

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
  '/sitemap',
];

const results = {
  testedPages: [],
  workingPages: [],
  brokenPages: [],
  allLinks: {},
  errors: [],
  summary: {}
};

async function testPage(browser, pageUrl) {
  let page;
  try {
    page = await browser.newPage();
    const fullUrl = BASE_URL + pageUrl;
    
    console.log(`\n🔍 Testing: ${fullUrl}`);
    
    try {
      const response = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: TIMEOUT });
      
      // Wait for React to render
      await new Promise(r => setTimeout(r, WAIT_TIME));
      
      const status = response.status();
      console.log(`  Status: ${status}`);

      // Get page title
      const title = await page.title();
      console.log(`  Title: ${title || '(empty)'}`);

      // Get all links
      const links = await page.evaluate(() => {
        const anchors = document.querySelectorAll('a[href]');
        return Array.from(anchors).map(a => ({
          text: a.textContent.trim().substring(0, 60),
          href: a.getAttribute('href'),
          target: a.getAttribute('target')
        })).filter(l => l.href);
      });

      // Remove duplicates
      const uniqueLinks = Array.from(new Map(links.map(l => [l.href, l])).values());
      
      console.log(`  ✓ Found ${uniqueLinks.length} links`);

      // Categorize links
      const internalLinks = uniqueLinks.filter(l => !l.href.startsWith('http') && !l.href.startsWith('mailto:') && !l.href.startsWith('tel:'));
      const externalLinks = uniqueLinks.filter(l => l.href.startsWith('http'));
      const mailLinks = uniqueLinks.filter(l => l.href.startsWith('mailto:'));

      const pageResult = {
        url: pageUrl,
        status: status,
        statusOk: status >= 200 && status < 400,
        title: title,
        totalLinks: uniqueLinks.length,
        internalLinks: internalLinks.length,
        externalLinks: externalLinks.length,
        mailLinks: mailLinks.length,
        linksDetails: uniqueLinks
      };

      results.allLinks[pageUrl] = uniqueLinks;

      if (status >= 200 && status < 400) {
        results.workingPages.push(pageResult);
        console.log(`  ✅ Page accessible`);
      } else {
        results.brokenPages.push(pageResult);
        console.log(`  ❌ Error status`);
      }

      results.testedPages.push(pageResult);

    } catch (navError) {
      console.log(`  ❌ Error: ${navError.message}`);
      results.errors.push({ page: pageUrl, error: navError.message });
      results.brokenPages.push({ url: pageUrl, status: 0, statusOk: false, error: navError.message });
      results.testedPages.push({ url: pageUrl, status: 0, statusOk: false, error: navError.message });
    }

  } catch (error) {
    console.error(`  ✗ Fatal error: ${error.message}`);
    results.errors.push({ page: pageUrl, error: error.message });
  } finally {
    if (page) await page.close();
  }
}

async function main() {
  console.log('🚀 Starting Advanced Link Tester...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Pages to test: ${PAGES.length}`);
  
  let browser;
  
  try {
    browser = await chromium.launch();
    
    for (const pageUrl of PAGES) {
      await testPage(browser, pageUrl);
    }

    // Analyze internal links
    console.log('\n' + '='.repeat(70));
    console.log('🔗 TESTING INTERNAL LINKS');
    console.log('='.repeat(70));

    const linkTests = {
      brokenInternalLinks: [],
      workingInternalLinks: []
    };

    const allInternalLinks = new Map();
    for (const [pageUrl, links] of Object.entries(results.allLinks)) {
      const internalLinks = links.filter(l => 
        !l.href.startsWith('http') && 
        !l.href.startsWith('mailto:') && 
        !l.href.startsWith('tel:')
      );
      
      internalLinks.forEach(link => {
        if (!allInternalLinks.has(link.href)) {
          allInternalLinks.set(link.href, { link, foundOn: [pageUrl] });
        } else {
          allInternalLinks.get(link.href).foundOn.push(pageUrl);
        }
      });
    }

    console.log(`\nTotal unique internal links: ${allInternalLinks.size}`);

    // Test sample of internal links
    const linksToTest = Array.from(allInternalLinks.entries()).slice(0, 40);
    
    for (const [href, data] of linksToTest) {
      try {
        const testPage = await browser.newPage();
        const fullUrl = href.startsWith('/') ? BASE_URL + href : BASE_URL + '/' + href;
        
        const response = await testPage.goto(fullUrl, { waitUntil: 'networkidle', timeout: TIMEOUT });
        await new Promise(r => setTimeout(r, 500));
        
        const status = response.status();
        if (status >= 200 && status < 400) {
          linkTests.workingInternalLinks.push({ href, status, foundOn: data.foundOn.slice(0, 2) });
          console.log(`  ✓ ${href} (${status})`);
        } else {
          linkTests.brokenInternalLinks.push({ href, status, foundOn: data.foundOn.slice(0, 2) });
          console.log(`  ✗ ${href} (${status})`);
        }
        
        await testPage.close();
      } catch (err) {
        linkTests.brokenInternalLinks.push({ href, error: err.message, foundOn: data.foundOn.slice(0, 2) });
        console.log(`  ✗ ${href} (Error)`);
      }
    }

    results.summary = {
      totalPagesTested: results.testedPages.length,
      totalPagesAccessible: results.workingPages.length,
      totalPagesBroken: results.brokenPages.length,
      totalLinksFound: Object.values(results.allLinks).reduce((sum, links) => sum + links.length, 0),
      totalUniqueInternalLinks: allInternalLinks.size,
      internalLinksTested: linksToTest.length,
      workingInternalLinks: linkTests.workingInternalLinks.length,
      brokenInternalLinks: linkTests.brokenInternalLinks.length
    };

    const reportPath = path.join(process.cwd(), 'link-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({ ...results, linkTests }, null, 2));
    console.log(`\n📊 Full report saved to: ${reportPath}`);

    console.log('\n' + '='.repeat(70));
    console.log('📈 SUMMARY');
    console.log('='.repeat(70));
    console.log(`✓ Pages accessible: ${results.summary.totalPagesAccessible}/${results.summary.totalPagesTested}`);
    console.log(`✗ Pages broken: ${results.summary.totalPagesBroken}/${results.summary.totalPagesTested}`);
    console.log(`📍 Total links found: ${results.summary.totalLinksFound}`);
    console.log(`🔗 Unique internal links: ${results.summary.totalUniqueInternalLinks}`);
    console.log(`✓ Working internal links: ${results.summary.workingInternalLinks}/${results.summary.internalLinksTested}`);
    console.log(`✗ Broken internal links: ${results.summary.brokenInternalLinks}/${results.summary.internalLinksTested}`);

    if (results.brokenPages.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('🔴 BROKEN PAGES');
      console.log('='.repeat(70));
      results.brokenPages.forEach(page => {
        console.log(`- ${page.url} (Status: ${page.status})`);
      });
    }

    if (linkTests.brokenInternalLinks.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('🔴 BROKEN INTERNAL LINKS');
      console.log('='.repeat(70));
      linkTests.brokenInternalLinks.slice(0, 15).forEach(link => {
        console.log(`- ${link.href} (${link.status || 'Error'})`);
        console.log(`  Found on: ${link.foundOn.join(', ')}`);
      });
      if (linkTests.brokenInternalLinks.length > 15) {
        console.log(`... and ${linkTests.brokenInternalLinks.length - 15} more`);
      }
    }

    if (results.workingPages.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('✅ WORKING PAGES');
      console.log('='.repeat(70));
      results.workingPages.forEach(page => {
        console.log(`- ${page.url} (${page.totalLinks} links)`);
      });
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
