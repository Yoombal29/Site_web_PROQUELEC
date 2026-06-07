/**
 * Free Money Payment Provider
 * Direct operator integration for Free Money (Sénégal)
 * Frais: 1% à 1,5% | Reversement: 24h à 48h
 */
const axios = require('axios');

const PROVIDER = {
  name: 'free',
  label: 'Free Money',
  icon: 'signal',
  fee: '1% à 1,5%',
  settlement: '24h à 48h',
  target: 'PME voulant toucher tous les abonnés Free',
};

const FREE_API_URL = process.env.FREE_API_URL || 'https://api.freemoney.sn/v1';
const FREE_API_KEY = process.env.FREE_API_KEY || '';
const FREE_MERCHANT_ID = process.env.FREE_MERCHANT_ID || '';

async function processPayment({ amount, currency, phone, description }) {
  if (!FREE_API_KEY) throw new Error('Free Money API not configured');
  try {
    const response = await axios.post(`${FREE_API_URL}/payment`, {
      merchant_id: FREE_MERCHANT_ID,
      amount: String(amount),
      currency: currency || 'XOF',
      phone,
      description,
      notify_url: `${process.env.SITE_URL || 'https://proquelec.sn'}/api/webhooks/free`,
      reference: `FREE-${Date.now()}`,
    }, {
      headers: { 'Authorization': `Bearer ${FREE_API_KEY}`, 'Content-Type': 'application/json' },
    });
    return {
      success: true, provider: 'free', transactionId: response.data.transaction_id,
      status: response.data.status, paymentUrl: response.data.payment_url,
      raw: response.data,
    };
  } catch (err) {
    console.error('[FREE] Payment error:', err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
}

async function verifyPayment(transactionId) {
  try {
    const response = await axios.get(`${FREE_API_URL}/payment/${transactionId}`, {
      headers: { 'Authorization': `Bearer ${FREE_API_KEY}` },
    });
    return { success: true, status: response.data.status, data: response.data };
  } catch (err) {
    return { success: false, status: 'failed', error: err.message };
  }
}

async function handleWebhook(payload) {
  return {
    event: payload.event,
    transactionId: payload.transaction_id,
    status: payload.status === 'SUCCESS' ? 'completed' : 'failed',
    amount: payload.amount,
  };
}

module.exports = {
  PROVIDER, processPayment, verifyPayment, handleWebhook,
  isConfigured: () => !!FREE_API_KEY,
};
