const repo = require('./builder.repository');
const { handleAppError } = require('../../core/errors');

// ─── SNAPSHOTS ───────────────────────────────────────────────────────────────

async function getSnapshotsByPage(pageId) {
    return repo.findSnapshotsByPage(pageId);
}

async function getSnapshotById(id) {
    const snapshot = await repo.findSnapshotById(id);
    if (!snapshot) {
        throw Object.assign(new Error('Snapshot introuvable'), { status: 404 });
    }
    return snapshot;
}

async function createSnapshot({ pageId, label, snapshot, snapshotType, metadata, userId }) {
    if (!label || !snapshot) {
        throw Object.assign(new Error('Label et snapshot sont requis'), { status: 400 });
    }
    return repo.createSnapshot({
        page_id: pageId,
        label,
        snapshot,
        snapshot_type: snapshotType || 'manual',
        metadata: metadata || {},
        created_by: userId,
    });
}

async function deleteSnapshot(id) {
    const existing = await repo.findSnapshotById(id);
    if (!existing) {
        throw Object.assign(new Error('Snapshot introuvable'), { status: 404 });
    }
    await repo.deleteSnapshot(id);
}

// ─── TEMPLATES ───────────────────────────────────────────────────────────────

async function getTemplates(filters) {
    return repo.findTemplates(filters);
}

async function getTemplateById(id) {
    const template = await repo.findTemplateById(id);
    if (!template) {
        throw Object.assign(new Error('Template introuvable'), { status: 404 });
    }
    return template;
}

async function createTemplate(data, userId) {
    if (!data.name || !data.category) {
        throw Object.assign(new Error('Nom et catégorie sont requis'), { status: 400 });
    }
    return repo.createTemplate({ ...data, created_by: userId });
}

async function updateTemplate(id, fields, userId) {
    const existing = await repo.findTemplateById(id);
    if (!existing) {
        throw Object.assign(new Error('Template introuvable'), { status: 404 });
    }
    if (existing.is_system) {
        throw Object.assign(new Error('Les templates système ne peuvent pas être modifiés'), { status: 403 });
    }
    const allowedFields = ['name', 'category', 'description', 'preview_image', 'blocks', 'layout_tree', 'theme_config', 'animation_config', 'tags'];
    const updateData = {};
    for (const key of allowedFields) {
        if (fields[key] !== undefined) {
            updateData[key] = fields[key];
        }
    }
    return repo.updateTemplate(id, updateData);
}

