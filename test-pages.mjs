async function testPages() {
  console.log('🔍 Testing API endpoints:\n');

  const endpoints = [
    'http://localhost:3010/api/pages/slug/home',
    'http://localhost:3010/api/pages/slug/a-propos', 
    'http://localhost:3010/api/pages/slug/services',
    'http://localhost:3010/api/pages/slug/contact'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      const slug = endpoint.split('/').pop();
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${slug.padEnd(15)} - Title: "${data.title}"`);
      } else {
        console.log(`❌ ${slug.padEnd(15)} - Status: ${response.status}`);
      }
    } catch (err) {
      const slug = endpoint.split('/').pop();
      console.log(`❌ ${slug.padEnd(15)} - Error: ${err.message}`);
    }
  }

  console.log('\n✅ API test complete!');
}

testPages();
