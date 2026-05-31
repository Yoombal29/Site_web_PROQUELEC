const express = require('express');
const router = express.Router();
const { authenticateToken, validate } = require('../../core/middleware');
const { performanceMetricSchema, analyticsEventSchema } = require('./analytics.validator');
const ctrl = require('./analytics.controller');

router.get('/performance-metrics', authenticateToken, ctrl.getPerformanceMetrics);
router.post('/performance-metrics', validate(performanceMetricSchema), ctrl.createPerformanceMetric);
router.post('/analytics/events', validate(analyticsEventSchema), ctrl.createAnalyticsEvent);
router.get('/analytics/summary', authenticateToken, ctrl.getSummary);

module.exports = { router, basePath: '/api' };
