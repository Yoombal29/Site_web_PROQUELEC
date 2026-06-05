/**
 * Orchestrateur de Synchronisation COSSUEL
 * 
 * Rôle :
 * - Planifier les syncs (Cron / Interval)
 * - Appeler l'adaptateur
 * - Sauvegarder dans le Data Warehouse
 * - Gérer les erreurs et logs
 */

const adapter = require('./cossuel-adapter');
const { Pool } = require('pg');

let pool; // Sera injecté depuis server/index.js

const SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1 heure

async function tableExists(client, tableName) {
    const result = await client.query('SELECT to_regclass($1) AS exists', [tableName]);
    return !!(result.rows && result.rows[0] && result.rows[0].exists);
}

async function startSyncEngine(dbPool) {
    console.log('🚀 [SYNC-ENGINE] Démarrage du moteur de synchronisation COSSUEL...');
    pool = dbPool;

    // Lancer une première sync immédiate (non-bloquante)
    runSyncCycle().catch(err => console.error('[SYNC-ENGINE] Cycle initial échoué:', err));

    // Planifier les syncs récurrentes
    setInterval(() => {
        runSyncCycle().catch(err => console.error('[SYNC-ENGINE] Cycle récurrent échoué:', err));
    }, SYNC_INTERVAL_MS);
}

async function runSyncCycle() {
    console.log(`📡 [SYNC-ENGINE] Début du cycle de synchronisation...`);
    const startTime = new Date();
    let recordsProcessed = 0;
    let errorsCount = 0;

    try {
        // 1. Authentification
        await adapter.authenticate();

        // 2. Récupérer les données
        const dossiers = await adapter.fetchRecentDossiers(7);
        console.log(`📦 [SYNC-ENGINE] ${dossiers.length} dossiers récupérés depuis COSSUEL.`);

        // 3. Sauvegarder dans Data Warehouse
        // Vérifier l'existence des tables attendues avant d'écrire
        const client = await pool.connect();
        try {
            const hasDossiers = await tableExists(client, 'public.cossuel_dossiers');
            const hasLogs = await tableExists(client, 'public.cossuel_sync_logs');
            const hasStats = await tableExists(client, 'public.cossuel_stats_daily');

            if (!hasDossiers) {
                console.warn('⚠️ [SYNC-ENGINE] Table `public.cossuel_dossiers` manquante — écriture ignorée.');
            }
            if (!hasLogs) {
                console.warn('⚠️ [SYNC-ENGINE] Table `public.cossuel_sync_logs` manquante — logs de sync non enregistrés.');
            }
            if (!hasStats) {
                console.warn('⚠️ [SYNC-ENGINE] Table `public.cossuel_stats_daily` manquante — stats journalières non mises à jour.');
            }

            if (hasDossiers) {
                try {
                    await client.query('BEGIN');

                    for (const dossier of dossiers) {
                        // Upsert Dossier
                        await client.query(`
                            INSERT INTO public.cossuel_dossiers (id, region, status, installation_type, submission_date)
                            VALUES ($1, $2, $3, $4, $5)
                            ON CONFLICT (id) DO UPDATE 
                            SET status = EXCLUDED.status, 
                                last_sync_at = NOW();
                        `, [dossier.id, dossier.region, dossier.status, dossier.type, dossier.date]);

                        recordsProcessed++;
                    }

                    // 4. Mettre à jour les stats journalières si la table existe
                    if (hasStats) {
                        const today = new Date().toISOString().split('T')[0];
                        await client.query(`
                            INSERT INTO public.cossuel_stats_daily (date, total_dossiers, updated_at)
                            VALUES ($1, $2, NOW())
                            ON CONFLICT (date) DO UPDATE
                            SET total_dossiers = cossuel_stats_daily.total_dossiers + $2, updated_at = NOW();
                        `, [today, recordsProcessed]);
                    }

                    await client.query('COMMIT');
                    console.log(`✅ [SYNC-ENGINE] Cycle terminé avec succès. ${recordsProcessed} enregistrements traités.`);

                } catch (dbError) {
                    await client.query('ROLLBACK');
                    throw dbError;
                }
            } else {
                console.log('ℹ️ [SYNC-ENGINE] Ignoré: pas de tables cossuel présentes pour inscription.');
            }

            // Log Success if logs table exists
            if (hasLogs) {
                try {
                    await logSync(client, startTime, 'SUCCESS', recordsProcessed, 0, 'Cycle complet OK');
                } catch (e) {
                    console.error('Impossible d\'enregistrer le log de sync:', e.message || e);
                }
            }

        } finally {
            client.release();
        }

    } catch (error) {
        const isConfigError = error && error.code === 'CONFIG_ERROR';
        const level = isConfigError ? 'warn' : 'error';
        console[level](`${isConfigError ? '⚠️' : '❌'} [SYNC-ENGINE] ${isConfigError ? 'Synchronisation ignorée' : 'Erreur critique'}:`, error.message);
        errorsCount++;
        // Log Error (si possible)
        let client;
        try {
            client = await pool.connect();
            if (await tableExists(client, 'public.cossuel_sync_logs')) {
                await logSync(client, startTime, isConfigError ? 'WARNING' : 'ERROR', recordsProcessed, errorsCount, error.message);
            } else {
                console.warn('⚠️ [SYNC-ENGINE] Table `public.cossuel_sync_logs` manquante — erreur non enregistrée.');
            }
        } catch (e) {
            console.error('Impossible de logger l\'erreur sync', e.message || e);
        } finally {
            client?.release();
        }
    }
}

async function logSync(client, startTime, status, processed, errors, details) {
    await client.query(`
        INSERT INTO public.cossuel_sync_logs (started_at, finished_at, status, records_processed, errors_count, details)
        VALUES ($1, NOW(), $2, $3, $4, $5)
    `, [startTime, status, processed, errors, details]);
}

module.exports = { startSyncEngine, runSyncCycle };