async function deleteTemplate(id) {
    const existing = await repo.findTemplateById(id);
    if (!existing) {
        throw Object.assign(new Error('Template introuvable'), { status: 404 });
    }
    if (existing.is_system) {
        throw Object.assign(new Error('Les templates système ne peuvent pas être supprimés'), { status: 403 });
    }
    await repo.deleteTemplate(id);
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

async function getComponents(filters) {
    return repo.findComponents(filters);
}

async function getComponentById(id) {
    const component = await repo.findComponentById(id);
    if (!component) {
        throw Object.assign(new Error('Composant introuvable'), { status: 404 });
    }
    return component;
}

async function createComponent(data, userId) {
    if (!data.name) {
        throw Object.assign(new Error('Nom du composant requis'), { status: 400 });
    }
    return repo.createComponent({ ...data, created_by: userId });
}

async function updateComponent(id, fields) {
    const existing = await repo.findComponentById(id);
    if (!existing) {
        throw Object.assign(new Error('Composant introuvable'), { status: 404 });
    }
    const allowedFields = ['name', 'category', 'schema', 'preview_image', 'is_global', 'tags'];
    const updateData = {};
    for (const key of allowedFields) {
        if (fields[key] !== undefined) {
            updateData[key] = fields[key];
        }
    }
    return repo.updateComponent(id, updateData);
}

async function deleteComponent(id) {
    const existing = await repo.findComponentById(id);
    if (!existing) {
        throw Object.assign(new Error('Composant introuvable'), { status: 404 });
    }
    await repo.deleteComponent(id);
}

// ─── BINDINGS ────────────────────────────────────────────────────────────────

async function getBindingsByPage(pageId) {
    return repo.findBindingsByPage(pageId);
}

async function createBinding(data) {
    if (!data.page_id || !data.node_id || !data.source_type) {
        throw Object.assign(new Error('page_id, node_id et source_type sont requis'), { status: 400 });
    }
    const validTypes = ['api', 'query', 'static', 'context', 'store'];
    if (!validTypes.includes(data.source_type)) {
        throw Object.assign(new Error(`source_type doit être l'un de: ${validTypes.join(', ')}`), { status: 400 });
    }
    return repo.createBinding(data);
}

async function updateBinding(id, fields) {
    const existing = await repo.findBindingById(id);
    if (!existing) {
        throw Object.assign(new Error('Binding introuvable'), { status: 404 });
    }
    const allowedFields = ['source_config', 'mapping', 'refresh_interval', 'is_active'];
    const updateData = {};
    for (const key of allowedFields) {
        if (fields[key] !== undefined) {
            updateData[key] = fields[key];
        }
    }
    return repo.updateBinding(id, updateData);
}

async function deleteBinding(id) {
    const existing = await repo.findBindingById(id);
    if (!existing) {
        throw Object.assign(new Error('Binding introuvable'), { status: 404 });
    }
    await repo.deleteBinding(id);
}

// ─── PLUGINS ─────────────────────────────────────────────────────────────────

async function getPlugins(filter) {
    return repo.findPlugins(filter);
}

async function getPluginByName(name) {
    const plugin = await repo.findPluginByName(name);
    if (!plugin) {
        throw Object.assign(new Error('Plugin introuvable'), { status: 404 });
    }
    return plugin;
}

async function registerPlugin(data) {
    if (!data.name) {
        throw Object.assign(new Error('Nom du plugin requis'), { status: 400 });
    }
    return repo.upsertPlugin(data);
}

async function togglePlugin(name, enabled) {
    const existing = await repo.findPluginByName(name);
    if (!existing) {
        throw Object.assign(new Error('Plugin introuvable'), { status: 404 });
    }
    return repo.togglePlugin(name, enabled);
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

async function getExportsByPage(pageId) {
    return repo.findExportsByPage(pageId);
}

async function createExport(data, userId) {
    if (!data.page_id || !data.format) {
        throw Object.assign(new Error('page_id et format sont requis'), { status: 400 });
    }
    const validFormats = ['react', 'html', 'json', 'pdf'];
    if (!validFormats.includes(data.format)) {
        throw Object.assign(new Error(`Format doit être l'un de: ${validFormats.join(', ')}`), { status: 400 });
    }
    return repo.createExport({ ...data, generated_by: userId });
}

// ─── COLLABORATION ───────────────────────────────────────────────────────────

async function getCollaborationByPage(pageId) {
    const collab = await repo.findCollaborationByPage(pageId);
    return collab || { page_id: pageId, awareness: {}, connected_peers: 0 };
}

async function upsertCollaboration(pageId, { ydoc_state, awareness }) {
    return repo.upsertCollaboration({ page_id: pageId, ydoc_state, awareness });
}

async function updateCollaborationPeers(pageId, delta) {
    return repo.updateCollaborationPeers(pageId, delta);
}

// ─── PAGE ENRICHMENT ─────────────────────────────────────────────────────────

async function updatePageBuilderFields(pageId, fields) {
    const jsonFields = ['layout_tree', 'theme_config', 'bindings', 'animation_config'];
    const scalarFields = ['published_snapshot_id'];
    const allowedFields = [...jsonFields, ...scalarFields];

    const updateData = {};
    for (const key of allowedFields) {
        if (fields[key] !== undefined) {
            updateData[key] = fields[key];
        }
    }

    if (Object.keys(updateData).length === 0) {
        throw Object.assign(new Error('Aucun champ valide à mettre à jour'), { status: 400 });
    }

    return repo.updatePageBuilderFields(pageId, updateData);
}

module.exports = {
    getSnapshotsByPage,
    getSnapshotById,
    createSnapshot,
    deleteSnapshot,
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getComponents,
    getComponentById,
    createComponent,
    updateComponent,
    deleteComponent,
    getBindingsByPage,
    createBinding,
    updateBinding,
    deleteBinding,
    getPlugins,
    getPluginByName,
    registerPlugin,
    togglePlugin,
    getExportsByPage,
    createExport,
    getCollaborationByPage,
    upsertCollaboration,
    updateCollaborationPeers,
    updatePageBuilderFields,
};
