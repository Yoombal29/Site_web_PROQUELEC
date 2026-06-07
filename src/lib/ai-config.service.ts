/**
 * Service de configuration IA — stockée côté serveur (PostgreSQL)
 * Remplace localStorage pour les clés API, mots de passe, etc.
 */

const API_BASE = '/api/ai';

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') || '';
}

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken(),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text().catch(() => 'Erreur reseau');
    throw new Error(err);
  }
  return res.json();
}

export const configApi = {
  /** Charge toutes les configs depuis le serveur */
  async load() {
    const data = await apiFetch('/config');
    return data.configs || {};
  },

  /** Sauvegarde une ou plusieurs configs */
  async save(configs) {
    return apiFetch('/config', {
      method: 'POST',
      body: JSON.stringify({ configs }),
    });
  },

  /** Change le mot de passe superadmin (hashé côté serveur) */
  async changeAdminPassword(password) {
    return apiFetch('/change-admin-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
};
