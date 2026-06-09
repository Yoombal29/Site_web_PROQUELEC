const repo = require('./analytics.repository');

async function getPerformanceMetrics(req, res) {
    try {
        const metrics = await repo.listPerformanceMetrics();
        res.json(metrics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createPerformanceMetric(req, res) {
    const { page_url, load_time, dom_content_loaded, first_contentful_paint, time_to_interactive, connection_type } = req.body;
    try {
        await repo.createPerformanceMetric({ page_url, load_time, dom_content_loaded, first_contentful_paint, time_to_interactive, connection_type });
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createAnalyticsEvent(req, res) {
    const { event_type, page_url, device_type, country, metadata } = req.body;
    try {
        await repo.createAnalyticsEvent({ event_type, page_url, device_type, country, metadata });
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getSummary(req, res) {
    try {
        const summary = await repo.getSummary();
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getPerformanceMetrics, createPerformanceMetric,
    createAnalyticsEvent, getSummary
};
