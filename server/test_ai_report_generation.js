// 🤖Test de génération de Rapport IA pour inspection
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const API_URL = 'http://localhost:3000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

async function testAIReportGeneration() {
    try {
        console.log('🤖 TEST GÉNÉRATION RAPPORT IA');
        console.log('==============================\n');

        // Récupérer un utilisateur admin
        const userRes = await pool.query(
            `SELECT * FROM public.users WHERE role = 'admin' LIMIT 1`
        );

        if (userRes.rows.length === 0) {
            console.log('❌ Aucun admin trouvé.');
            return;
        }

        const user = userRes.rows[0];
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, JWT_SECRET, { expiresIn: '1d' });

        console.log(`✅ Utilisateur: ${user.email}\n`);

        // Créer une inspection de test
        console.log('📋 Création d\'une inspection de test...');

        const projectRes = await pool.query('SELECT id FROM public.projects LIMIT 1');
        if (projectRes.rows.length === 0) {
            console.log('❌ Aucun projet trouvé.');
            return;
        }

        const projectId = projectRes.rows[0].id;

        const inspectionRes = await pool.query(
            `INSERT INTO public.inspections (project_id, overall_score, checklist, performed_by)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [
                projectId,
                87, // Score de test
                JSON.stringify({
                    categories: [
                        { name: 'Mise à la Terre', validated: 4, total: 4 },
                        { name: 'Protection', validated: 3, total: 4 },
                        { name: 'Câblage', validated: 2, total: 3 }
                    ]
                }),
                user.id
            ]
        );

        const inspectionId = inspectionRes.rows[0].id;
        console.log(`✅ Inspection créée: ${inspectionId}\n`);

        // Générer le rapport IA
        console.log('🧙‍♂️ Génération du rapport IA via Gemini...');
        const generateStart = Date.now();

        const reportRes = await fetch(`${API_URL}/inspections/${inspectionId}/generate-report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!reportRes.ok) {
            const error = await reportRes.json();
            console.log(`❌ Erreur: ${error.error}`);
            return;
        }

        const reportData = await reportRes.json();
        const generateDuration = Date.now() - generateStart;

        console.log(`✅ ${reportData.message}`);
        console.log(`⏱️  Temps de génération: ${generateDuration}ms\n`);

        console.log('📄 RAPPORT GÉNÉRÉ:');
        console.log('==================');
        console.log(reportData.report.substring(0, 500) + '...\n');

        console.log('📊 DÉTAILS:');
        console.log(`   - ID Inspection: ${reportData.inspection_id}`);
        console.log(`   - Généré le: ${new Date(reportData.generated_at).toLocaleString('fr-FR')}`);
        console.log(`   - Longueur rapport: ${reportData.report.length} caractères\n`);

        // Vérifier le stockage en DB
        const dbCheck = await pool.query(
            'SELECT ai_report, ai_report_generated_at FROM public.inspections WHERE id = $1',
            [inspectionId]
        );

        console.log('✅ Vérification stockage:');
        console.log(`   - Rapport en DB: ${dbCheck.rows[0].ai_report ? 'OUI' : 'NON'}`);
        console.log(`   - Date en DB: ${dbCheck.rows[0].ai_report_generated_at ? 'OUI' : 'NON'}\n`);

        console.log('🎉 TEST RÉUSSI!\n');

        // Nettoyage
        await pool.query('DELETE FROM public.inspections WHERE id = $1', [inspectionId]);
        console.log('🧹 Nettoyage effectué (inspection de test supprimée)');

    } catch (err) {
        console.error('❌ Erreur:', err.message);
        console.error(err);
    } finally {
        await pool.end();
    }
}

testAIReportGeneration();
