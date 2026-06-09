/**
 * CinetPay Payment Provider - Panafricain
 * Wave, OM, Free, Cartes (15 pays d'Afrique)
 * Frais: 1,5% à 3,5% | 72h
 */
const axios = require('axios');
const crypto = require('crypto');

const PROVIDER = {
  name: 'cinetpay',
  label: 'CinetPay',
  icon: 'globe',
  fee: '1,5% à 3,5%',
  settlement: '72h',
  target: 'Entreprises visant le Sénégal + la sous-région',
};

const CINETPAY_API_URL = process.env.CINETPAY_API_URL || 'https://api.cinetpay.com/v1';
const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY || '';
const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID || '';

async function processPayment({ amount, currency, phone, description, metadata }) {
  if (!CINETPAY_API_KEY) throw new Error('CinetPay API not configured');
  const transactionId = `CP-${Date.now()}`;
  try {
    const response = await axios.post(`${CINETPAY_API_URL}/checkout`, {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount: String(amount),
      currency: currency || 'XOF',
      description,
      phone,
      notify_url: `${process.env.SITE_URL || 'https://proquelec.sn'}/api/webhooks/cinetpay`,
      return_url: `${process.env.SITE_URL || 'https://proquelec.sn'}/payment/success`,
      cancel_url: `${process.env.SITE_URL || 'https://proquelec.sn'}/payment/cancel`,
      metadata: JSON.stringify(metadata || {}),
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
    return {
      success: true, provider: 'cinetpay',
      transactionId,
      paymentUrl: response.data.data?.payment_url,
      status: response.data.code === '00' ? 'pending' : 'failed',
      raw: response.data,
    };
  } catch (err) {
    console.error('[CINETPAY] Payment error:', err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
}

async function verifyPayment(transactionId) {
  try {
    const response = await axios.post(`${CINETPAY_API_URL}/checkout/status`, {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: transactionId,
    });
    return { success: true, status: response.data.code === '00' ? 'completed' : 'pending', data: response.data };
  } catch (err) {
    return { success: false, status: 'failed', error: err.message };
  }
}

async function handleWebhook(payload) {
  return {
    event: payload.event,
    transactionId: payload.transaction_id,
    status: payload.status === '00' ? 'completed' : 'failed',
    amount: payload.amount,
    reference: payload.transaction_id,
  };
}

module.exports = {
  PROVIDER, processPayment, verifyPayment, handleWebhook,
  isConfigured: () => !!CINETPAY_API_KEY,
};
