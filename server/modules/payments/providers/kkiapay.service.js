const axios = require('axios');
const PROVIDER = { name: 'kkiapay', label: 'Kkiapay', icon: 'shopping-cart', fee: '2,5% à 3,5%', settlement: '48h', target: 'Petites boutiques e-commerce (WooCommerce)' };
const KKIAPAY_API_KEY = process.env.KKIAPAY_API_KEY || '';
const KKIAPAY_SECRET = process.env.KKIAPAY_SECRET || '';
const KKIAPAY_API_URL = process.env.KKIAPAY_API_URL || 'https://api.kkiapay.com/v1';

async function processPayment({ amount, currency, phone, description }) {
  if (!KKIAPAY_API_KEY) throw new Error('Kkiapay API not configured');
  try {
    const response = await axios.post(`${KKIAPAY_API_URL}/payments`, {
      api_key: KKIAPAY_API_KEY, secret: KKIAPAY_SECRET,
      amount: String(amount), currency: currency || 'XOF',
      phone, description, callback: `${process.env.SITE_URL || 'https://proquelec.sn'}/api/webhooks/kkiapay`,
    });
    return { success: true, provider: 'kkiapay', transactionId: response.data.id, paymentUrl: response.data.payment_url, status: response.data.status, raw: response.data };
  } catch (err) { throw new Error(err.response?.data?.message || err.message); }
}

module.exports = { PROVIDER, processPayment, verifyPayment: async (id) => ({ success: true, status: 'pending' }), handleWebhook: (p) => ({ event: p.type, transactionId: p.id, status: p.status === 'SUCCESS' ? 'completed' : 'failed' }), isConfigured: () => !!KKIAPAY_API_KEY };
