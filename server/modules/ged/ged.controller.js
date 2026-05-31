const repo = require('./ged.repository');
const { sendSseEvent } = require('../../core/sse');

async function listDocuments(req, res) {
    try {
        const docs = await repo.listDocuments();
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createDocument(req, res) {
    const { title, description, file_url } = req.body;
    try {
        const doc = await repo.createDocument({ title, description, file_url, uploaderId: req.user.id });
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteDocument(req, res) {
    try {
        await repo.deleteDocument(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function transition(req, res) {
    try {
        const { entity, id } = req.params;
        const { to_state: toState, comment } = req.body;
        const normalizedTarget = String(toState || '').toLowerCase();

        if (!repo.GED_WORKFLOW_ENTITIES[entity]) {
            return res.status(400).json({ error: 'Type d\'entité GED invalide', valid_entities: Object.keys(repo.GED_WORKFLOW_ENTITIES) });
        }
        if (!repo.GED_WORKFLOW_STATES.includes(normalizedTarget)) {
            return res.status(400).json({ error: 'Etat de workflow invalide', valid_states: repo.GED_WORKFLOW_STATES });
        }

        const entityRecord = await repo.getEntity(entity, id);
        if (!entityRecord) return res.status(404).json({ error: 'Entité GED introuvable' });

        const fromState = entityRecord.workflow_state || 'draft';
        if (fromState === normalizedTarget) {
            return res.status(400).json({ error: 'L\'entité est déjà dans cet état' });
        }

        const allowed = repo.GED_WORKFLOW_TRANSITIONS[fromState] || [];
        if (!allowed.includes(normalizedTarget)) {
            return res.status(400).json({ error: 'Transition de workflow non autorisée', from: fromState, to: normalizedTarget, allowed });
        }

        const updated = await repo.updateEntityState(entity, id, normalizedTarget);

        await repo.recordTransition({
            entityId: id,
            entityType: repo.GED_WORKFLOW_ENTITIES[entity].type,
            fromState,
            toState: normalizedTarget,
            changedBy: req.user.id,
            comment
        });

        try {
            sendSseEvent('ged:transition', {
                id, entity_type: repo.GED_WORKFLOW_ENTITIES[entity].type,
                from_state: fromState, to_state: normalizedTarget,
                changed_by: req.user.id, comment,
                timestamp: new Date().toISOString()
            });
        } catch (err) {
            console.warn('[GED] SSE broadcast failed:', err.message);
        }

        res.json({ success: true, entity: repo.GED_WORKFLOW_ENTITIES[entity].type, entity_id: id, from_state: fromState, to_state: normalizedTarget, record: updated });
    } catch (err) {
        console.error('[GED] Transition failed:', err);
        res.status(500).json({ error: 'Erreur de transition de workflow', details: err.message });
    }
}

async function history(req, res) {
    try {
        const { entity, id } = req.params;
        const transitions = await repo.getTransitionHistory(entity, id);
        if (!transitions) {
            return res.status(400).json({ error: 'Type d\'entité GED invalide', valid_entities: Object.keys(repo.GED_WORKFLOW_ENTITIES) });
        }
        res.json({ entity: repo.GED_WORKFLOW_ENTITIES[entity].type, entity_id: id, history: transitions });
    } catch (err) {
        console.error('[GED] Fetch history failed:', err);
        res.status(500).json({ error: 'Impossible de récupérer l\'historique de workflow', details: err.message });
    }
}

async function config(req, res) {
    res.json(repo.getWorkflowConfig());
}

module.exports = {
    listDocuments, createDocument, deleteDocument,
    transition, history, config
};
