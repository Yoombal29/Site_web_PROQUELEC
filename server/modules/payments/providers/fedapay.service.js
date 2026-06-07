const axios = require('axios');
const PROVIDER = { name: 'fedapay', label: 'FedaPay', icon: 'globe', fee: '1% à 4% selon méthode', settlement: '72h', target: 'E-commerçants d\'Afrique de l\'Ouest' };
const FEDAPAY_API_KEY = process.env.FEDAPAY_API_KEY || '';
const FEDAPAY_API_URL = process.env.FEDAPAY_API_URL || 'https://api.fedapay.com/v1';
const FEDAPAY_SECRET = process.env.FEDAPAY_SECRET || '';

async function processPayment({ amount, currency, description }) {
  if (!FEDAPAY_API_KEY) throw new Error('FedaPay API not configured');
  const token = Buffer.from(`${FEDAPAY_API_KEY}:${FEDAPAY_SECRET || ''}`).toString('base64');
  try {
    const response = await axios.post(`${FEDAPAY_API_URL}/transactions`, {
      amount: String(amount), currency: { iso: currency || 'XOF' }, description,
      callback_url: `${process.env.SITE_URL || 'https://proquelec.sn'}/api/webhooks/fedapay`,
    }, { headers: { Authorization: `Basic ${token}`, 'Content-Type': 'application/json', 'X-API-Version': '1' } });
    return { success: true, provider: 'fedapay', transactionId: response.data.id, paymentUrl: response.data.url, status: response.data.status, raw: response.data };
  } catch (err) { throw new Error(err.response?.data?.message || err.message); }
}

async function verifyPayment(transactionId) {
  const token = Buffer.from(`${FEDAPAY_API_KEY}:${FEDAPAY_SECRET || ''}`).toString('base64');
  try {
    const response = await axios.get(`${FEDAPAY_API_URL}/transactions/${transactionId}`, { headers: { Authorization: `Basic ${token}` } });
    return { success: true, status: response.data.status === 'approved' ? 'completed' : response.data.status, data: response.data };
  } catch (err) { return { success: false, status: 'failed', error: err.message }; }
}

module.exports = { PROVIDER, processPayment, verifyPayment, handleWebhook: (p) => ({ event: p.event, transactionId: p.id, status: p.status === 'approved' ? 'completed' : 'failed' }), isConfigured: () => !!FEDAPAY_API_KEY };
