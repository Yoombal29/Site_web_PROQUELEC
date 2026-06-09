/**
 * Adaptateur pour l'API COSSUEL (https://espace.cossuel.sn)
 * 
 * Authentification par token, récupération des dossiers et inspections.
 * Mode MOCK pour le développement — basculer MOCK_MODE=false dans .env pour live.
 */

const axios = require('axios');
const { getCapability } = require('../core/runtime/capabilities');
const { sleep } = require('../core/utils');

const COSSUEL_API_URL = process.env.COSSUEL_API_URL || 'https://espace.cossuel.sn/api';
const COSSUEL_USERNAME = process.env.COSSUEL_USERNAME;
const COSSUEL_PASSWORD = process.env.COSSUEL_PASSWORD;
const MAX_RETRIES = 3;

function isActive() {
  const cap = getCapability('cossuel');
  return cap.available || cap.mode === 'mock';
}

function isMock() {
  return getCapability('cossuel').mode === 'mock';
}

function api() {
  return axios.create({
    baseURL: COSSUEL_API_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });
}

const MOCK_DATA = {
  dossiers: [
    { id: 'DOS-2024-001', region: 'Dakar', status: 'CONFORME', type: 'Residentiel', date: '2024-01-15' },
    { id: 'DOS-2024-002', region: 'Thies', status: 'NON_CONFORME', type: 'Tertiaire', date: '2024-01-16' },
    { id: 'DOS-2024-003', region: 'Saint-Louis', status: 'A_PROGRAMMER', type: 'Industriel', date: '2024-01-17' },
    { id: 'DOS-2024-004', region: 'Dakar', status: 'REJETE', type: 'Residentiel', date: '2024-01-18' },
    { id: 'DOS-2024-005', region: 'Ziguinchor', status: 'CONFORME', type: 'Residentiel', date: '2024-01-19' },
  ],
};

class CossuelAdapter {
  constructor() {
    this.token = null;
    this.tokenExpiresAt = null;
  }

  async authenticate() {
    if (isMock()) {
      console.log('[COSSUEL] Mock Authentication Success');
      this.token = 'mock-token-123';
      return;
    }

    if (!COSSUEL_USERNAME || !COSSUEL_PASSWORD) {
      throw Object.assign(new Error('COSSUEL_USERNAME et COSSUEL_PASSWORD requis'), { code: 'CONFIG_ERROR' });
    }

    let lastErr;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[COSSUEL] Authenticating (attempt ${attempt}/${MAX_RETRIES})...`);
        const res = await api().post('/login', {
          username: COSSUEL_USERNAME,
          password: COSSUEL_PASSWORD,
        });
        this.token = res.data.token || res.data.access_token;
        this.tokenExpiresAt = res.data.expires_in
          ? Date.now() + res.data.expires_in * 1000
          : Date.now() + 3600_000;
        console.log('[COSSUEL] Authenticated successfully');
        return;
      } catch (err) {
        lastErr = err;
        console.error(`[COSSUEL] Auth attempt ${attempt} failed:`, err.response?.status, err.message);
        if (err.response?.status === 401) break;
        if (attempt < MAX_RETRIES) await sleep(1000 * attempt);
      }
    }
    throw lastErr;
  }

  async ensureToken() {
    if (!this.token || (this.tokenExpiresAt && Date.now() >= this.tokenExpiresAt - 60_000)) {
      await this.authenticate();
    }
  }

  async fetchRecentDossiers(days = 7) {
    await this.ensureToken();

    if (isMock()) {
      console.log(`[COSSUEL] Fetching dossiers for last ${days} days (MOCK)`);
      const regions = ['Dakar', 'Thies', 'Diourbel', 'Saint-Louis', 'Ziguinchor', 'Kaolack'];
      const statuses = ['CONFORME', 'NON_CONFORME', 'A_PROGRAMMER', 'INSPECTE'];
      const extraData = Array.from({ length: 20 }, (_, i) => ({
        id: `DOS-MOCK-${100 + i}`,
        region: regions[Math.floor(Math.random() * regions.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        type: Math.random() > 0.7 ? 'Industriel' : 'Residentiel',
        date: new Date(Date.now() - Math.floor(Math.random() * days * 86400000)).toISOString(),
      }));
      return [...MOCK_DATA.dossiers, ...extraData];
    }

    let lastErr;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await api().get('/dossier/all', {
          params: { since: days },
          headers: { Authorization: `Bearer ${this.token}` },
        });
        return res.data;
      } catch (err) {
        lastErr = err;
        if (err.response?.status === 401) {
          console.warn('[COSSUEL] Token expired, re-authenticating...');
          this.token = null;
          await this.ensureToken();
          continue;
        }
        console.error(`[COSSUEL] fetchRecentDossiers attempt ${attempt} failed:`, err.message);
        if (attempt < MAX_RETRIES) await sleep(1000 * attempt);
      }
    }
    throw lastErr;
  }

  async fetchInspectionDetails(dossierId) {
    await this.ensureToken();

    if (isMock()) {
      return {
        id: `INSP-${dossierId}`,
        dossier_id: dossierId,
        inspector: 'Inspecteur Test',
        date: new Date().toISOString(),
        result: Math.random() > 0.8 ? 'CONFORME' : 'NON_CONFORME',
        defects: ['Mise à la terre insuffisante', 'Câblage non sécurisé'],
      };
    }

    let lastErr;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await api().get(`/dossier/${dossierId}/inspection`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        return res.data;
      } catch (err) {
        lastErr = err;
        if (err.response?.status === 401) {
          this.token = null;
          await this.ensureToken();
          continue;
        }
        console.error(`[COSSUEL] fetchInspectionDetails attempt ${attempt} failed:`, err.message);
        if (attempt < MAX_RETRIES) await sleep(1000 * attempt);
      }
    }
    throw lastErr;
  }
}

module.exports = new CossuelAdapter();
