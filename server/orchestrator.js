const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * PROQUELEC CREWAI CORE Orchestrator
 * Bridge between Express and Python CrewAI Agents
 */
const orchestrate = async (req, res) => {
    const { userRole, requestType, mode, payload } = req.body;

    // 1. RBAC Check (Already done via middleware, but double check)
    const internalAgents = ["AdminProquelec", "Strategie"];
    if (internalAgents.includes(requestType) && !["admin", "secondary_admin"].includes(userRole)) {
        return res.status(403).json({ error: "Accès interdit aux outils internes" });
    }

    // 2. Prepare data for Python
    const inputData = JSON.stringify({
        userRole,
        requestType,
        mode: mode || "Gratuit",
        payload
    });

    // 3. Spawn Python process
    const pythonPath = path.join(__dirname, '..', '.venv', 'Scripts', 'python.exe');
    const scriptPath = path.join(__dirname, 'ai_agents', 'main_entry.py');

    const pythonProcess = spawn(pythonPath, [scriptPath]);

    let resultData = '';
    let errorData = '';

    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python process exited with code ${code}: ${errorData}`);
            return res.status(500).json({ error: "Erreur d'orchestration IA", details: errorData });
        }

        try {
            // Find the first occurrence of { and the last occurrence of } to extract JSON
            const jsonStart = resultData.indexOf('{');
            const jsonEnd = resultData.lastIndexOf('}');

            if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error("No JSON found in output");
            }

            const jsonStr = resultData.substring(jsonStart, jsonEnd + 1);
            const response = JSON.parse(jsonStr);

            if (response.error) {
                return res.status(400).json({ error: response.error });
            }
            res.json(response);
        } catch (e) {
            console.error("Failed to parse Python output. Raw output:", resultData);
            res.status(500).json({ error: "Réponse IA invalide", details: resultData });
        }
    });
};

module.exports = { orchestrate };
