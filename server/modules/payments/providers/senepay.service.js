/**
 * SenePay Payment Provider
 * Agrégateur local - Wave, OM, Free Money, International
 * Frais: 1,8% (Taux fixe) + frais op. | 24h à 48h
 */
const axios = require('axios');

const PROVIDER = {
  name: 'senepay',
  label: 'SenePay',
  icon: 'credit-card',
  fee: '1,8% + frais op.',
  settlement: '24h à 48h',
  target: 'E-commerce moderne, intégration rapide',
};

const SENEPAY_API_URL = process.env.SENEPAY_API_URL || 'https://api.senepay.sn/v2';
const SENEPAY_API_KEY = process.env.SENEPAY_API_KEY || '';
const SENEPAY_SECRET = process.env.SENEPAY_SECRET || '';

async function processPayment({ amount, currency, phone, description, metadata }) {
  if (!SENEPAY_API_KEY) throw new Error('SenePay API not configured');
  try {
    const response = await axios.post(`${SENEPAY_API_URL}/transactions`, {
      amount: String(amount),
      currency: currency || 'XOF',
      phone,
      description,
      callback_url: `${process.env.SITE_URL || 'https://proquelec.sn'}/api/webhooks/senepay`,
      reference: `SP-${Date.now()}`,
      metadata,
    }, {
      headers: {
        'X-API-Key': SENEPAY_API_KEY,
        'X-API-Secret': SENEPAY_SECRET,
        'Content-Type': 'application/json',
      },
    });
    return {
      success: true, provider: 'senepay',
      transactionId: response.data.id,
      paymentUrl: response.data.payment_url,
      status: response.data.status,
      raw: response.data,
    };
  } catch (err) {
    console.error('[SENEPAY] Payment error:', err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
}

async function verifyPayment(transactionId) {
  try {
    const response = await axios.get(`${SENEPAY_API_URL}/transactions/${transactionId}`, {
      headers: { 'X-API-Key': SENEPAY_API_KEY },
    });
    return { success: true, status: response.data.status, data: response.data };
  } catch (err) {
    return { success: false, status: 'failed', error: err.message };
  }
}

async function handleWebhook(payload) {
  return {
    event: payload.event,
    transactionId: payload.id,
    status: payload.status === 'completed' ? 'completed' : 'failed',
    amount: payload.amount,
    reference: payload.reference,
  };
}

module.exports = {
  PROVIDER, processPayment, verifyPayment, handleWebhook,
  isConfigured: () => !!SENEPAY_API_KEY,
};
