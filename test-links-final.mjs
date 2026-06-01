import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5175';

const PAGES = [
  { path: '/', name: 'Accueil' },
  { path: '/about', name: 'À propos' },
  { path: '/services', name: 'Services' },
  { path: '/projects', name: 'Projets' },
  { path: '/contact', name: 'Contact' },
  { path: '/blog', name: 'Blog' },
  { path: '/certifications', name: 'Certifications' },
  { path: '/formations', name: 'Formations' },
  { path: '/actualites', name: 'Actualités' },
  { path: '/events', name: 'Évènements' },
  { path: '/partenaires', name: 'Partenaires' },
  { path: '/press', name: 'Press' },
  { path: '/showroom', name: 'Showroom' },
  { path: '/documents', name: 'Documents' },
  { path: '/ged', name: 'GED' },
  { path: '/dashboard', name: 'Tableau de bord' },
  { path: '/connexion', name: 'Connexion' },
  { path: '/sitemap', name: 'Plan du site' },
];

const results = {
  pages: [],
  allLinks: new Map(),
  workingPages: [],
  brokenPages: [],
  summary: {}
};

async function testPage(browser, pageInfo) {
  let page;
  try {
    page = await browser.newPage();
    const fullUrl = BASE_URL + pageInfo.path;
    
    console.log(`\n🔍 ${pageInfo.name.padEnd(20)} | ${pageInfo.path}`);
    
    try {
      const response = await page.goto(fullUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 20000 
      });

      const status = response.status();
      
      // Wait for React rendering
      await new Promise(r => setTimeout(r, 1500));

      const title = await page.title();
      
      const links = await page.evaluate(() => {
        const anchors = document.querySelectorAll('a[href]');
        return Array.from(anchors).map(a => ({
          text: a.textContent.trim().substring(0, 80),
          href: a.getAttribute('href'),
          title: a.getAttribute('title'),
        }));
      });

      // Remove duplicates
      const uniqueLinks = Array.from(new Map(links.map(l => [l.href, l])).values());

      // Categorize links
      const internal = uniqueLinks.filter(l => l.href && !l.href.startsWith('http') && !l.href.startsWith('mailto:') && !l.href.startsWith('tel:'));
      const external = uniqueLinks.filter(l => l.href && l.href.startsWith('http'));
      const mail = uniqueLinks.filter(l => l.href && l.href.startsWith('mailto:'));
      const tel = uniqueLinks.filter(l => l.href && l.href.startsWith('tel:'));
      const anchor = uniqueLinks.filter(l => l.href && l.href.startsWith('#'));

      const pageResult = {
        path: pageInfo.path,
        name: pageInfo.name,
        status: status,
        title: title,
        totalLinks: uniqueLinks.length,
        internalLinks: internal.length,
        externalLinks: external.length,
        mailLinks: mail.length,
        telLinks: tel.length,
        anchorLinks: anchor.length,
        linksDetails: uniqueLinks
      };

      results.pages.push(pageResult);

      if (status >= 200 && status < 400) {
        results.workingPages.push(pageResult);
        console.log(`  ✅ ${status} | ${uniqueLinks.length} liens (${internal.length} int, ${external.length} ext)`);
      } else {
        results.brokenPages.push(pageResult);
        console.log(`  ⚠️  ${status} | ${uniqueLinks.length} liens`);
      }

      // Store links
      uniqueLinks.forEach(link => {
        const key = link.href;
        if (!results.allLinks.has(key)) {
          results.allLinks.set(key, { link, foundOn: [pageInfo.path] });
        } else {
          results.allLinks.get(key).foundOn.push(pageInfo.path);
        }
      });

    } catch (navError) {
      console.log(`  ❌ Erreur: ${navError.message.substring(0, 60)}`);
      results.brokenPages.push({
        path: pageInfo.path,
        name: pageInfo.name,
        status: 0,
        error: navError.message
      });
    }

  } catch (error) {
    console.error(`  FATAL: ${error.message}`);
  } finally {
    if (page) await page.close();
  }
}

