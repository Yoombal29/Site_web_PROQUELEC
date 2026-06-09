const service = require('./settings.service');

async function getSiteSettings(req, res) {
    try {
        const settings = await service.getSiteSettings();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateSiteSettings(req, res) {
    try {
        const result = await service.updateSiteSettings(req.body);
        res.json(result);
    } catch (err) {
        console.error('Error updating site settings:', err);
        res.status(500).json({ error: err.message });
    }
}

async function getThemeSettings(req, res) {
    try {
        const theme = await service.getThemeSettings();
        res.json(theme);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateThemeSettings(req, res) {
    try {
        const result = await service.updateThemeSettings(req.body);
        res.json(result);
    } catch (err) {
        console.error('Error updating theme settings:', err);
        res.status(500).json({ error: err.message });
    }
}

async function getSiteConfig(req, res) {
    try {
        const config = await service.getSiteConfig();
        res.json(config);
    } catch (err) {
        console.error('Error fetching site config:', err);
        res.status(500).json({ error: err.message });
    }
}

async function saveSiteConfig(req, res) {
    try {
        const { schema } = req.body;
        const result = await service.saveSiteConfig(schema);
        res.json(result);
    } catch (err) {
        console.error('Error saving site config:', err);
        res.status(500).json({ error: err.message });
    }
}

async function saveSettings(req, res) {
    try {
        await service.saveSettings(req.body);
        res.json({ success: true });
    } catch (err) {
        console.error('Error saving settings:', err);
        res.status(500).json({ error: err.message });
    }
}

async function getAuditLogs(req, res) {
    try {
        const logs = await service.getAuditLogs();
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createAuditLog(req, res) {
    try {
        const { action, entity_type, entity_id, details } = req.body;
        const log = await service.createAuditLog(req.user.id, action, entity_type, entity_id, details);
        res.json(log);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getSiteSettings, updateSiteSettings,
    getThemeSettings, updateThemeSettings,
    getSiteConfig, saveSiteConfig, saveSettings,
    getAuditLogs, createAuditLog,
};
