const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 5175,
  path: '/api/pages',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const pages = JSON.parse(data);
      
      console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
      console.log('║                    LISTE COMPLÈTE DES PAGES                            ║');
      console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

      console.log(`Total: ${pages.length} pages\n`);

      const headers = ['ID', 'SLUG', 'TITLE', 'STATUS', 'PUBLISHED'];
      console.log(
        headers[0].padEnd(5) + ' | ' +
        headers[1].padEnd(30) + ' | ' +
        headers[2].padEnd(35) + ' | ' +
        headers[3].padEnd(12) + ' | ' +
        headers[4]
      );
      console.log('-'.repeat(120));

      pages.forEach((page) => {
        const status = page.status || 'unknown';
        const published = page.is_published ? '✅ YES' : '❌ NO';
        
        console.log(
          (page.id || '-').toString().padEnd(5) + ' | ' +
          (page.slug || '-').substring(0, 30).padEnd(30) + ' | ' +
          (page.title || '-').substring(0, 35).padEnd(35) + ' | ' +
          status.padEnd(12) + ' | ' +
          published
        );
      });

      console.log('\n📊 Statistiques:');
      console.log(`  • Total pages: ${pages.length}`);
      console.log(`  • Published: ${pages.filter(p => p.is_published).length}`);
      console.log(`  • Drafts: ${pages.filter(p => !p.is_published).length}`);
      
    } catch (err) {
      console.error('❌ Error parsing response:', err.message);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request error:', err.message);
});

req.end();
