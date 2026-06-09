const fs = require('fs');
const path = require('path');

console.log("╔═══════════════════════════════════════════════════════════╗");
console.log("║          AUDIT DES DOUBLONS - PROQUELEC                  ║");
console.log("╚═══════════════════════════════════════════════════════════╝\n");

// === 1. BACKEND: Duplicate API routes in server/index.js ===
console.log("═══ [1] DOUBLONS DE ROUTES API (server/index.js) ═══\n");

const serverCode = fs.readFileSync(path.join(__dirname, 'server', 'index.js'), 'utf-8');
const routeRegex = /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
const routes = [];
let match;

while ((match = routeRegex.exec(serverCode)) !== null) {
    const lineNum = serverCode.substring(0, match.index).split('\n').length;
    routes.push({
        method: match[1].toUpperCase(),
        path: match[2],
        line: lineNum,
        key: `${match[1].toUpperCase()} ${match[2]}`
    });
}

// Find duplicates
const routeCount = {};
routes.forEach(r => {
    if (!routeCount[r.key]) routeCount[r.key] = [];
    routeCount[r.key].push(r);
});

let dupRouteCount = 0;
Object.entries(routeCount).forEach(([key, entries]) => {
    if (entries.length > 1) {
        dupRouteCount++;
        console.log(`  ❌ DOUBLON: ${key}`);
        entries.forEach(e => console.log(`     └─ Ligne ${e.line}`));
    }
});

if (dupRouteCount === 0) {
    console.log("  ✅ Aucun doublon de route détecté.");
} else {
    console.log(`\n  ⚠️  ${dupRouteCount} doublons de routes trouvés!`);
}

// Also check extra_routes.js
const extraRoutesPath = path.join(__dirname, 'server', 'extra_routes.js');
if (fs.existsSync(extraRoutesPath)) {
    const extraCode = fs.readFileSync(extraRoutesPath, 'utf-8');
    const extraRouteRegex = /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let extraMatch;
    const extraRoutes = [];
    while ((extraMatch = extraRouteRegex.exec(extraCode)) !== null) {
        extraRoutes.push({
            method: extraMatch[1].toUpperCase(),
            path: extraMatch[2],
            key: `${extraMatch[1].toUpperCase()} ${extraMatch[2]}`
        });
    }

    console.log("\n  --- Doublons entre index.js et extra_routes.js ---");
    let crossDups = 0;
    extraRoutes.forEach(er => {
        const mainMatch = routes.filter(r => r.key === er.key);
        if (mainMatch.length > 0) {
            crossDups++;
            console.log(`  ❌ CONFLIT: ${er.key} (index.js:L${mainMatch[0].line} ↔ extra_routes.js)`);
        }
    });
    if (crossDups === 0) console.log("  ✅ Aucun conflit entre fichiers de routes.");
}

// === 2. Check server/routes/*.js for duplicates with index.js ===
console.log("\n\n═══ [2] DOUBLONS ENTRE index.js ET server/routes/*.js ═══\n");
const routesDir = path.join(__dirname, 'server', 'routes');
if (fs.existsSync(routesDir)) {
    const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
    let routeFileDups = 0;

    routeFiles.forEach(file => {
        const code = fs.readFileSync(path.join(routesDir, file), 'utf-8');
        const regex = /(?:router|app)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
        let m;
        while ((m = regex.exec(code)) !== null) {
            const routePath = m[2];
            // Check if this path appears in index.js routes
            const conflicts = routes.filter(r => r.path.includes(routePath) || routePath.includes(r.path));
            if (conflicts.length > 0) {
                routeFileDups++;
                console.log(`  ⚠️  routes/${file}: ${m[1].toUpperCase()} ${routePath}`);
                conflicts.forEach(c => console.log(`     └─ Possible conflit avec index.js:L${c.line} → ${c.key}`));
            }
        }
    });

    if (routeFileDups === 0) console.log("  ✅ Aucun conflit détecté.");
}

