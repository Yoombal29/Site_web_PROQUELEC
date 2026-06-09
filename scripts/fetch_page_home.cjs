const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config();

const API_ROOT = process.env.VITE_API_URL || 'http://localhost:3010';
const OUT = 'tmp/page_home.json';

(async () => {
  try {
    const res = await fetch(`${API_ROOT}/api/admin/pages/home`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    fs.mkdirSync('tmp', { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(data, null, 2));
    console.log('Saved', OUT);
  } catch (e) {
    console.error('Error fetching page:', e.message || e);
    process.exitCode = 1;
  }
})();
