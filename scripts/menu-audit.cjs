const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function check() {
    try {
        const { rows: items } = await pool.query('SELECT id, title, url, menu_type, parent_id, menu_order, is_active FROM public.menu_items ORDER BY menu_type, menu_order');

        const tree = {};
        const roots = [];

        items.forEach(item => {
            tree[item.id] = { ...item, children: [] };
        });

        items.forEach(item => {
            if (item.parent_id && tree[item.parent_id]) {
                tree[item.parent_id].children.push(tree[item.id]);
            } else {
                roots.push(tree[item.id]);
            }
        });

        function printTree(node, indent = '') {
            console.log(`${indent}${node.is_active ? '[OK]' : '[XX]'} ${node.title} (${node.url}) [${node.menu_type}]`);
            node.children.sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0)).forEach(child => printTree(child, indent + '  '));
        }

        console.log('MENU STRUCTURE AUDIT:');
        roots.forEach(root => printTree(root));

    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}

check();
