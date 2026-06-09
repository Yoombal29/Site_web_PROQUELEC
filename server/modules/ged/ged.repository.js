const pool = require('../../core/database');

const GED_WORKFLOW_STATES = ['draft', 'review', 'published', 'archived'];
const GED_WORKFLOW_TRANSITIONS = {
    draft: ['review'],
    review: ['draft', 'published'],
    published: ['archived', 'review'],
    archived: ['draft']
};
const GED_WORKFLOW_ENTITIES = {
    documents: { table: 'public.documents', type: 'document' },
    'media-files': { table: 'public.media_files', type: 'media_file' }
};

async function listDocuments() {
    const result = await pool.query('SELECT * FROM public.documents ORDER BY uploaded_at DESC');
    return result.rows;
}

async function createDocument({ title, description, file_url, uploaderId }) {
    const result = await pool.query(
        'INSERT INTO public.documents (title, description, file_url, uploaded_at, uploader_id, workflow_state) VALUES ($1, $2, $3, NOW(), $4, $5) RETURNING *',
        [title, description, file_url, uploaderId, 'draft']
    );
    return result.rows[0];
}

async function deleteDocument(id) {
    await pool.query('DELETE FROM public.documents WHERE id = $1', [id]);
}

async function getEntity(entityType, id) {
    const config = GED_WORKFLOW_ENTITIES[entityType];
    if (!config) return null;
    const result = await pool.query(`SELECT id, workflow_state FROM ${config.table} WHERE id = $1`, [id]);
    return result.rows[0] || null;
}

async function updateEntityState(entityType, id, state) {
    const config = GED_WORKFLOW_ENTITIES[entityType];
    const result = await pool.query(
        `UPDATE ${config.table} SET workflow_state = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [state, id]
    );
    return result.rows[0];
}

async function recordTransition({ entityId, entityType, fromState, toState, changedBy, comment }) {
    try {
        await pool.query(
            `INSERT INTO public.document_workflow_transitions
                (entity_id, entity_type, from_state, to_state, changed_by, comment, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [entityId, entityType, fromState, toState, changedBy, comment || null]
        );
        await pool.query(
            `INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, details, timestamp)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [changedBy, `${entityType}.workflow.transition`, entityType, entityId, JSON.stringify({ fromState, toState, comment })]
        );
    } catch (err) {
        console.error('[GED] Failed to record workflow transition:', err);
    }
}

async function getTransitionHistory(entityType, entityId) {
    const config = GED_WORKFLOW_ENTITIES[entityType];
    if (!config) return null;
    const result = await pool.query(
        `SELECT id, entity_id, entity_type, from_state, to_state, changed_by, comment, created_at
         FROM public.document_workflow_transitions
         WHERE entity_id = $1 AND entity_type = $2
         ORDER BY created_at DESC`,
        [entityId, config.type]
    );
    return result.rows;
}

function getWorkflowConfig() {
    return {
        states: GED_WORKFLOW_STATES,
        transitions: GED_WORKFLOW_TRANSITIONS,
        entities: Object.keys(GED_WORKFLOW_ENTITIES)
    };
}

module.exports = {
    GED_WORKFLOW_STATES, GED_WORKFLOW_TRANSITIONS, GED_WORKFLOW_ENTITIES,
    listDocuments, createDocument, deleteDocument,
    getEntity, updateEntityState, recordTransition,
    getTransitionHistory, getWorkflowConfig
};
