// Master seed orchestrator — runs all seeders in dependency order.
'use strict';

const { getPool, closePool } = require('./seed-utils.cjs');

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('   PROQUELEC — Seed Engine');
  console.log('═══════════════════════════════════════════');
  console.log('');

  const startTime = Date.now();

  try {
    // Phase 1: Users (no dependencies)
    const { seed: seedUsers } = require('./seed-users.cjs');
    await seedUsers();

    // Phase 2: Settings, menus, partners (no deps)
    const { seed: seedSettings } = require('./seed-settings.cjs');
    await seedSettings();

    // Phase 3: Pages with content_blocks (depends on users for authorship)
    const { seed: seedPages } = require('./seed-pages.cjs');
    await seedPages();

    // Phase 4: Blog categories + posts (no deps)
    const { seed: seedBlog } = require('./seed-blog.cjs');
    await seedBlog();

    // Phase 5: Academy data (no deps)
    const { seed: seedAcademy } = require('./seed-academy.cjs');
    await seedAcademy();

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log(`   ✅ Seed completed in ${duration}s`);
    console.log('═══════════════════════════════════════════');
    console.log('');
  } catch (err) {
    console.error('');
    console.error('  ❌ Seed failed:', err.message);
    console.error('');
    process.exit(1);
  } finally {
    await closePool();
  }
}

main();
