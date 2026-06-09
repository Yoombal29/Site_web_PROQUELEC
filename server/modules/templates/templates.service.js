const repo = require('./templates.repository');
const { sendSseEvent } = require('../../core/sse');

async function listTemplates() {
    return repo.findAllTemplates();
}

async function getTemplate(id) {
    const tpl = await repo.findTemplateById(id);
    if (!tpl) throw Object.assign(new Error('Template non trouvé'), { status: 404 });
    return tpl;
}

async function createTemplate(data) {
    const tpl = await repo.createTemplate(data);
    try { sendSseEvent('template:created', tpl); } catch (e) { console.warn('SSE failed', e); }
    return tpl;
}

async function updateTemplate(id, data) {
    const tpl = await repo.updateTemplate(id, data);
    if (!tpl) throw Object.assign(new Error('Template non trouvé'), { status: 404 });
    try { sendSseEvent('template:updated', tpl); } catch (e) { console.warn('SSE failed', e); }
    return tpl;
}

async function deleteTemplate(id) {
    await repo.deleteTemplate(id);
    try { sendSseEvent('template:deleted', { id }); } catch (e) { console.warn('SSE failed', e); }
}

module.exports = {
    listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate,
};
