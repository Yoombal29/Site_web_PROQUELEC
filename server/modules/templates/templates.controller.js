const service = require('./templates.service');

async function listTemplates(req, res) {
    try {
        const templates = await service.listTemplates();
        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getTemplate(req, res) {
    try {
        const tpl = await service.getTemplate(req.params.id);
        res.json(tpl);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function createTemplate(req, res) {
    try {
        const tpl = await service.createTemplate(req.body);
        res.status(201).json(tpl);
    } catch (err) {
        const { handleAppError } = require('../../core/errors');
        handleAppError(err, res);
    }
}

async function updateTemplate(req, res) {
    try {
        const tpl = await service.updateTemplate(req.params.id, req.body);
        res.json(tpl);
    } catch (err) {
        const { handleAppError } = require('../../core/errors');
        handleAppError(err, res);
    }
}

async function deleteTemplate(req, res) {
    try {
        await service.deleteTemplate(req.params.id);
        res.json({ success: true });
    } catch (err) {
        const { handleAppError } = require('../../core/errors');
        handleAppError(err, res);
    }
}

module.exports = {
    listTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate,
};
