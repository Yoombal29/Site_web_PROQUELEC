const request = require('supertest');
const { createApp } = require('../app');

const app = createApp();

describe('API Server', () => {
    test('GET / returns server status', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('running');
    });

    test('GET /health returns health check', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(503);
        expect(res.body.database.status).toBe('degraded');
    });

    test('GET /api/health returns api health', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(503);
        expect(res.body.status).toBe('degraded');
    });

    test('GET /unknown-route returns 404', async () => {
        const res = await request(app).get('/api/unknown-route');
        expect(res.status).toBe(404);
    });
});

describe('Validation', () => {
    test('POST /api/auth/login - invalid email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'not-an-email', password: '' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation échouée');
        expect(res.body.details.length).toBeGreaterThan(0);
    });

    test('POST /api/auth/register - short password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@test.com', password: 'ab' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation échouée');
    });

    test('POST /api/newsletter-subscribers - invalid email', async () => {
        const res = await request(app)
            .post('/api/newsletter-subscribers')
            .send({ email: 'bad' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation échouée');
    });

    test('POST /api/newsletter-subscribers - valid email (DB fails)', async () => {
        const res = await request(app)
            .post('/api/newsletter-subscribers')
            .send({ email: 'test@test.com' });
        expect([201, 500]).toContain(res.status);
    });

    test('POST /api/contact-requests - missing nom', async () => {
        const res = await request(app)
            .post('/api/contact-requests')
            .send({ email: 'test@test.com', message: 'hi' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation échouée');
    });

    test('POST /api/analytics/events - missing page_url', async () => {
        const res = await request(app)
            .post('/api/analytics/events')
            .send({ event_type: 'click' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation échouée');
    });

    test('POST /api/analytics/events - valid (DB fails)', async () => {
        const res = await request(app)
            .post('/api/analytics/events')
            .send({ event_type: 'click', page_url: '/test' });
        expect([201, 500]).toContain(res.status);
    });

    test('POST /api/analytics/events - empty body', async () => {
        const res = await request(app)
            .post('/api/analytics/events')
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation échouée');
    });
});

describe('Authentication', () => {
    test('GET /api/chats without token returns 401', async () => {
        const res = await request(app).get('/api/chats');
        expect(res.status).toBe(401);
    });

    test('GET /api/storage/files without token returns 401', async () => {
        const res = await request(app).get('/api/storage/files');
        expect(res.status).toBe(401);
    });

    test('GET /api/analytics/summary without token returns 401', async () => {
        const res = await request(app).get('/api/analytics/summary');
        expect(res.status).toBe(401);
    });
});

describe('Builder Module', () => {
    // Auth (endpoints requiring authentication)
    test('GET /api/builder/pages/:id/snapshots without token returns 401', async () => {
        const res = await request(app).get('/api/builder/pages/00000000-0000-0000-0000-000000000000/snapshots');
        expect(res.status).toBe(401);
    });

    test('GET /api/builder/plugins without token returns 401', async () => {
        const res = await request(app).get('/api/builder/plugins');
        expect(res.status).toBe(401);
    });

    test('POST /api/builder/templates without token returns 401', async () => {
        const res = await request(app)
            .post('/api/builder/templates')
            .send({ name: 'Test', category: 'hero' });
        expect(res.status).toBe(401);
    });

    test('DELETE /api/builder/components/:id without token returns 401', async () => {
        const res = await request(app).delete('/api/builder/components/00000000-0000-0000-0000-000000000000');
        expect(res.status).toBe(401);
    });

    // Auth-blocked (endpoints with auth that reject invalid token)
    test('POST /api/builder/pages/:id/snapshots invalid token returns 403', async () => {
        const res = await request(app)
            .post('/api/builder/pages/00000000-0000-0000-0000-000000000000/snapshots')
            .set('Authorization', 'Bearer bad-token')
            .send({ label: 'test', snapshot: {} });
        expect(res.status).toBe(403);
    });

    test('POST /api/builder/templates invalid token returns 403', async () => {
        const res = await request(app)
            .post('/api/builder/templates')
            .set('Authorization', 'Bearer bad-token')
            .send({ name: 'Test', category: 'hero' });
        expect(res.status).toBe(403);
    });

    test('PUT /api/builder/pages/:id/collaboration invalid token returns 403', async () => {
        const res = await request(app)
            .put('/api/builder/pages/00000000-0000-0000-0000-000000000000/collaboration')
            .set('Authorization', 'Bearer bad-token')
            .send({});
        expect(res.status).toBe(403);
    });

    // Public endpoint
    test('GET /api/builder/templates responds (public, 200 or 500 due to DB)', async () => {
        const res = await request(app).get('/api/builder/templates');
        expect([200, 500]).toContain(res.status);
    });

    test('GET /api/builder/components responds (public, 200 or 500 due to DB)', async () => {
        const res = await request(app).get('/api/builder/components');
        expect([200, 500]).toContain(res.status);
    });
});

describe('Public Endpoints', () => {
    test('GET /api/ai/status returns service statuses', async () => {
        const res = await request(app).get('/api/ai/status');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('Modules Mounted', () => {
    const publicRoutes = [
        { path: '/api/pages', status: [200, 500] },
        { path: '/api/blog-posts', status: [200, 500] },
        { path: '/api/blog-categories', status: [200, 500] },
        { path: '/api/site-settings', status: [200, 500] },
        { path: '/api/theme-settings', status: [200, 500] },
        { path: '/api/site-config', status: [200, 500] },
        // SSE endpoint excluded (hangs on open connection)
        { path: '/api/partners', status: [200, 500] },
        { path: '/api/quick-links', status: [200, 500] },
        { path: '/api/site-assets', status: [200, 500] },
        { path: '/api/gallery-items', status: [200, 500] },
        { path: '/api/home-slides', status: [200, 500] },
        { path: '/api/home-hero', status: [200, 500] },
        { path: '/api/home-stats', status: [200, 500] },
        { path: '/api/home-services', status: [200, 500] },
        { path: '/api/testimonials', status: [200, 500] },
        { path: '/api/electrical-standards', status: [200, 500] },
        { path: '/api/electrical-equipment', status: [200, 500] },
        { path: '/api/professional-training', status: [200, 500] },
        { path: '/api/certifications', status: [200, 500] },
        { path: '/api/network/electricians', status: [200, 500] },
        { path: '/api/electrical-certifications', status: [200, 500] },
        { path: '/api/download-buttons', status: [200, 500] },
        { path: '/api/documents', status: [200, 500] },
        { path: '/api/menu-items', status: [200, 500] },
        { path: '/api/construction-mode', status: [200, 500] },
        { path: '/api/builder/templates', status: [200, 500] },
        { path: '/api/builder/components', status: [200, 500] },
    ];

    publicRoutes.forEach(({ path, status }) => {
        test(`GET ${path} responds (200 or 500 due to DB)`, async () => {
            const res = await request(app).get(path);
            expect(status).toContain(res.status);
        });
    });
});
