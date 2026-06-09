const axios = require('axios');
const PROVIDER = { name: 'flutterwave', label: 'Flutterwave', icon: 'globe', fee: '2,9% (local) / 3,8% (inter)', settlement: '48h à 72h', target: 'SaaS, start-ups globales, Shopify' };
const FW_SECRET_KEY = process.env.FW_SECRET_KEY || '';
const FW_API_URL = process.env.FW_API_URL || 'https://api.flutterwave.com/v3';

async function processPayment({ amount, currency, description, metadata }) {
  if (!FW_SECRET_KEY) throw new Error('Flutterwave API not configured');
  const txRef = `FW-${Date.now()}`;
  try {
    const response = await axios.post(`${FW_API_URL}/payments`, {
      tx_ref: txRef, amount: String(amount), currency: currency || 'XOF',
      redirect_url: `${process.env.SITE_URL || 'https://proquelec.sn'}/payment/success`,
      meta: metadata, customer: { email: metadata?.email || 'client@email.com' },
      customizations: { title: 'PROQUELEC', description },
    }, { headers: { Authorization: `Bearer ${FW_SECRET_KEY}`, 'Content-Type': 'application/json' } });
    return { success: true, provider: 'flutterwave', transactionId: txRef, paymentUrl: response.data.data?.link, status: 'pending', raw: response.data };
  } catch (err) { throw new Error(err.response?.data?.message || err.message); }
}

async function verifyPayment(transactionId) {
  try {
    const response = await axios.get(`${FW_API_URL}/transactions/${transactionId}/verify`, { headers: { Authorization: `Bearer ${FW_SECRET_KEY}` } });
    return { success: true, status: response.data.data?.status === 'successful' ? 'completed' : 'pending', data: response.data };
  } catch (err) { return { success: false, status: 'failed', error: err.message }; }
}

async function handleWebhook(payload) {
  return { event: payload.event, transactionId: payload.data?.tx_ref, status: payload.data?.status === 'successful' ? 'completed' : 'failed', amount: payload.data?.amount };
}

module.exports = { PROVIDER, processPayment, verifyPayment, handleWebhook, isConfigured: () => !!FW_SECRET_KEY };
