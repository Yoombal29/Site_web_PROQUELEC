/**
 * PayTech Payment Provider
 * Agrégateur local sénégalais
 * Wave, OM, Free, Cartes (Visa/Mastercard)
 * Frais: 1,5% à 2% (MM) / 2,5% à 3% (Cartes) | 24h à 72h
 */
const axios = require('axios');

const PROVIDER = {
  name: 'paytech',
  label: 'PayTech',
  icon: 'layers',
  fee: '1,5% à 3%',
  settlement: '24h à 72h',
  target: 'Développeurs, start-ups et TPE locales',
};

const PAYTECH_API_URL = process.env.PAYTECH_API_URL || 'https://api.paytech.sn/v1';
const PAYTECH_API_KEY = process.env.PAYTECH_API_KEY || '';
const PAYTECH_SECRET_KEY = process.env.PAYTECH_SECRET_KEY || '';

async function processPayment({ amount, currency, phone, description, metadata, methods }) {
  if (!PAYTECH_API_KEY) throw new Error('PayTech API not configured');
  try {
    const response = await axios.post(`${PAYTECH_API_URL}/checkout`, {
      item_name: description,
      item_price: String(amount),
      currency: currency || 'XOF',
      command_name: `CMD-${Date.now()}`,
      ref_command: `REF-${Date.now()}`,
      env: process.env.NODE_ENV === 'production' ? 'prod' : 'test',
      ipn_url: `${process.env.SITE_URL || 'https://proquelec.sn'}/api/webhooks/paytech`,
      success_url: `${process.env.SITE_URL || 'https://proquelec.sn'}/payment/success`,
      cancel_url: `${process.env.SITE_URL || 'https://proquelec.sn'}/payment/cancel`,
      custom_field: JSON.stringify(metadata || {}),
      ...(methods ? { payment_methods: methods.join(',') } : {}),
    }, {
      headers: {
        'API_KEY': PAYTECH_API_KEY,
        'API_SECRET': PAYTECH_SECRET_KEY,
        'Content-Type': 'application/json',
      },
    });
    return {
      success: true, provider: 'paytech',
      transactionId: response.data.token,
      paymentUrl: response.data.redirect_url,
      status: response.data.status,
      raw: response.data,
    };
  } catch (err) {
    console.error('[PAYTECH] Payment error:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
}

async function verifyPayment(transactionId) {
  try {
    const response = await axios.get(`${PAYTECH_API_URL}/checkout/${transactionId}`, {
      headers: { 'API_KEY': PAYTECH_API_KEY, 'API_SECRET': PAYTECH_SECRET_KEY },
    });
    return { success: true, status: response.data.status, data: response.data };
  } catch (err) {
    return { success: false, status: 'failed', error: err.message };
  }
}

async function handleWebhook(payload) {
  return {
    event: payload.event,
    transactionId: payload.token,
    status: payload.status === 'SUCCESS' ? 'completed' : 'failed',
    amount: payload.item_price,
    reference: payload.ref_command,
  };
}

module.exports = {
  PROVIDER, processPayment, verifyPayment, handleWebhook,
  isConfigured: () => !!PAYTECH_API_KEY && !!PAYTECH_SECRET_KEY,
};
