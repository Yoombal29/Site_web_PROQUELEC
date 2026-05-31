const { pool } = require('../../core/database');

// --- Events ---
async function findAllEvents() {
    const result = await pool.query('SELECT * FROM public.events ORDER BY date DESC');
    return result.rows;
}

async function createEvent(data) {
    const { title, date, location, details, organizer_id } = data;
    const result = await pool.query(
        'INSERT INTO public.events (title, date, location, details, created_at, organizer_id) VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING *',
        [title, date, location, details, organizer_id]
    );
    return result.rows[0];
}

async function updateEvent(id, data) {
    const { title, date, location, details } = data;
    const result = await pool.query(
        'UPDATE public.events SET title=$1, date=$2, location=$3, details=$4 WHERE id=$5 RETURNING *',
        [title, date, location, details, id]
    );
    return result.rows[0];
}

async function deleteEvent(id) {
    await pool.query('DELETE FROM public.events WHERE id=$1', [id]);
}

// --- Documents ---
async function findAllDocuments() {
    const result = await pool.query('SELECT * FROM public.documents ORDER BY uploaded_at DESC');
    return result.rows;
}

async function createDocument(data) {
    const { title, description, file_url, uploader_id } = data;
    const result = await pool.query(
        'INSERT INTO public.documents (title, description, file_url, uploaded_at, uploader_id, workflow_state) VALUES ($1, $2, $3, NOW(), $4, $5) RETURNING *',
        [title, description, file_url, uploader_id, 'draft']
    );
    return result.rows[0];
}

async function deleteDocument(id) {
    await pool.query('DELETE FROM public.documents WHERE id=$1', [id]);
}

// --- Partners ---
async function findAllPartners() {
    const result = await pool.query('SELECT * FROM public.partners WHERE is_active = true ORDER BY display_order ASC');
    return result.rows;
}

async function createPartner(data) {
    const { name, logo_url, category, display_order, is_active } = data;
    const result = await pool.query(
        'INSERT INTO public.partners (name, logo_url, category, display_order, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, logo_url, category, display_order, is_active]
    );
    return result.rows[0];
}

async function updatePartner(id, data) {
    const { name, logo_url, category, display_order, is_active } = data;
    const result = await pool.query(
        'UPDATE public.partners SET name=$1, logo_url=$2, category=$3, display_order=$4, is_active=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
        [name, logo_url, category, display_order, is_active, id]
    );
    return result.rows[0];
}

async function deletePartner(id) {
    await pool.query('DELETE FROM public.partners WHERE id=$1', [id]);
}

// --- Quick Links ---
async function findAllQuickLinks() {
    const result = await pool.query('SELECT * FROM public.quick_links WHERE is_active = true ORDER BY display_order ASC');
    return result.rows;
}

async function createQuickLink(data) {
    const { title, description, url, icon_name, display_order, is_active } = data;
    const result = await pool.query(
        'INSERT INTO public.quick_links (title, description, url, icon_name, display_order, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, description, url, icon_name, display_order, is_active]
    );
    return result.rows[0];
}

async function updateQuickLink(id, data) {
    const { title, description, url, icon_name, display_order, is_active } = data;
    const result = await pool.query(
        'UPDATE public.quick_links SET title=$1, description=$2, url=$3, icon_name=$4, display_order=$5, is_active=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
        [title, description, url, icon_name, display_order, is_active, id]
    );
    return result.rows[0];
}

async function deleteQuickLink(id) {
    await pool.query('DELETE FROM public.quick_links WHERE id=$1', [id]);
}

