/**
 * PayDunya - Aggregateur sénégalais
 * Cartes bancaires, Orange Money, Wave, Free Money
 * Frais: Variable selon contrat | Reversement: 48h à 72h
 */
const paydunya = require('../paydunya.service');

const PROVIDER = {
  name: 'paydunya',
  label: 'PayDunya',
  icon: 'shield',
  fee: 'Variable selon contrat',
  settlement: '48h à 72h',
  target: 'Tous types de paiement au Sénégal',
};

module.exports = {
  PROVIDER,
  processPayment: paydunya.createPaydunyaInvoice,
  verifyPayment: paydunya.confirmPaydunyaPayment,
  handleWebhook: (payload) => ({
    event: payload.event,
    transactionId: payload.invoice_token,
    status: payload.status === 'COMPLETED' ? 'completed' : 'failed',
    amount: payload.amount,
  }),
  isConfigured: () => !!process.env.PAYDUNYA_API_KEY || !!process.env.PAYDUNYA_SECRET_KEY,
};
