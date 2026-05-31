const { pool } = require('../../core/database');

async function getSiteSettings() {
    const result = await pool.query('SELECT * FROM public.site_settings ORDER BY id ASC');
    return result.rows;
}

async function updateSiteSettings(data) {
    const {
        site_name, slogan, logo_url, favicon_url, contact_email, phone_number,
        address, copyright_text, facebook_url, linkedin_url, twitter_url,
        logo_height, logo_scale, logo_brightness, logo_contrast,
        cta_primary_text, cta_primary_url, cta_secondary_text, cta_secondary_url,
        page_sections,
        audience_section_title, audience_section_subtitle,
        audience_title_electrician, audience_subtitle_electrician, audience_desc_electrician,
        audience_title_company, audience_subtitle_company, audience_desc_company,
        audience_title_member, audience_subtitle_member, audience_desc_member
    } = data;

    const result = await pool.query(
        `UPDATE public.site_settings 
         SET site_name = $1, slogan = $2, logo_url = $3, favicon_url = $4, 
             contact_email = $5, phone_number = $6, address = $7, 
             copyright_text = $8, facebook_url = $9, linkedin_url = $10, twitter_url = $11,
             logo_height = $12, logo_scale = $13, logo_brightness = $14, logo_contrast = $15,
             cta_primary_text = $16, cta_primary_url = $17, cta_secondary_text = $18, cta_secondary_url = $19,
             page_sections = $20,
             audience_section_title = $21, audience_section_subtitle = $22,
             audience_title_electrician = $23, audience_subtitle_electrician = $24, audience_desc_electrician = $25,
             audience_title_company = $26, audience_subtitle_company = $27, audience_desc_company = $28,
             audience_title_member = $29, audience_subtitle_member = $30, audience_desc_member = $31,
             updated_at = NOW()
         WHERE id = 1 RETURNING *`,
        [
            site_name, slogan, logo_url, favicon_url, contact_email, phone_number,
            address, copyright_text, facebook_url, linkedin_url, twitter_url,
            logo_height, logo_scale, logo_brightness, logo_contrast,
            cta_primary_text, cta_primary_url, cta_secondary_text, cta_secondary_url,
            JSON.stringify(page_sections || {}),
            audience_section_title, audience_section_subtitle,
            audience_title_electrician, audience_subtitle_electrician, audience_desc_electrician,
            audience_title_company, audience_subtitle_company, audience_desc_company,
            audience_title_member, audience_subtitle_member, audience_desc_member
        ]
    );
    return result.rows[0];
}

async function getThemeSettings() {
    const result = await pool.query('SELECT * FROM public.theme_settings ORDER BY id ASC');
    return result.rows;
}

async function updateThemeSettings(data) {
    const { primary_color, secondary_color, accent_color, background_color, text_color, font_family, footer_background_url } = data;
    const result = await pool.query(
        `UPDATE public.theme_settings 
         SET primary_color = $1, secondary_color = $2, accent_color = $3, 
             background_color = $4, text_color = $5, font_family = $6,
             footer_background_url = $7,
             updated_at = NOW()
         WHERE id = 1 RETURNING *`,
        [primary_color, secondary_color, accent_color, background_color, text_color, font_family, footer_background_url]
    );
    return result.rows[0];
}

async function getSiteConfig() {
    const settingsRes = await pool.query('SELECT * FROM public.site_settings LIMIT 1');
    const themeRes = await pool.query('SELECT * FROM public.theme_settings LIMIT 1');
    const pagesRes = await pool.query('SELECT * FROM public.pages ORDER BY menu_order ASC');

    const settings = settingsRes.rows[0] || {};
    const theme = themeRes.rows[0] || {};

    return {
        pages: pagesRes.rows.map(p => ({
            id: p.id, slug: p.slug, title: p.title,
            layout: typeof p.content_blocks === 'object' ? p.content_blocks : (p.content_blocks ? JSON.parse(p.content_blocks) : [])
        })),
        theme: {
            primary: theme.primary_color, secondary: theme.secondary_color,
            accent: theme.accent_color, font: theme.font_family, radius: '0.5rem'
        },
        globals: {
            header: { site_name: settings.site_name, logo: settings.logo_url },
            footer: { copyright: settings.copyright_text }
        }
    };
}

async function saveSiteConfig(schema) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        if (schema.theme) {
            await client.query(
                `UPDATE public.theme_settings SET primary_color=$1, secondary_color=$2, accent_color=$3, font_family=$4, updated_at=NOW() WHERE id=1`,
                [schema.theme.primary, schema.theme.secondary, schema.theme.accent, schema.theme.font]
            );
        }
        if (schema.globals?.header) {
            await client.query(
                `UPDATE public.site_settings SET site_name=$1, logo_url=$2, updated_at=NOW() WHERE id=1`,
                [schema.globals.header.site_name, schema.globals.header.logo]
            );
        }
        if (schema.pages && Array.isArray(schema.pages)) {
            for (const page of schema.pages) {
                if (page.id && page.layout) {
                    await client.query(
                        `UPDATE public.pages SET content_blocks=$1, updated_at=NOW() WHERE id=$2`,
                        [JSON.stringify(page.layout), page.id]
                    );
                }
            }
        }
        await client.query('COMMIT');
        return { success: true, message: "Configuration globale sauvegardée" };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

async function saveKeyValueSettings(settings) {
    for (const [key, value] of Object.entries(settings)) {
        await pool.query(
            'INSERT INTO public.app_kv_settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
            [key, JSON.stringify(value)]
        );
    }
}

async function findAuditLogs() {
    const result = await pool.query('SELECT * FROM public.audit_log ORDER BY timestamp DESC LIMIT 100');
    return result.rows;
}

async function createAuditLog(userId, action, entity_type, entity_id, details) {
    const result = await pool.query(
        'INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, details, timestamp) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
        [userId, action, entity_type, entity_id, details]
    );
    return result.rows[0];
}

module.exports = {
    getSiteSettings, updateSiteSettings,
    getThemeSettings, updateThemeSettings,
    getSiteConfig, saveSiteConfig, saveKeyValueSettings,
    findAuditLogs, createAuditLog,
};