// --- Site Assets ---
async function findAllAssets(category) {
    let query = 'SELECT * FROM public.site_assets';
    let params = [];
    if (category && category !== 'Tous les documents') {
        query += ' WHERE category = $1';
        params.push(category);
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
}

async function createAsset(data) {
    const { title, description, category, asset_type, file_size, file_url, preview_url, is_premium, price_fcfy, monetization_active, metadata } = data;
    const result = await pool.query(
        `INSERT INTO public.site_assets (title, description, category, asset_type, file_size, file_url, preview_url, is_premium, price_fcfy, monetization_active, metadata, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()) RETURNING *`,
        [title, description, category || 'Général', asset_type || 'PDF', file_size, file_url, preview_url, is_premium || false, price_fcfy || 0, monetization_active || false, metadata || {}]
    );
    return result.rows[0];
}

async function updateAsset(id, data) {
    const { title, description, category, asset_type, file_size, file_url, preview_url, is_premium, price_fcfy, monetization_active, metadata } = data;
    const result = await pool.query(
        `UPDATE public.site_assets SET title=$1, description=$2, category=$3, asset_type=$4, file_size=$5, file_url=$6, preview_url=$7, is_premium=$8, price_fcfy=$9, monetization_active=$10, metadata=$11, updated_at=NOW() WHERE id=$12 RETURNING *`,
        [title, description, category, asset_type, file_size, file_url, preview_url, is_premium, price_fcfy, monetization_active, metadata, id]
    );
    return result.rows[0];
}

async function deleteAsset(id) {
    await pool.query('DELETE FROM public.site_assets WHERE id=$1', [id]);
}

async function incrementDownload(id) {
    await pool.query('UPDATE public.site_assets SET download_stats = download_stats + 1 WHERE id = $1', [id]);
}

// --- Gallery ---
async function findAllGallery(isAdmin) {
    const query = isAdmin
        ? 'SELECT * FROM public.gallery_items ORDER BY display_order ASC'
        : 'SELECT * FROM public.gallery_items WHERE is_active = true ORDER BY display_order ASC';
    const result = await pool.query(query);
    return result.rows;
}

async function createGalleryItem(data) {
    const { title, description, url, type, category, tags, hotspots, display_order, is_active } = data;
    const result = await pool.query(
        `INSERT INTO public.gallery_items (title, description, url, type, category, tags, hotspots, display_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [title, description, url, type || 'photo', category || 'projets', tags || [], JSON.stringify(hotspots || []), display_order || 0, is_active !== false]
    );
    return result.rows[0];
}

async function updateGalleryItem(id, data) {
    const { title, description, url, type, category, tags, hotspots, display_order, is_active } = data;
    const result = await pool.query(
        `UPDATE public.gallery_items SET title=$1, description=$2, url=$3, type=$4, category=$5, tags=$6, hotspots=$7, display_order=$8, is_active=$9 WHERE id=$10 RETURNING *`,
        [title, description, url, type, category, tags || [], JSON.stringify(hotspots || []), display_order, is_active, id]
    );
    return result.rows[0];
}

async function deleteGalleryItem(id) {
    await pool.query('DELETE FROM public.gallery_items WHERE id=$1', [id]);
}

// --- Newsletter ---
async function findAllSubscribers() {
    const result = await pool.query('SELECT * FROM public.newsletter_subscribers ORDER BY subscribed_at DESC');
    return result.rows;
}

async function subscribe(data) {
    const { email, source } = data;
    const result = await pool.query(
        'INSERT INTO public.newsletter_subscribers (email, source, subscribed_at, is_active) VALUES ($1, $2, NOW(), true) ON CONFLICT (email) DO UPDATE SET is_active = true RETURNING *',
        [email, source]
    );
    return result.rows[0];
}

// --- Contact Requests ---
async function findAllContacts() {
    const result = await pool.query('SELECT * FROM public.contact_requests ORDER BY submitted_at DESC');
    return result.rows;
}

async function createContact(data) {
    const { nom, email, telephone, sujet, message } = data;
    const result = await pool.query(
        'INSERT INTO public.contact_requests (nom, email, telephone, sujet, message, submitted_at, status) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING *',
        [nom, email, telephone, sujet, message, 'nouveau']
    );
    return result.rows[0];
}

async function deleteContact(id) {
    await pool.query('DELETE FROM public.contact_requests WHERE id=$1', [id]);
}

// --- Training Registrations ---
async function findAllRegistrations() {
    const result = await pool.query('SELECT * FROM public.training_registrations ORDER BY registration_date DESC');
    return result.rows;
}

async function createRegistration(data) {
    const { training_id, user_id, participant_name, participant_email, participant_phone, company_name, special_requirements } = data;
    const result = await pool.query(`
        INSERT INTO public.training_registrations(training_id, user_id, participant_name, participant_email, participant_phone, company_name, special_requirements, registration_date, status, payment_status)
        VALUES($1, $2, $3, $4, $5, $6, $7, NOW(), 'pending', 'pending') RETURNING *
    `, [training_id, user_id, participant_name, participant_email, participant_phone, company_name, special_requirements]);
    return result.rows[0];
}

// --- Homepage ---
async function findHomeSlides() {
    const result = await pool.query('SELECT * FROM public.home_slides ORDER BY display_order ASC');
    return result.rows;
}

async function createHomeSlide(data) {
    const { badge, title, subtitle, description, background_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order } = data;
    const result = await pool.query(
        `INSERT INTO public.home_slides (badge, title, subtitle, description, background_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [badge, title, subtitle, description, background_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order]
    );
    return result.rows[0];
}

async function updateHomeSlide(id, data) {
    const { badge, title, subtitle, description, background_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order } = data;
    const result = await pool.query(
        `UPDATE public.home_slides SET badge=$1, title=$2, subtitle=$3, description=$4, background_url=$5, cta_text=$6, cta_link=$7, secondary_cta_text=$8, secondary_cta_link=$9, display_order=$10 WHERE id=$11 RETURNING *`,
        [badge, title, subtitle, description, background_url, cta_text, cta_link, secondary_cta_text, secondary_cta_link, display_order, id]
    );
    return result.rows[0];
}

async function deleteHomeSlide(id) {
    await pool.query('DELETE FROM public.home_slides WHERE id=$1', [id]);
}

async function findHomeHero() {
    const result = await pool.query('SELECT * FROM public.home_hero LIMIT 1');
    return result.rows[0] || {};
}

async function upsertHomeHero(data) {
    const { title, subtitle, description, cta_text, cta_link, background_url } = data;
    const result = await pool.query(
        `INSERT INTO public.home_hero(id, title, subtitle, description, cta_text, cta_link, background_url, updated_at)
         VALUES(1, $1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT(id) DO UPDATE SET title=$1, subtitle=$2, description=$3, cta_text=$4, cta_link=$5, background_url=$6, updated_at=NOW()
         RETURNING *`,
        [title, subtitle, description, cta_text, cta_link, background_url]
    );
    return result.rows[0];
}

async function findHomeStats() {
    const result = await pool.query('SELECT * FROM public.home_stats ORDER BY display_order ASC');
    return result.rows;
}

async function createHomeStat(data) {
    const { label, value, icon_name, description, is_warning, display_order } = data;
    const result = await pool.query(
        'INSERT INTO public.home_stats (label, value, icon_name, description, is_warning, display_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [label, value, icon_name, description, is_warning, display_order]
    );
    return result.rows[0];
}

async function updateHomeStat(id, data) {
    const { label, value, icon_name, description, is_warning, display_order } = data;
    const result = await pool.query(
        'UPDATE public.home_stats SET label=$1, value=$2, icon_name=$3, description=$4, is_warning=$5, display_order=$6 WHERE id=$7 RETURNING *',
        [label, value, icon_name, description, is_warning, display_order, id]
    );
    return result.rows[0];
}

async function deleteHomeStat(id) {
    await pool.query('DELETE FROM public.home_stats WHERE id=$1', [id]);
}

async function findHomeServices() {
    const result = await pool.query('SELECT * FROM public.home_services ORDER BY display_order ASC');
    return result.rows;
}

async function createHomeService(data) {
    const { title, description, icon_name, link, features, display_order } = data;
    const result = await pool.query(
        'INSERT INTO public.home_services (title, description, icon_name, link, features, display_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, description, icon_name, link, features, display_order]
    );
    return result.rows[0];
}

async function updateHomeService(id, data) {
    const { title, description, icon_name, link, features, display_order } = data;
    const result = await pool.query(
        'UPDATE public.home_services SET title=$1, description=$2, icon_name=$3, link=$4, features=$5, display_order=$6 WHERE id=$7 RETURNING *',
        [title, description, icon_name, link, features, display_order, id]
    );
    return result.rows[0];
}

async function deleteHomeService(id) {
    await pool.query('DELETE FROM public.home_services WHERE id=$1', [id]);
}

async function findTestimonials() {
    const result = await pool.query('SELECT * FROM public.testimonials ORDER BY created_at DESC');
    return result.rows;
}

async function createTestimonial(data) {
    const { name, role, content, rating, avatar_url } = data;
    const result = await pool.query(
        'INSERT INTO public.testimonials (name, role, content, rating, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, role, content, rating, avatar_url]
    );
    return result.rows[0];
}

async function updateTestimonial(id, data) {
    const { name, role, content, rating, avatar_url } = data;
    const result = await pool.query(
        'UPDATE public.testimonials SET name=$1, role=$2, content=$3, rating=$4, avatar_url=$5 WHERE id=$6 RETURNING *',
        [name, role, content, rating, avatar_url, id]
    );
    return result.rows[0];
}

async function deleteTestimonial(id) {
    await pool.query('DELETE FROM public.testimonials WHERE id=$1', [id]);
}

// --- Forms ---
async function findForms() {
    try {
        const { rows } = await pool.query('SELECT * FROM public.dynamic_forms');
        if (rows.length > 0) return rows;
    } catch (e) { }
    return [
        {
            name: 'contact', title: 'Contactez-nous', description: 'Envoyez-nous un message',
            fields: [
                { name: 'name', type: 'text', label: 'Nom', required: true },
                { name: 'email', type: 'email', label: 'Email', required: true },
                { name: 'message', type: 'textarea', label: 'Message', required: true }
            ],
            submit_action: 'database'
        }
    ];
}

async function submitForm(data) {
    const { form_name, form_data, submitted_at } = data;
    await pool.query(
        'CREATE TABLE IF NOT EXISTS public.form_submissions(id UUID PRIMARY KEY DEFAULT gen_random_uuid(), form_name TEXT NOT NULL, data JSONB NOT NULL, submitted_at TIMESTAMP DEFAULT NOW())'
    );
    const result = await pool.query(
        'INSERT INTO public.form_submissions (form_name, data, submitted_at) VALUES ($1, $2, $3) RETURNING *',
        [form_name, JSON.stringify(form_data), submitted_at]
    );
    return result.rows[0];
}

// --- Plugins & Themes ---
async function findAllPlugins() {
    const { rows } = await pool.query('SELECT * FROM public.cms_plugins ORDER BY display_name');
    return rows;
}
async function findAllThemes() {
    const { rows } = await pool.query('SELECT * FROM public.cms_themes ORDER BY name');
    return rows;
}

module.exports = {
    findAllEvents, createEvent, updateEvent, deleteEvent,
    findAllDocuments, createDocument, deleteDocument,
    findAllPartners, createPartner, updatePartner, deletePartner,
    findAllQuickLinks, createQuickLink, updateQuickLink, deleteQuickLink,
    findAllAssets, createAsset, updateAsset, deleteAsset, incrementDownload,
    findAllGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem,
    findAllSubscribers, subscribe,
    findAllContacts, createContact, deleteContact,
    findAllRegistrations, createRegistration,
    findHomeSlides, createHomeSlide, updateHomeSlide, deleteHomeSlide,
    findHomeHero, upsertHomeHero,
    findHomeStats, createHomeStat, updateHomeStat, deleteHomeStat,
    findHomeServices, createHomeService, updateHomeService, deleteHomeService,
    findTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
    findForms, submitForm,
    findAllPlugins, findAllThemes,
};
