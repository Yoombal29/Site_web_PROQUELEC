/**
 * Module de paiement PayDunya + autres providers sénégalais
 * Supporte : Orange Money, Wave, Free Money, Carte bancaire
 */
const axios = require('axios');
const crypto = require('crypto');

// ── Configuration ──
const PAYDUNYA_API_KEY = process.env.PAYDUNYA_API_KEY || 'votre_cle_api';
const PAYDUNYA_SECRET_KEY = process.env.PAYDUNYA_SECRET_KEY || 'votre_cle_secrete';
const PAYDUNYA_TOKEN_URL = 'https://app.paydunya.com/api/v1/authentication/authenticate';
const PAYDUNYA_INVOICE_URL = 'https://app.paydunya.com/api/v1/checkout-invoice/create';
const PAYDUNYA_CONFIRM_URL = 'https://app.paydunya.com/api/v1/checkout-invoice/confirm';
const SITE_URL = process.env.SITE_URL || 'https://proquelec.sn';

// ── Obtenir le token d'accès PayDunya ──
let paydunyaToken = null;
let tokenExpiry = null;

async function getPaydunyaToken() {
  if (paydunyaToken && tokenExpiry > Date.now()) return paydunyaToken;

  try {
    const response = await axios.post(PAYDUNA_TOKEN_URL, {
      api_key: PAYDUNA_API_KEY,
      secret_key: PAYDUNA_SECRET_KEY
    });
    paydunyaToken = response.data.token;
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    return paydunyaToken;
  } catch (err) {
    console.error('[PAYDUNYA] Token error:', err.message);
    throw new Error('Impossible d\'obtenir le token PayDunya');
  }
}

// ── Créer une facture PayDunya ──
async function createPaydunyaInvoice({
  amount,
  description,
  customerEmail,
  customerName,
  customerPhone,
  metadata
}) {
  const token = await getPaydunyaToken();

  const invoiceData = {
    invoice: {
      items: [{
        name: description,
        quantity: 1,
        unit_price: String(amount),
        total_price: String(amount)
      }],
      total_amount: String(amount),
      description
    },
    store: {
      name: 'PROQUELEC Sénégal',
      website_url: SITE_URL,
      logo_url: `${SITE_URL}/logo.png`
    },
    custom_data: metadata || {},
    actions: {
      cancel_url: `${SITE_URL}/abonnements?status=canceled`,
      return_url: `${SITE_URL}/abonnements?status=success`,
      callback_url: `${SITE_URL}/api/payments/webhook`
    },
    customer: {
      email: customerEmail,
      first_name: customerName?.split(' ')[0] || 'Client',
      last_name: customerName?.split(' ').slice(1).join(' ') || 'PROQUELEC',
      phone: customerPhone
    }
  };

  try {
    const response = await axios.post(PAYDUNA_INVOICE_URL, invoiceData, {
      headers: {
        'PAYDUNYA-MASTER-KEY': PAYDUNA_API_KEY,
        'PAYDUNYA-TOKEN': token,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.response_code === '00' || response.data.response_text === 'SUCCESS') {
      return {
        success: true,
        invoice_url: response.data.response_text === 'SUCCESS'
          ? `https://app.paydunya.com/checkout/${response.data.token}`
          : response.data.invoice_url,
        token: response.data.token,
        invoice_id: `PAYDUNYA-${Date.now()}`
      };
    }
    throw new Error(response.data.response_text || 'Erreur PayDunya');
  } catch (err) {
    console.error('[PAYDUNYA] Invoice error:', err.message);
    throw err;
  }
}

// ── Confirmer le paiement ──
async function confirmPaydunyaPayment(invoiceToken) {
  const token = await getPaydunyaToken();

  try {
    const response = await axios.get(`${PAYDUNA_CONFIRM_URL}/${invoiceToken}`, {
      headers: {
        'PAYDUNYA-MASTER-KEY': PAYDUNA_API_KEY,
        'PAYDUNYA-TOKEN': token
      }
    });
    return response.data;
  } catch (err) {
    console.error('[PAYDUNYA] Confirm error:', err.message);
    return null;
  }
}

module.exports = { createPaydunyaInvoice, confirmPaydunyaPayment };
