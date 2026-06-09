const repo = require('./settings.repository');
const { sendSseEvent } = require('../../core/sse');

async function getSiteSettings() {
    return repo.getSiteSettings();
}

async function updateSiteSettings(data) {
    return repo.updateSiteSettings(data);
}

async function getThemeSettings() {
    return repo.getThemeSettings();
}

async function updateThemeSettings(data) {
    const result = await repo.updateThemeSettings(data);
    try { sendSseEvent('theme:updated', result); } catch (e) { console.warn('SSE failed (theme:updated)', e); }
    return result;
}

async function getSiteConfig() {
    return repo.getSiteConfig();
}

async function saveSiteConfig(schema) {
    if (!schema) throw Object.assign(new Error("Schema invalide"), { status: 400 });
    return repo.saveSiteConfig(schema);
}

async function saveSettings(settings) {
    await repo.saveKeyValueSettings(settings);
}

async function getAuditLogs() {
    return repo.findAuditLogs();
}

async function createAuditLog(userId, action, entity_type, entity_id, details) {
    return repo.createAuditLog(userId, action, entity_type, entity_id, details);
}

module.exports = {
    getSiteSettings, updateSiteSettings,
    getThemeSettings, updateThemeSettings,
    getSiteConfig, saveSiteConfig, saveSettings,
    getAuditLogs, createAuditLog,
};
