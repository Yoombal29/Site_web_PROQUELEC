/**
 * Service de gestion des permissions et abonnements côté admin
 */
const API = '/api';

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
}

async function fetchApi(path, options = {}) {
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token(),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) throw new Error((await res.text().catch(() => 'Erreur')) || 'Erreur reseau');
  return res.json();
}

export const adminApi = {
  // ── Permissions ──
  async getPermissions() {
    const d = await fetchApi(API + '/admin/permissions');
    return Array.isArray(d) ? d : d.permissions || d.data || [];
  },

  async getUserPermissions(userId) {
    const d = await fetchApi(API + '/user/permissions?user_id=' + userId);
    return d.permissions || [];
  },

  async setUserPermissions(userId, permissions) {
    return fetchApi(API + '/admin/users/' + userId + '/permissions', {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  },

  // ── Utilisateurs ──
  async getUsers() {
    return fetchApi(API + '/admin/users');
  },

  async updateUser(id, data) {
    return fetchApi(API + '/admin/users/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // ── Abonnements ──
  async getSubscriptionPlans() {
    return fetchApi(API + '/admin/subscription-plans');
  },

  async getUserSubscription(userId) {
    return fetchApi(API + '/admin/subscriptions/user/' + userId);
  },

  async setUserSubscription(userId, planId, endDate) {
    return fetchApi(API + '/admin/subscriptions/force', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, plan_id: planId, end_date: endDate }),
    });
  },

  async cancelSubscription(subscriptionId) {
    return fetchApi(API + '/admin/subscriptions/' + subscriptionId + '/cancel', {
      method: 'POST',
    });
  },

  async getAllSubscriptions() {
    return fetchApi(API + '/admin/subscriptions');
  },
};
