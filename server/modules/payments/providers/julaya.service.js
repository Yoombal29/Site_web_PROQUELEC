const axios = require('axios');
const PROVIDER = { name: 'julaya', label: 'Julaya (B2B)', icon: 'briefcase', fee: 'Sur mesure', settlement: 'Immédiat', target: 'Entreprises (Paiement salaires/fournisseurs)' };
const JULAYA_API_KEY = process.env.JULAYA_API_KEY || '';
const JULAYA_API_URL = process.env.JULAYA_API_URL || 'https://api.julaya.com/v1';

async function processPayment({ amount, currency, phone, description }) {
  if (!JULAYA_API_KEY) throw new Error('Julaya API not configured');
  try {
    const response = await axios.post(`${JULAYA_API_URL}/payouts`, {
      amount: String(amount), currency: currency || 'XOF', phone, description,
      reference: `JL-${Date.now()}`,
    }, { headers: { 'X-API-Key': JULAYA_API_KEY, 'Content-Type': 'application/json' } });
    return { success: true, provider: 'julaya', transactionId: response.data.id, status: 'pending', raw: response.data };
  } catch (err) { throw new Error(err.response?.data?.message || err.message); }
}

module.exports = { PROVIDER, processPayment, verifyPayment: async () => ({ success: true }), handleWebhook: (p) => ({ event: p.event, transactionId: p.id, status: p.status }), isConfigured: () => !!JULAYA_API_KEY };
