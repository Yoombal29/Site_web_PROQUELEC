const repo = require('./pages.repository');
const { sendSseEvent } = require('../../core/sse');

async function listPages() {
    return repo.findAllPages();
}

async function getPage(slug) {
    const page = await repo.findPageBySlug(slug);
    if (!page) throw Object.assign(new Error('Page non trouvée'), { status: 404 });
    return page;
}

async function getPageById(id) {
    const page = await repo.findPageById(id);
    if (!page) throw Object.assign(new Error('Page not found'), { status: 404 });
    return page;
}

async function createPage(data) {
    return repo.createPage(data);
}

async function updatePage(id, data) {
    const page = await repo.updatePage(id, data);
    if (!page) throw Object.assign(new Error('Page not found'), { status: 404 });
    if (data.slug) {
        await repo.syncMenuUrlByPageId(page.id, data.slug);
    }
    return page;
}

async function deletePage(id) {
    await repo.deletePage(id);
    try { sendSseEvent('page:deleted', { id }); } catch (e) { console.warn('SSE failed (page:deleted)', e); }
}

async function adminGetPage(id) {
    const page = await repo.findPageBySlugOrId(id);
    if (!page) throw Object.assign(new Error('Page not found'), { status: 404 });
    return page;
}

async function adminUpdatePage(id, data, userId) {
    const result = await repo.adminUpdatePage(id, data);
    if (!result) throw Object.assign(new Error('Page not found'), { status: 404 });

    await repo.savePageVersion(result.id, result.version, result.content_raw, userId);
    try { sendSseEvent('page:updated', result); } catch (e) { console.warn('SSE failed (page:updated)', e); }
    if (data.slug) {
        await repo.syncMenuUrlByPageId(result.id, data.slug);
    }
    return result;
}

async function getPageVersion(pageId, version) {
    const ver = await repo.findPageVersion(pageId, version);
    if (!ver) throw Object.assign(new Error('Version not found'), { status: 404 });
    return ver;
}

async function seedHomepage() {
    const HOMEPAGE_STRUCTURE = [
        { id: "home-hero-banner", type: "HeroBanner", version: 1, enabled: true, props: { parallax: true, autoplayInterval: 8000 }, metadata: { label: "Carrousel Hero (Accueil)", description: "Slides chargés depuis la base de données." } },
        { id: "home-audience-offers", type: "AudienceOffers", version: 1, enabled: true, props: {}, metadata: { label: "Offres Audience", description: "3 cartes — Électriciens, Professionnels, Membres." } },
        { id: "home-vision-mission", type: "VisionMission", version: 1, enabled: true, props: { title: "Garantir la sécurité pour tous les sénégalais.", subtitle: "Depuis 1995, PROQUELEC s'engage.", missionTitle: "Notre Mission", missionDesc: "Promouvoir la sécurité et la conformité normative.", visionTitle: "Notre Vision", visionDesc: "Devenir la référence nationale absolue.", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80", badge: "L'Institution" }, metadata: { label: "Vision & Mission" } },
        { id: "home-landing-stats", type: "LandingStats", version: 1, enabled: true, props: {}, metadata: { label: "Statistiques Clés" } },
        { id: "home-latest-news", type: "LatestNews", version: 1, enabled: true, props: {}, metadata: { label: "Actualités & Blog" } },
        { id: "home-partner-logos", type: "PartnerLogos", version: 1, enabled: true, props: {}, metadata: { label: "Logos Partenaires" } }
    ];

    const { pool } = require('../../core/database');
    const structureJson = JSON.stringify(HOMEPAGE_STRUCTURE);
    const findResult = await pool.query(`SELECT id, slug FROM pages WHERE slug IN ('home', 'home_page', '/') ORDER BY id LIMIT 1`);

    let pageId, action, slug;
    if (findResult.rows.length > 0) {
        const existing = findResult.rows[0];
        await pool.query(`UPDATE pages SET structure_json = $1, updated_at = NOW() WHERE id = $2`, [structureJson, existing.id]);
        pageId = existing.id; slug = existing.slug; action = 'updated';
    } else {
        const insertResult = await pool.query(
            `INSERT INTO pages (title, slug, structure_json, is_published, status, created_at, updated_at) VALUES ($1, $2, $3, true, 'published', NOW(), NOW()) RETURNING id, slug`,
            ['Accueil', 'home', structureJson]
        );
        pageId = insertResult.rows[0].id; slug = insertResult.rows[0].slug; action = 'created';
    }

    return { action, pageId, slug, blocksCount: HOMEPAGE_STRUCTURE.length };
}

// --- Menu Items ---
async function listMenuItems() {
    return repo.findAllMenuItems();
}

async function createMenuItem(data) {
    return repo.createMenuItem(data);
}

async function updateMenuItem(id, data) {
    const item = await repo.updateMenuItem(id, data);
    return item || { success: true, message: "No fields to update" };
}

async function deleteMenuItem(id) {
    await repo.deleteMenuItem(id);
}

// --- Construction Mode ---
async function getConstructionMode() {
    return repo.getConstructionMode();
}

async function setConstructionMode(isEnabled, userId) {
    return repo.setConstructionMode(isEnabled, userId);
}

// --- Draft Autosave ---
async function saveDraft(pageId, draftJson) {
    const result = await repo.saveDraft(pageId, draftJson);
    if (!result) throw Object.assign(new Error('Page not found'), { status: 404 });
    return result;
}

// --- Named Versions (Checkpoints) ---
async function createNamedVersion(pageId, versionName, structureJson, createdBy) {
    return repo.createNamedVersion(pageId, versionName, structureJson, createdBy);
}

async function listNamedVersions(pageId) {
    return repo.listNamedVersions(pageId);
}

async function getNamedVersion(versionId) {
    const ver = await repo.findNamedVersionById(versionId);
    if (!ver) throw Object.assign(new Error('Version not found'), { status: 404 });
    return ver;
}

// --- Theme Config ---
async function saveThemeConfig(pageId, themeConfig) {
    const result = await repo.saveThemeConfig(pageId, themeConfig);
    if (!result) throw Object.assign(new Error('Page not found'), { status: 404 });
    return result;
}

module.exports = {
    listPages, getPage, getPageById, createPage, updatePage, deletePage,
    adminGetPage, adminUpdatePage, getPageVersion, seedHomepage,
    saveDraft, createNamedVersion, listNamedVersions, getNamedVersion, saveThemeConfig,
    listMenuItems, createMenuItem, updateMenuItem, deleteMenuItem,
    getConstructionMode, setConstructionMode,
};
