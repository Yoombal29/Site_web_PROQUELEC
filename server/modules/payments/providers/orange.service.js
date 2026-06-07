/**
 * Orange Money Web Payment Provider
 * Direct operator integration for Orange Money (Sénégal)
 * Frais: 1% (Plafonné à 500 F) | Reversement: 24h à 48h
 */
const axios = require('axios');

const PROVIDER = {
  name: 'orange',
  label: 'Orange Money Web',
  icon: 'smartphone',
  fee: '1% (plafonné 500 F)',
  settlement: '24h à 48h',
  target: 'Grandes entreprises, services de masse',
};

const ORANGE_API_URL = process.env.ORANGE_API_URL || 'https://api.orange.com';
const ORANGE_CLIENT_ID = process.env.ORANGE_CLIENT_ID || '';
const ORANGE_CLIENT_SECRET = process.env.ORANGE_CLIENT_SECRET || '';
const ORANGE_MERCHANT_CODE = process.env.ORANGE_MERCHANT_CODE || '';

let accessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  if (accessToken && tokenExpiry > Date.now()) return accessToken;
  try {
    const response = await axios.post(`${ORANGE_API_URL}/oauth/v2/token`,
      `grant_type=client_credentials&client_id=${ORANGE_CLIENT_ID}&client_secret=${ORANGE_CLIENT_SECRET}`,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' } }
    );
    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    return accessToken;
  } catch (err) {
    console.error('[ORANGE] Token error:', err.message);
    throw new Error('Orange Money authentication failed');
  }
}

async function processPayment({ amount, currency, phone, description, metadata }) {
  if (!ORANGE_CLIENT_ID) throw new Error('Orange Money API not configured');
  const token = await getAccessToken();
  try {
    const response = await axios.post(`${ORANGE_API_URL}/orange-money-web/dev/v1/payment`, {
      merchant: { merchant_number: ORANGE_MERCHANT_CODE },
      partner: { phone },
      order: { amount: String(amount), currency: currency || 'XOF', description, reference: `OM-${Date.now()}` },
      callback_urL: `${process.env.SITE_URL || 'https://proquelec.sn'}/api/webhooks/orange`,
    }, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return {
      success: true, provider: 'orange', transactionId: response.data.pay_token,
      reference: response.data.order?.reference, status: response.data.status,
      raw: response.data,
    };
  } catch (err) {
    console.error('[ORANGE] Payment error:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
}

async function verifyPayment(transactionId) {
  const token = await getAccessToken();
  try {
    const response = await axios.get(`${ORANGE_API_URL}/orange-money-web/dev/v1/payment/status/${transactionId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return { success: true, status: response.data.status, data: response.data };
  } catch (err) {
    return { success: false, status: 'failed', error: err.message };
  }
}

async function handleWebhook(payload) {
  return {
    event: payload.event_type,
    transactionId: payload.pay_token,
    status: payload.status === 'SUCCESS' ? 'completed' : 'failed',
    amount: payload.amount,
    reference: payload.order?.reference,
  };
}

module.exports = {
  PROVIDER, processPayment, verifyPayment, handleWebhook,
  isConfigured: () => !!ORANGE_CLIENT_ID,
};
