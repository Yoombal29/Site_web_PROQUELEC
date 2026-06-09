const service = require('./builder.service');
const { handleAppError } = require('../../core/errors');

// ─── SNAPSHOTS ───────────────────────────────────────────────────────────────

async function listSnapshots(req, res) {
    try {
        const snapshots = await service.getSnapshotsByPage(req.params.pageId);
        res.json(snapshots);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function getSnapshot(req, res) {
    try {
        const snapshot = await service.getSnapshotById(req.params.id);
        res.json(snapshot);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function createSnapshot(req, res) {
    try {
        const snapshot = await service.createSnapshot({
            pageId: req.params.pageId,
            label: req.body.label,
            snapshot: req.body.snapshot,
            snapshotType: req.body.snapshot_type,
            metadata: req.body.metadata,
            userId: req.user?.id,
        });
        res.status(201).json(snapshot);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function removeSnapshot(req, res) {
    try {
        await service.deleteSnapshot(req.params.id);
        res.status(204).end();
    } catch (err) {
        handleAppError(err, res);
    }
}

// ─── TEMPLATES ───────────────────────────────────────────────────────────────

async function listTemplates(req, res) {
    try {
        const { category, tags } = req.query;
        const filters = {};
        if (category) filters.category = category;
        if (tags) filters.tags = tags.split(',');
        const templates = await service.getTemplates(filters);
        res.json(templates);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function getTemplate(req, res) {
    try {
        const template = await service.getTemplateById(req.params.id);
        res.json(template);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function createTemplate(req, res) {
    try {
        const template = await service.createTemplate(req.body, req.user?.id);
        res.status(201).json(template);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function updateTemplate(req, res) {
    try {
        const template = await service.updateTemplate(req.params.id, req.body, req.user?.id);
        res.json(template);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function removeTemplate(req, res) {
    try {
        await service.deleteTemplate(req.params.id);
        res.status(204).end();
    } catch (err) {
        handleAppError(err, res);
    }
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

async function listComponents(req, res) {
    try {
        const { category, global, tags } = req.query;
        const filters = {};
        if (category) filters.category = category;
        if (global !== undefined) filters.global = global === 'true';
        if (tags) filters.tags = tags.split(',');
        const components = await service.getComponents(filters);
        res.json(components);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function getComponent(req, res) {
    try {
        const component = await service.getComponentById(req.params.id);
        res.json(component);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function createComponent(req, res) {
    try {
        const component = await service.createComponent(req.body, req.user?.id);
        res.status(201).json(component);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function updateComponent(req, res) {
    try {
        const component = await service.updateComponent(req.params.id, req.body);
        res.json(component);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function removeComponent(req, res) {
    try {
        await service.deleteComponent(req.params.id);
        res.status(204).end();
    } catch (err) {
        handleAppError(err, res);
    }
}

// ─── BINDINGS ────────────────────────────────────────────────────────────────

async function listBindings(req, res) {
    try {
        const bindings = await service.getBindingsByPage(req.params.pageId);
        res.json(bindings);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function createBinding(req, res) {
    try {
        const binding = await service.createBinding({ ...req.body, page_id: req.params.pageId });
        res.status(201).json(binding);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function updateBinding(req, res) {
    try {
        const binding = await service.updateBinding(req.params.id, req.body);
        res.json(binding);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function removeBinding(req, res) {
    try {
        await service.deleteBinding(req.params.id);
        res.status(204).end();
    } catch (err) {
        handleAppError(err, res);
    }
}

// ─── PLUGINS ─────────────────────────────────────────────────────────────────

async function listPlugins(req, res) {
    try {
        const filter = {};
        if (req.query.enabled !== undefined) filter.enabled = req.query.enabled === 'true';
        const plugins = await service.getPlugins(filter);
        res.json(plugins);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function getPlugin(req, res) {
    try {
        const plugin = await service.getPluginByName(req.params.name);
        res.json(plugin);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function registerPlugin(req, res) {
    try {
        const plugin = await service.registerPlugin(req.body);
        res.status(201).json(plugin);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function togglePlugin(req, res) {
    try {
        const plugin = await service.togglePlugin(req.params.name, req.body.enabled);
        res.json(plugin);
    } catch (err) {
        handleAppError(err, res);
    }
}

// ─── EXPORTS ─────────────────────────────────────────────────────────────────

async function listExports(req, res) {
    try {
        const exports = await service.getExportsByPage(req.params.pageId);
        res.json(exports);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function createExport(req, res) {
    try {
        const exportEntry = await service.createExport({ ...req.body, page_id: req.params.pageId }, req.user?.id);
        res.status(201).json(exportEntry);
    } catch (err) {
        handleAppError(err, res);
    }
}

// ─── COLLABORATION ───────────────────────────────────────────────────────────

async function getCollaboration(req, res) {
    try {
        const collab = await service.getCollaborationByPage(req.params.pageId);
        res.json(collab);
    } catch (err) {
        handleAppError(err, res);
    }
}

async function updateCollaboration(req, res) {
    try {
        const collab = await service.upsertCollaboration(req.params.pageId, req.body);
        res.json(collab);
    } catch (err) {
        handleAppError(err, res);
    }
}

// ─── PAGE ENRICHMENT ─────────────────────────────────────────────────────────

async function updatePageBuilder(req, res) {
    try {
        const page = await service.updatePageBuilderFields(req.params.pageId, req.body);
        res.json(page);
    } catch (err) {
        handleAppError(err, res);
    }
}

module.exports = {
    listSnapshots,
    getSnapshot,
    createSnapshot,
    removeSnapshot,
    listTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    removeTemplate,
    listComponents,
    getComponent,
    createComponent,
    updateComponent,
    removeComponent,
    listBindings,
    createBinding,
    updateBinding,
    removeBinding,
    listPlugins,
    getPlugin,
    registerPlugin,
    togglePlugin,
    listExports,
    createExport,
    getCollaboration,
    updateCollaboration,
    updatePageBuilder,
};
