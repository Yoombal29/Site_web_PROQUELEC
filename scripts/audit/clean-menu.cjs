const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function cleanMenu() {
    try {
        console.log('🔍 Analyzing menu structure...\n');

        // Get all menu items
        const allMenus = await pool.query('SELECT * FROM menu_items ORDER BY menu_type, menu_order');
        console.log(`📊 Total menu items: ${allMenus.rows.length}\n`);

        // Group by type
        const byType = {
            main: allMenus.rows.filter(m => m.menu_type === 'main'),
            footer: allMenus.rows.filter(m => m.menu_type === 'footer'),
            social: allMenus.rows.filter(m => m.menu_type === 'social'),
        };

        console.log('📋 Breakdown by type:');
        console.log(`  - Main menu: ${byType.main.length} items`);
        console.log(`  - Footer menu: ${byType.footer.length} items`);
        console.log(`  - Social menu: ${byType.social.length} items\n`);

        // Find inactive menus
        const inactive = allMenus.rows.filter(m => !m.is_active);
        console.log(`⚠️  Inactive menus: ${inactive.length}`);
        if (inactive.length > 0) {
            console.log('   Items:', inactive.map(m => `"${m.title}"`).join(', '));
        }

        // Find potential duplicates (same title, different URLs or vice versa)
        const titleGroups = {};
        allMenus.rows.forEach(m => {
            const key = m.title.toLowerCase().trim();
            if (!titleGroups[key]) titleGroups[key] = [];
            titleGroups[key].push(m);
        });

        const suspiciousDupes = Object.entries(titleGroups).filter(([_, items]) => items.length > 1);
        console.log(`\n🔎 Potential duplicates (same title): ${suspiciousDupes.length} groups`);
        suspiciousDupes.forEach(([title, items]) => {
            console.log(`\n  "${title}" (${items.length} items):`);
            items.forEach(item => {
                console.log(`    - ID: ${item.id.substring(0, 8)}... | URL: ${item.url} | Active: ${item.is_active} | Order: ${item.menu_order}`);
            });
        });

        // Propose cleanup
        console.log('\n\n🧹 CLEANUP RECOMMENDATIONS:\n');

        let toDelete = [];

        // 1. Delete inactive menus
        if (inactive.length > 0) {
            console.log(`1️⃣  Delete ${inactive.length} inactive menu items`);
            toDelete.push(...inactive.map(m => m.id));
        }

        // 2. For duplicates, keep the one with lowest menu_order (oldest/first created)
        suspiciousDupes.forEach(([title, items]) => {
            if (items.length > 1) {
                // Sort by menu_order, keep first
                const sorted = items.sort((a, b) => a.menu_order - b.menu_order);
                const toKeep = sorted[0];
                const toRemove = sorted.slice(1);

                console.log(`2️⃣  For "${title}": Keep ID ${toKeep.id.substring(0, 8)}... (order: ${toKeep.menu_order}), remove ${toRemove.length} duplicate(s)`);
                toDelete.push(...toRemove.map(m => m.id));
            }
        });

        console.log(`\n📌 Total items to delete: ${toDelete.length}`);

        if (toDelete.length > 0) {
            console.log('\n⚠️  Do you want to proceed with cleanup? (This will delete the items listed above)');
            console.log('   To execute: Run this script with --execute flag\n');

            // Check if --execute flag is present
            if (process.argv.includes('--execute')) {
                console.log('🚀 Executing cleanup...');
                await pool.query('DELETE FROM menu_items WHERE id = ANY($1)', [toDelete]);
                console.log('✅ Cleanup complete!');

                // Reorder remaining items
                console.log('\n🔄 Reordering menu items...');
                const remaining = await pool.query('SELECT * FROM menu_items ORDER BY menu_type, menu_order');

                for (let i = 0; i < remaining.rows.length; i++) {
                    await pool.query('UPDATE menu_items SET menu_order = $1 WHERE id = $2', [i, remaining.rows[i].id]);
                }
                console.log('✅ Menu items reordered!');
            } else {
                console.log('ℹ️  No changes made. Add --execute to apply cleanup.');
            }
        } else {
            console.log('✅ No cleanup needed! Your menu is already clean.');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

cleanMenu();
