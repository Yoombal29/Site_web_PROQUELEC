/**
 * InTouch (TouchPay) Payment Provider
 * Wave, OM, Free, Cartes, Wari, etc.
 * Frais: 2% à 3,5% selon contrat | 48h à 72h
 */
const axios = require('axios');

const PROVIDER = {
  name: 'intouch',
  label: 'InTouch (TouchPay)',
  icon: 'smartphone',
  fee: '2% à 3,5%',
  settlement: '48h à 72h',
  target: 'Réseaux physiques, stations, grands comptes',
};

const INTOUCH_API_URL = process.env.INTOUCH_API_URL || 'https://api.intouch.com/v1';
const INTOUCH_MERCHANT_ID = process.env.INTOUCH_MERCHANT_ID || '';
const INTOUCH_API_KEY = process.env.INTOUCH_API_KEY || '';

async function processPayment({ amount, currency, phone, description }) {
  if (!INTOUCH_API_KEY) throw new Error('InTouch API not configured');
  try {
    const response = await axios.post(`${INTOUCH_API_URL}/payments`, {
      merchant_id: INTOUCH_MERCHANT_ID,
      amount: String(amount),
      currency: currency || 'XOF',
      phone,
      description,
      notify_url: `${process.env.SITE_URL || 'https://proquelec.sn'}/api/webhooks/intouch`,
    }, {
      headers: { 'Authorization': `Bearer ${INTOUCH_API_KEY}`, 'Content-Type': 'application/json' },
    });
    return {
      success: true, provider: 'intouch',
      transactionId: response.data.transaction_id,
      status: response.data.status,
      raw: response.data,
    };
  } catch (err) {
    console.error('[INTOUCH] Payment error:', err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
}

async function verifyPayment(transactionId) {
  try {
    const response = await axios.get(`${INTOUCH_API_URL}/payments/${transactionId}`, {
      headers: { 'Authorization': `Bearer ${INTOUCH_API_KEY}` },
    });
    return { success: true, status: response.data.status, data: response.data };
  } catch (err) {
    return { success: false, status: 'failed', error: err.message };
  }
}

async function handleWebhook(payload) {
  return {
    event: payload.type,
    transactionId: payload.transaction_id,
    status: payload.status === 'SUCCESSFUL' ? 'completed' : 'failed',
    amount: payload.amount,
  };
}

module.exports = {
  PROVIDER, processPayment, verifyPayment, handleWebhook,
  isConfigured: () => !!INTOUCH_API_KEY,
};
