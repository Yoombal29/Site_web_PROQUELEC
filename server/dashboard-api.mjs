import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AstraEngine } from '../scanner/astra-engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.DASHBOARD_PORT || 4000;

// Instance du moteur pour le suivi live
const engine = new AstraEngine({ isRepairMode: false });

// Chemins de données
const PROJECT_ROOT = path.join(__dirname, '..');
const MEMORY_PATH = path.join(PROJECT_ROOT, 'src/engine/memory/error-memory.json');
const LOG_PATH = path.join(PROJECT_ROOT, 'src/engine/logs/scans.log');

app.use(express.static(PROJECT_ROOT));

// Endpoint principal pour le Dashboard
app.get('/api/dashboard/stats', (req, res) => {
    try {
        let memory = [];
        if (fs.existsSync(MEMORY_PATH)) {
            try { memory = JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8')); } catch (e) { memory = []; }
        }

        // Lecture des fichiers récents dans les logs
        let lastFiles = [];
        if (fs.existsSync(LOG_PATH)) {
            const logs = fs.readFileSync(LOG_PATH, 'utf8').split('\n').filter(l => l.trim());
            lastFiles = logs.slice(-15).reverse();
        }

        // Simuler des métriques historiques (pour le graphique Chart.js)
        const history = {
            labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Aujourd\'hui'],
            issues: [45, 32, 28, 15, 8, memory.length],
            fixes: [20, 18, 25, 12, 6, memory.length * 0.8]
        };

        res.json({
            status: 'online',
            engineVersion: '3.2',
            issuesDetected: memory.length, // Basé sur la mémoire des erreurs résolues ou suivies
            fixesApplied: memory.filter(m => m.status === 'fixed' || m.repair_count > 0).length,
            lastFiles,
            history,
            endpoints: [
                { name: 'Standard SEO', path: '/api/electrical-standards/code/:code', status: 'active', latency: '45ms' },
                { name: 'Blog Engine', path: '/api/blog-posts', status: 'active', latency: '62ms' },
                { name: 'Expert Lab', path: '/api/events', status: 'active', latency: '54ms' },
                { name: 'Content AI', path: '/api/ai/content-generation', status: 'active', latency: '850ms' }
            ]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 [MONITOR] Dashboard API running at http://localhost:${PORT}/api/dashboard/stats`);
    console.log(`📊 [MONITOR] Serve dashboard.html to visualize metrics.\n`);
});
