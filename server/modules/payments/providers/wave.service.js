/**
 * Wave Business Payment Provider
 * Direct operator integration for Wave (Sénégal)
 * Frais: 1% | Reversement: Immédiat
 */
const axios = require('axios');

const PROVIDER = {
  name: 'wave',
  label: 'Wave Business',
  icon: 'zap',
  fee: '1%',
  settlement: 'Immédiat',
  target: 'Boutiques physiques et e-commerce local',
};

const WAVE_API_URL = process.env.WAVE_API_URL || 'https://api.wave.com/v1';
const WAVE_API_KEY = process.env.WAVE_API_KEY || '';
const WAVE_SECRET_KEY = process.env.WAVE_SECRET_KEY || '';

async function processPayment({ amount, currency, phone, description, metadata }) {
  if (!WAVE_API_KEY) throw new Error('Wave API key not configured');
  try {
    const response = await axios.post(`${WAVE_API_URL}/payments`, {
      amount,
      currency: currency || 'XOF',
      phone,
      description,
      metadata,
      callback_url: `${process.env.SITE_URL || 'https://proquelec.sn'}/api/webhooks/wave`,
    }, {
      headers: {
        'Authorization': `Bearer ${WAVE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    return {
      success: true,
      provider: 'wave',
      transactionId: response.data.id,
      reference: response.data.reference,
      status: response.data.status,
      paymentUrl: response.data.payment_url,
      raw: response.data,
    };
  } catch (err) {
    console.error('[WAVE] Payment error:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
}

async function verifyPayment(transactionId) {
  try {
    const response = await axios.get(`${WAVE_API_URL}/payments/${transactionId}`, {
      headers: { 'Authorization': `Bearer ${WAVE_API_KEY}` },
    });
    return { success: true, status: response.data.status, data: response.data };
  } catch (err) {
    console.error('[WAVE] Verify error:', err.message);
    return { success: false, status: 'failed', error: err.message };
  }
}

async function handleWebhook(payload) {
  // Wave webhook payload processing
  const { event, data } = payload;
  return {
    event,
    transactionId: data?.id,
    status: event === 'payment.success' ? 'completed' : 'failed',
    amount: data?.amount,
    reference: data?.reference,
  };
}

module.exports = {
  PROVIDER,
  processPayment,
  verifyPayment,
  handleWebhook,
  isConfigured: () => !!WAVE_API_KEY,
};
