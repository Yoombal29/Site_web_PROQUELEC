const { Client } = require('pg');
require('dotenv').config();

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const r = await c.query(
    `SELECT id, title, url, menu_type, parent_id, menu_order, is_active, label, icon
     FROM public.menu_items
     ORDER BY menu_type, menu_order, parent_id NULLS FIRST`
  );
  console.log('Total menu_items:', r.rows.length, '\n');
  const byType = {};
  r.rows.forEach((row) => {
    if (!byType[row.menu_type]) byType[row.menu_type] = [];
    byType[row.menu_type].push(row);
  });
  for (const [type, items] of Object.entries(byType)) {
    console.log('=== ' + type + ' (' + items.length + ') ===');
    items.forEach((i) => {
      const indent = i.parent_id ? '  ' : '';
      const badge = i.label ? ' (badge:' + i.label + ')' : '';
      const inact = i.is_active ? '' : ' [INACTIF]';
      console.log(indent + '[' + i.menu_order + '] ' + i.title + ' -> ' + i.url + inact + badge);
    });
    console.log('');
  }
  await c.end();
})();
