const pool = require('../../core/database');

async function listPerformanceMetrics() {
    const result = await pool.query('SELECT * FROM public.performance_metrics ORDER BY created_at DESC');
    return result.rows;
}

async function createPerformanceMetric({ page_url, load_time, dom_content_loaded, first_contentful_paint, time_to_interactive, connection_type }) {
    await pool.query(
        'INSERT INTO public.performance_metrics (page_url, load_time, dom_content_loaded, first_contentful_paint, time_to_interactive, connection_type, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
        [page_url, load_time, dom_content_loaded, first_contentful_paint, time_to_interactive, connection_type]
    );
}

async function createAnalyticsEvent({ event_type, page_url, device_type, country, metadata }) {
    await pool.query(
        'INSERT INTO public.analytics_events (event_type, page_url, device_type, country, metadata, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [event_type, page_url, device_type, country, metadata]
    );
}

async function getSummary() {
    const events = await pool.query('SELECT * FROM public.analytics_events ORDER BY created_at DESC LIMIT 1000');
    const perf = await pool.query('SELECT * FROM public.performance_metrics ORDER BY created_at DESC LIMIT 100');
    return { events: events.rows, performance: perf.rows };
}

module.exports = {
    listPerformanceMetrics, createPerformanceMetric,
    createAnalyticsEvent, getSummary
};
