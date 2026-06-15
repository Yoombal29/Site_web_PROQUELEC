const fs = require('fs');
const code = fs.readFileSync('server/seed_premium_pages.js', 'utf8');
const regex = /^\s*'(.*)':\s*\{/gm;
let match;
console.log('Seeded pages in seed_premium_pages.js:');
while ((match = regex.exec(code)) !== null) {
  console.log(`- ${match[1]}`);
}
