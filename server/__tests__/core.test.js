/**
 * Tests pour les modules Core (errors, middleware, sse)
 */
const { describe, it, before, mock } = require('node:test');
const assert = require('node:assert/strict');

describe('Core Errors Module', () => {
  let AppError, handleAppError, ERROR_CATALOG;

  before(async () => {
    const mod = require('../core/errors');
    AppError = mod.AppError;
    handleAppError = mod.handleAppError;
    ERROR_CATALOG = mod.ERROR_CATALOG;
  });

  describe('AppError', () => {
    it('devrait créer une erreur avec le bon code et status', () => {
      const err = new AppError('AUTH_INVALID');
      assert.equal(err.code, 'AUTH_INVALID');
      assert.equal(err.status, 401);
      assert.equal(err.icon, 'Lock');
      assert.ok(err.message.includes('Oups'));
    });

    it('devrait utiliser FATAL_STRIKE pour les codes inconnus', () => {
      const err = new AppError('UNKNOWN_CODE');
      assert.equal(err.code, 'UNKNOWN_CODE');
      assert.equal(err.status, 500);
      assert.equal(err.icon, 'Hammer');
    });

    it('devrait inclure les détails optionnels', () => {
      const err = new AppError('DB_NOT_FOUND', 'Page introuvable');
      assert.equal(err.details, 'Page introuvable');
    });

    it('fromStatus devrait mapper 404 vers DB_NOT_FOUND', () => {
      const err = AppError.fromStatus(404);
      assert.equal(err.code, 'DB_NOT_FOUND');
      assert.equal(err.status, 404);
    });

    it('fromStatus devrait mapper 401 vers AUTH_INVALID', () => {
      const err = AppError.fromStatus(401);
      assert.equal(err.code, 'AUTH_INVALID');
      assert.equal(err.status, 401);
    });
  });

  describe('ERROR_CATALOG', () => {
    it('devrait contenir toutes les erreurs requises', () => {
      const required = ['AUTH_INVALID', 'AUTH_EXPIRED', 'AUTH_DENIED', 'DB_BUSY', 'DB_CONFLICT', 'DB_NOT_FOUND', 'DB_CONSTRAINT', 'VALIDATION_ERROR', 'FATAL_STRIKE'];
      for (const key of required) {
        assert.ok(ERROR_CATALOG[key], `Erreur manquante: ${key}`);
        assert.ok(ERROR_CATALOG[key].status, `${key}: status manquant`);
        assert.ok(ERROR_CATALOG[key].message, `${key}: message manquant`);
      }
    });
  });
});

describe('Core Middleware', () => {
  describe('authenticateToken', () => {
    it('devrait rejeter une requête sans token', async () => {
      const { authenticateToken } = require('../core/middleware');

      const req = { headers: {} };
      const res = {
        status: mock.fn(() => res),
        json: mock.fn(() => {}),
      };
      const next = mock.fn();

      authenticateToken(req, res, next);

      assert.equal(res.status.mock.calls[0].arguments[0], 401);
    });
  });
});

describe('SSE Module', () => {
  it('devrait gérer les connexions et déconnexions', () => {
    const { addSseClient, removeSseClient, getSseStats } = require('../core/sse');

    const statsBefore = getSseStats();
    assert.equal(statsBefore.activeConnections, 0);

    const mockRes = {
      writableEnded: false,
      destroyed: false,
      write: mock.fn(),
    };

    addSseClient(mockRes);
    const statsAfter = getSseStats();
    assert.equal(statsAfter.activeConnections, 1);
    assert.equal(statsAfter.totalConnections, 1);

    removeSseClient(mockRes);
    const statsFinal = getSseStats();
    assert.equal(statsFinal.activeConnections, 0);
    assert.equal(statsFinal.totalConnections, 1);
  });
});
