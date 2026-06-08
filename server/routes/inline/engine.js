const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

function mountEngineRoutes(app) {
  // Memory
  app.get('/api/engine/memory', (req, res) => {
    const memoryPath = path.join(__dirname, '../../src/engine/memory/error-memory.json');
    if (fs.existsSync(memoryPath)) {
      const memory = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
      return res.json(memory);
    }
    res.json([]);
  });

  // Scan
  app.post('/api/engine/scan', (req, res) => {
    const scriptPath = path.join(__dirname, '../../proquelec-ultra-ai.mjs');
    const child = spawn('node', [scriptPath]);
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    child.on('close', (code) => {
      const cleanOutput = output.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '').trim();
      const issues = [];
      const lines = cleanOutput.split('\n');
      lines.forEach((line) => {
        if (
          line.toLowerCase().includes('error') ||
          line.toLowerCase().includes('warning') ||
          line.toLowerCase().includes('issue')
        ) {
          const match = line.match(/^(.*?):(\d+):(\d+):\s*(.*)$/);
          if (match) {
            issues.push({
              type: 'issue',
              issue: match[4],
              file: `${match[1]}:${match[2]}:${match[3]}`,
            });
          } else {
            issues.push({ type: 'issue', issue: line.trim() });
          }
        }
      });
      res.json({ success: code === 0, issues, rawOutput: output.substring(0, 5000) });
    });
    child.on('error', (err) => res.status(500).json({ success: false, error: err.message }));
  });

  // Repair
  app.post('/api/engine/repair', (req, res) => {
    const { file, issue } = req.body;
    const scriptPath = path.join(__dirname, '../../proquelec-ultra-ai.mjs');
    const args = ['--repair'];
    if (file) args.push(`--file=${file}`);
    const child = spawn('node', [scriptPath, ...args]);
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    child.on('close', (code) => {
      res.json({
        success: code === 0,
        message: code === 0 ? 'Réparation terminée' : 'Erreur lors de la réparation',
        output,
      });
    });
    child.on('error', (err) => res.status(500).json({ success: false, error: err.message }));
  });
}

module.exports = { mountEngineRoutes };