// === 3. FRONTEND: Duplicate hooks ===
console.log("\n\n═══ [3] DOUBLONS DE HOOKS FRONTEND ═══\n");
const hooksDir = path.join(__dirname, 'src', 'hooks');
const hookFiles = fs.readdirSync(hooksDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

// Check for hooks that call same endpoints
const hookEndpoints = {};
hookFiles.forEach(file => {
    const code = fs.readFileSync(path.join(hooksDir, file), 'utf-8');
    const fetchRegex = /(?:fetch|apiFetch)\s*[<(]\s*['"`]([^'"`]+)['"`]/g;
    let m;
    while ((m = fetchRegex.exec(code)) !== null) {
        const endpoint = m[1];
        if (!hookEndpoints[endpoint]) hookEndpoints[endpoint] = [];
        hookEndpoints[endpoint].push(file);
    }
});

let hookDupCount = 0;
Object.entries(hookEndpoints).forEach(([endpoint, files]) => {
    const uniqueFiles = [...new Set(files)];
    if (uniqueFiles.length > 1) {
        hookDupCount++;
        console.log(`  ⚠️  Endpoint "${endpoint}" appelé par plusieurs hooks:`);
        uniqueFiles.forEach(f => console.log(`     └─ ${f}`));
    }
});

if (hookDupCount === 0) {
    console.log("  ✅ Aucun doublon d'appels API entre hooks.");
}

// === 4. Check for duplicate component files ===
console.log("\n\n═══ [4] DOUBLONS DE COMPOSANTS ═══\n");
const srcDir = path.join(__dirname, 'src');

function getAllFiles(dir, ext = ['.tsx', '.ts']) {
    let results = [];
    try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory() && !item.includes('node_modules')) {
                results = results.concat(getAllFiles(fullPath, ext));
            } else if (ext.some(e => item.endsWith(e))) {
                results.push({ name: item, path: fullPath, dir: path.relative(srcDir, dir) });
            }
        });
    } catch (e) { }
    return results;
}

const allFiles = getAllFiles(srcDir);
const fileNameMap = {};
allFiles.forEach(f => {
    const baseName = f.name.replace(/\.(tsx?|jsx?)$/, '');
    if (!fileNameMap[baseName]) fileNameMap[baseName] = [];
    fileNameMap[baseName].push(f);
});

let compDupCount = 0;
Object.entries(fileNameMap).forEach(([name, files]) => {
    if (files.length > 1) {
        // Filter out index files and test files
        const meaningful = files.filter(f => f.name !== 'index.ts' && f.name !== 'index.tsx' && !f.name.includes('.test.'));
        if (meaningful.length > 1) {
            compDupCount++;
            console.log(`  ⚠️  "${name}" existe dans ${meaningful.length} emplacements:`);
            meaningful.forEach(f => console.log(`     └─ ${f.dir}/${f.name}`));
        }
    }
});

if (compDupCount === 0) {
    console.log("  ✅ Aucun doublon de composants.");
}

// === 5. Check for duplicate page routes in App.tsx ===
console.log("\n\n═══ [5] DOUBLONS DE ROUTES FRONTEND (App.tsx) ═══\n");
const appPath = path.join(srcDir, 'App.tsx');
if (fs.existsSync(appPath)) {
    const appCode = fs.readFileSync(appPath, 'utf-8');
    const routePathRegex = /path\s*[:=]\s*['"`]([^'"`]+)['"`]/g;
    const frontendRoutes = {};
    let rm;
    while ((rm = routePathRegex.exec(appCode)) !== null) {
        const rPath = rm[1];
        if (!frontendRoutes[rPath]) frontendRoutes[rPath] = [];
        frontendRoutes[rPath].push(appCode.substring(0, rm.index).split('\n').length);
    }

    let routeDupCount = 0;
    Object.entries(frontendRoutes).forEach(([rPath, lines]) => {
        if (lines.length > 1) {
            routeDupCount++;
            console.log(`  ❌ DOUBLON DE ROUTE: path="${rPath}" — lignes: ${lines.join(', ')}`);
        }
    });

    if (routeDupCount === 0) {
        console.log("  ✅ Aucun doublon de route frontend.");
    }
}

// === 6. Database: Check for duplicate data entries ===
console.log("\n\n═══ [6] DOUBLONS DE DONNÉES EN BASE ═══\n");
const { Pool } = require(path.join(__dirname, 'server', 'node_modules', 'pg'));
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
    try {
        // Duplicate site_settings rows
        const ssCount = await pool.query("SELECT count(*) as c FROM site_settings");
        if (parseInt(ssCount.rows[0].c) > 1) {
            console.log(`  ❌ site_settings: ${ssCount.rows[0].c} lignes (devrait être 1)`);
            const ssRows = await pool.query("SELECT id, site_name FROM site_settings ORDER BY id");
            ssRows.rows.forEach(r => console.log(`     └─ id=${r.id}: ${r.site_name}`));
        } else {
            console.log(`  ✅ site_settings: 1 ligne unique`);
        }

        // Duplicate menu items (same title + url + menu_type)
        const menuDups = await pool.query(`
            SELECT title, url, menu_type, count(*) as cnt 
            FROM menu_items 
            GROUP BY title, url, menu_type 
            HAVING count(*) > 1
        `);
        if (menuDups.rows.length > 0) {
            console.log(`  ❌ menu_items: ${menuDups.rows.length} groupes de doublons:`);
            menuDups.rows.forEach(r => console.log(`     └─ "${r.title}" (${r.menu_type}) → ${r.cnt}x`));
        } else {
            console.log("  ✅ menu_items: Aucun doublon");
        }

        // Duplicate pages (same slug)
        const pageDups = await pool.query(`
            SELECT slug, count(*) as cnt 
            FROM pages 
            GROUP BY slug 
            HAVING count(*) > 1
        `);
        if (pageDups.rows.length > 0) {
            console.log(`  ❌ pages: ${pageDups.rows.length} slugs dupliqués:`);
            pageDups.rows.forEach(r => console.log(`     └─ slug="${r.slug}" → ${r.cnt}x`));
        } else {
            console.log("  ✅ pages: Aucun slug dupliqué");
        }

        // Duplicate blog posts (same slug)
        const blogDups = await pool.query(`
            SELECT slug, count(*) as cnt 
            FROM blog_posts 
            GROUP BY slug 
            HAVING count(*) > 1
        `);
        if (blogDups.rows.length > 0) {
            console.log(`  ❌ blog_posts: ${blogDups.rows.length} slugs dupliqués:`);
            blogDups.rows.forEach(r => console.log(`     └─ slug="${r.slug}" → ${r.cnt}x`));
        } else {
            console.log("  ✅ blog_posts: Aucun slug dupliqué");
        }

        // Duplicate users (same email)
        const userDups = await pool.query(`
            SELECT email, count(*) as cnt 
            FROM users 
            GROUP BY email 
            HAVING count(*) > 1
        `);
        if (userDups.rows.length > 0) {
            console.log(`  ❌ users: ${userDups.rows.length} emails dupliqués:`);
            userDups.rows.forEach(r => console.log(`     └─ "${r.email}" → ${r.cnt}x`));
        } else {
            console.log("  ✅ users: Aucun email dupliqué");
        }

        // Duplicate construction_mode entries
        const cmCount = await pool.query("SELECT count(*) as c FROM construction_mode");
        if (parseInt(cmCount.rows[0].c) > 1) {
            console.log(`  ⚠️  construction_mode: ${cmCount.rows[0].c} lignes (devrait être 1)`);
        } else {
            console.log(`  ✅ construction_mode: ${cmCount.rows[0].c} ligne(s)`);
        }

        // Duplicate theme_settings
        const tsCount = await pool.query("SELECT count(*) as c FROM theme_settings");
        if (parseInt(tsCount.rows[0].c) > 1) {
            console.log(`  ❌ theme_settings: ${tsCount.rows[0].c} lignes (devrait être 1)`);
        } else {
            console.log(`  ✅ theme_settings: 1 ligne unique`);
        }

    } catch (err) {
        console.error("  Erreur DB:", err.message);
    } finally {
        await pool.end();
    }

    // === FINAL SUMMARY ===
    console.log("\n\n╔═══════════════════════════════════════════════════════════╗");
    console.log("║                AUDIT TERMINÉ                              ║");
    console.log("╚═══════════════════════════════════════════════════════════╝");
})();