async function testInternalLinks(browser) {
  console.log('\n' + '='.repeat(70));
  console.log('🔗 TEST DES LIENS INTERNES');
  console.log('='.repeat(70));

  // Get all internal links
  const internalLinks = Array.from(results.allLinks.entries())
    .filter(([href]) => !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#'))
    .map(([href, data]) => ({ href, ...data }));

  console.log(`\n📍 Total liens internes uniques: ${internalLinks.length}`);

  const testResults = {
    working: [],
    broken: [],
    notTested: []
  };

  // Test first 30 internal links
  const toTest = internalLinks.slice(0, 30);
  
  for (const link of toTest) {
    let testPage;
    try {
      testPage = await browser.newPage();
      const testUrl = link.href.startsWith('/') ? BASE_URL + link.href : BASE_URL + '/' + link.href;
      
      const response = await testPage.goto(testUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });

      const status = response.status();
      
      if (status >= 200 && status < 400) {
        testResults.working.push({ href: link.href, status });
        console.log(`  ✓ ${link.href.padEnd(40)} (${status})`);
      } else {
        testResults.broken.push({ href: link.href, status });
        console.log(`  ✗ ${link.href.padEnd(40)} (${status})`);
      }

      await testPage.close();
    } catch (err) {
      testResults.broken.push({ href: link.href, error: err.message.substring(0, 30) });
      console.log(`  ✗ ${link.href.padEnd(40)} (ERR)`);
      if (testPage) await testPage.close();
    }
  }

  if (internalLinks.length > 30) {
    testResults.notTested = internalLinks.slice(30).map(l => l.href);
  }

  return testResults;
}

async function main() {
  console.log('🚀 TESTEUR DE LIENS PROQUELEC');
  console.log('='.repeat(70));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Pages à tester: ${PAGES.length}\n`);

  let browser;
  
  try {
    browser = await chromium.launch({ headless: true });
    
    // Test all pages
    for (const pageInfo of PAGES) {
      await testPage(browser, pageInfo);
    }

    // Test internal links
    const linkTestResults = await testInternalLinks(browser);

    // Generate summary
    results.summary = {
      totalPagesTested: results.pages.length,
      pagesWorking: results.workingPages.length,
      pagesBroken: results.brokenPages.length,
      totalLinksFound: Array.from(results.allLinks.keys()).length,
      internalLinksWorking: linkTestResults.working.length,
      internalLinksBroken: linkTestResults.broken.length,
      internalLinksNotTested: linkTestResults.notTested.length
    };

    // Save full report
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      summary: results.summary,
      pages: results.pages,
      linkTests: linkTestResults,
      allUniqueLinks: Array.from(results.allLinks.entries()).map(([href, data]) => ({
        href,
        foundOn: data.foundOn
      }))
    };

    fs.writeFileSync('link-test-report.json', JSON.stringify(report, null, 2));
    console.log(`\n📊 Rapport complet sauvegardé: link-test-report.json`);

    // Display summary
    console.log('\n' + '='.repeat(70));
    console.log('📈 RÉSUMÉ');
    console.log('='.repeat(70));
    console.log(`✅ Pages fonctionnelles: ${results.summary.pagesWorking}/${results.summary.totalPagesTested}`);
    console.log(`❌ Pages cassées: ${results.summary.pagesBroken}/${results.summary.totalPagesTested}`);
    console.log(`📍 Total liens uniques trouvés: ${results.summary.totalLinksFound}`);
    console.log(`✓ Liens internes testés (OK): ${results.summary.internalLinksWorking}`);
    console.log(`✗ Liens internes testés (ERREUR): ${results.summary.internalLinksBroken}`);
    console.log(`⏭️  Liens non testés: ${results.summary.internalLinksNotTested}`);

    // Pages working list
    if (results.workingPages.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('✅ PAGES FONCTIONNELLES');
      console.log('='.repeat(70));
      results.workingPages.forEach(p => {
        console.log(`  ${p.path.padEnd(25)} | ${p.totalLinks} liens | ${p.title.substring(0, 40)}`);
      });
    }

    // Pages broken list
    if (results.brokenPages.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('❌ PAGES CASSÉES OU INACCESSIBLES');
      console.log('='.repeat(70));
      results.brokenPages.forEach(p => {
        const msg = p.error ? p.error.substring(0, 40) : `Status ${p.status}`;
        console.log(`  ${p.path.padEnd(25)} | ${msg}`);
      });
    }

    // Broken links
    if (linkTestResults.broken.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('🔴 LIENS INTERNES CASSÉS (testés)');
      console.log('='.repeat(70));
      linkTestResults.broken.slice(0, 15).forEach(l => {
        console.log(`  ${l.href.padEnd(40)} | Status: ${l.status || 'Error'}`);
      });
      if (linkTestResults.broken.length > 15) {
        console.log(`  ... et ${linkTestResults.broken.length - 15} autres`);
      }
    }

    process.exit(0);

  } catch (error) {
    console.error('ERREUR FATALE:', error);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

main();
