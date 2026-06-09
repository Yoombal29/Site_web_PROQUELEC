/**
 * Tests pour le module de routes Auth & Users
 */
const express = require('express');
const { describe, it, before, after, mock } = require('node:test');
const assert = require('node:assert/strict');

// Mock pool
const mockPool = {
  query: mock.fn(),
  connect: mock.fn(() => Promise.resolve({
    query: mock.fn(),
    release: mock.fn(),
  })),
};

// Mock dependencies
const bcrypt = {
  hash: mock.fn((pwd, salt) => Promise.resolve(`hashed_${pwd}`)),
  compare: mock.fn((pwd, hash) => Promise.resolve(hash === `hashed_${pwd}`)),
};

const jwt = {
  sign: mock.fn((payload, secret, opts) => `token_${payload.email}_${secret}`),
};

const JWT_SECRET = 'test-secret';
const sendNewUserNotification = mock.fn(() => Promise.resolve({ success: true }));

const { mountAuthUsersRoutes } = require('../routes/inline/auth-users');

function createTestApp() {
  const app = express();
  app.use(express.json());
  mountAuthUsersRoutes(app, mockPool, { bcrypt, jwt, JWT_SECRET, sendNewUserNotification });
  return app;
}

describe('Auth & Users Routes', () => {
  let app;

  before(() => {
    app = createTestApp();
  });

  after(() => {
    mock.reset();
  });

  describe('POST /api/auth/login', () => {
    it('devrait rejeter un email manquant', async () => {
      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'test123' }),
      });
      assert.equal(res.statusCode, 400);
      const data = JSON.parse(res.body);
      assert.equal(data.error, 'Email et mot de passe requis');
    });

    it('devrait rejeter des identifiants invalides', async () => {
      mockPool.query.mock.mockImplementation(() =>
        Promise.resolve({ rows: [] })
      );

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }),
      });
      assert.equal(res.statusCode, 401);
      const data = JSON.parse(res.body);
      assert.equal(data.error, 'Identifiants invalides');
    });

    it('devrait authentifier un utilisateur valide', async () => {
      mockPool.query.mock.mockImplementation(() =>
        Promise.resolve({
          rows: [{
            id: '1',
            email: 'test@test.com',
            password_hash: 'hashed_password123',
            role: 'admin',
            is_active: true,
          }],
        })
      );

      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'password123' }),
      });
      assert.equal(res.statusCode, 200);
      const data = JSON.parse(res.body);
      assert.ok(data.access_token);
      assert.equal(data.user.email, 'test@test.com');
    });
  });

  describe('POST /api/auth/register', () => {
    it('devrait rejeter un mot de passe trop court', async () => {
      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: '12345' }),
      });
      assert.equal(res.statusCode, 400);
      const data = JSON.parse(res.body);
      assert.ok(data.error.includes('6 caractères'));
    });
  });

  describe('GET /api/users', () => {
    it('devrait retourner la liste des utilisateurs', async () => {
      mockPool.query.mock.mockImplementation(() =>
        Promise.resolve({
          rows: [
            { id: '1', email: 'admin@test.com', role: 'admin', status: true, created_at: new Date() },
            { id: '2', email: 'user@test.com', role: 'user', status: true, created_at: new Date() },
          ],
        })
      );

      // Mock authenticateToken middleware
      const res = await app.request('/api/users', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });
      assert.equal(res.statusCode, 200);
    });
  });
});
