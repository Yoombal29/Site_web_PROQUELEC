
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { AstraEngine } from './scanner/astra-engine.mjs';

const SRC_PATH = './src';
const MEMORY_PATH = './src/engine/memory/error-memory.json';
const LOG_PATH = './src/engine/logs/scans.log';

const args = process.argv.slice(2);
const isRepairMode = args.includes('--repair');
const targetFile = args.find(arg => arg.startsWith('--file='))?.split('=')[1];

const engine = new AstraEngine({ isRepairMode });

console.log(chalk.cyan.bold("\n╔══════════════════════════════════════════════╗"));
console.log(chalk.cyan.bold("║      PROQUELEC CORTEX AI - SCANNER V2.1      ║"));
console.log(chalk.cyan.bold("╚══════════════════════════════════════════════╝\n"));

let memory = [];
if (fs.existsSync(MEMORY_PATH)) {
    try { memory = JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8')); } catch (e) { }
}

const EXCLUDED_DIRS = ['node_modules', 'dist', '.next', 'build', '.git', 'server', 'tmp'];

function walk(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        const p = path.join(dir, f);

        // Audit #5: Protection récursive sur tout le chemin
        const isExcluded = EXCLUDED_DIRS.some(excl => p.split(path.sep).includes(excl));
        if (isExcluded) return;

        if (fs.statSync(p).isDirectory()) walk(p, callback);
        else if (f.endsWith('.ts') || f.endsWith('.tsx')) callback(p);
    });
}

const SCAN_TARGETS = ['./src', './server']; // On peut ajouter './frontend-next' plus tard

const filesToProcess = [];
SCAN_TARGETS.forEach(target => {
    walk(target, (p) => {
        if (p.endsWith('.tsx') || p.endsWith('.ts') || p.endsWith('.js') || p.endsWith('.mjs')) {
            if (!targetFile || p.includes(targetFile)) {
                filesToProcess.push(p);
            }
        }
    });
});

let totalIssues = 0;
let totalFixes = 0;

filesToProcess.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const result = engine.analyze(file, content);

        if (result.issues.length > 0) {
            totalIssues += result.issues.length;
            result.issues.forEach(issue => {
                const color = issue.type === 'VULN' ? chalk.red : (issue.type === 'WARN' ? chalk.yellow : chalk.blue);
                console.log(`${color(`[${issue.type}]`)} ${issue.msg} dans ${chalk.gray(file)}`);
            });
        }

        if (result.modified && isRepairMode) {
            fs.writeFileSync(file, result.code);
            totalFixes++;
            console.log(chalk.green.bold(`✨ REPARÉ : ${file}`));

            // Update memory
            const signature = engine.getSignature(content);
            memory.push({
                signature,
                errorMessage: result.issues[0]?.msg || "Structural Issue",
                context: "AST Analysis",
                applied_fix: `Auto-patch V2.1`,
                learned_from: file,
                success_count: 1,
                last_applied: new Date().toISOString()
            });
        }
    } catch (e) {
        console.log(chalk.bgRed(` ERREUR CRITIQUE `) + ` sur ${file}: ${e.message}`);
    }
});

if (isRepairMode) {
    fs.writeFileSync(MEMORY_PATH, JSON.stringify(memory.slice(-100), null, 2));
}

console.log(chalk.cyan(`\nSCAN TERMINÉ : ${engine.issues.length} problèmes trouvés, ${engine.fixes} réparations effectuées.`));
