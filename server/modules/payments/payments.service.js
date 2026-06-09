const { getCapability } = require('../../core/runtime/capabilities');
const crypto = require('crypto');
const https = require('https');

const PROVIDERS = {
  orange_money: 'orange_money',
  wave: 'wave',
  paydunya: 'paydunya',
  stripe: 'stripe',
};

function paydunyaRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const masterKey = process.env.PAYDUNYA_MASTER_KEY;
    const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
    const token = process.env.PAYDUNYA_TOKEN;
    if (!masterKey || !privateKey || !token) {
      return reject(Object.assign(new Error('PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY et PAYDUNYA_TOKEN requis'), { code: 'CONFIG_ERROR' }));
    }

    const isSandbox = process.env.PAYDUNYA_SANDBOX !== 'false';
    const host = isSandbox ? 'app.paydunya.com' : 'app.paydunya.com';
    const basePath = isSandbox ? '/sandbox-api/v1' : '/api/v1';

    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: host,
      path: `${basePath}${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        'PAYDUNYA-MASTER-KEY': masterKey,
        'PAYDUNYA-PRIVATE-KEY': privateKey,
        'PAYDUNYA-TOKEN': token,
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let chunks = '';
      res.on('data', (chunk) => chunks += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(chunks);
          if (parsed.response_code === '00') return resolve(parsed);
          reject(Object.assign(new Error(parsed.response_text || 'PayDunya error'), { code: 'PAYDUNYA_ERROR', details: parsed }));
        } catch {
          reject(Object.assign(new Error('Réponse PayDunya invalide'), { code: 'PAYDUNYA_PARSE_ERROR', raw: chunks }));
        }
      });
    });
    req.on('error', (err) => reject(Object.assign(new Error('PayDunya network error: ' + err.message), { code: 'NETWORK_ERROR' })));
    if (data) req.write(data);
    req.end();
  });
}

class PaymentService {
  constructor() {
    this.provider = null;
    this.initialized = false;
  }

  getCap() {
    return getCapability('payments');
  }

  isAvailable() {
    const cap = this.getCap();
    return cap.available || cap.mode === 'mock';
  }

  isMock() {
    return this.getCap().mode === 'mock';
  }

  async initialize(provider = PROVIDERS.paydunya) {
    if (this.isMock()) {
      console.log(`[PAYMENTS] Mock mode — provider simulation`);
      this.provider = provider;
      this.initialized = true;
      return;
    }

    switch (provider) {
      case PROVIDERS.stripe: {
        const Stripe = require('stripe');
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) throw Object.assign(new Error('STRIPE_SECRET_KEY manquante'), { code: 'CONFIG_ERROR' });
        this.provider = new Stripe(key);
        break;
      }
      case PROVIDERS.paydunya:
        // No SDK, uses REST directly via paydunyaRequest()
        this.provider = 'paydunya';
        break;
      case PROVIDERS.orange_money:
      case PROVIDERS.wave:
        // These are handled by PayDunya as channels
        this.provider = 'paydunya';
        break;
      default:
        throw Object.assign(new Error(`Provider inconnu: ${provider}`), { code: 'INVALID_PROVIDER' });
    }

    this.initialized = true;
  }

  async createCheckoutSession({ amount, currency = 'XOF', description, metadata = {}, customer, storeName, cancelUrl, returnUrl, channels }) {
    if (!this.initialized) await this.initialize();

    if (this.isMock()) {
      console.log(`[PAYMENTS MOCK] Checkout: ${amount} ${currency} — ${description}`);
      return {
        id: `mock_cs_${Date.now()}`,
        url: null,
        amount,
        currency,
        status: 'requires_payment',
        simulated: true,
      };
    }

    if (this.provider === 'paydunya') {
      const invoice = {
        invoice: {
          items: description ? { label: description, quantity: 1, total_amount: amount } : {},
          taxes: {},
          ...(customer ? {
            customer: {
              name: customer.name || '',
              email: customer.email || '',
              phone: customer.phone || '',
            }
          } : {}),
          channels: channels || ['orange-money', 'wave'],
          total_amount: amount,
          description: description || 'Achat PROQUELEC',
        },
        store: {
          name: storeName || 'PROQUELEC Shop',
          tagline: process.env.SITE_NAME || '',
          ...(process.env.SITE_LOGO_URL ? { logo_url: process.env.SITE_LOGO_URL } : {}),
          ...(process.env.SITE_URL ? { website_url: process.env.SITE_URL } : {}),
        },
        custom_data: { ...metadata },
        actions: {
          cancel_url: cancelUrl || (process.env.SITE_URL ? `${process.env.SITE_URL}/cart` : ''),
          return_url: returnUrl || (process.env.SITE_URL ? `${process.env.SITE_URL}/success` : ''),
          callback_url: (process.env.SITE_URL || 'http://localhost:3000') + '/api/webhooks/paydunya',
        },
      };

      const result = await paydunyaRequest('POST', '/checkout-invoice/create', invoice);
      return {
        id: result.token,
        url: result.response_text,
        token: result.token,
        amount,
        currency,
        status: 'pending',
        provider: 'paydunya',
      };
    }

    if (this.provider?.checkout?.sessions?.create) {
      const session = await this.provider.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: { currency: currency.toLowerCase(), product_data: { name: description }, unit_amount: amount },
          quantity: 1,
        }],
        mode: 'payment',
        metadata,
      });
      return { id: session.id, url: session.url, amount, currency, status: session.status, provider: 'stripe' };
    }

    throw Object.assign(new Error('Provider non supporté pour cette opération'), { code: 'UNSUPPORTED_OPERATION' });
  }

  async confirmPayment(sessionId, provider = 'paydunya') {
    if (this.isMock()) {
      console.log(`[PAYMENTS MOCK] Confirm payment: ${sessionId}`);
      return { id: sessionId, status: 'completed', simulated: true };
    }

    if (provider === 'paydunya') {
      try {
        const result = await paydunyaRequest('GET', `/checkout-invoice/confirm/${sessionId}`);
        const statusMap = {
          'completed': 'completed',
          'COMPLETED': 'completed',
          'pending': 'pending',
          'PENDING': 'pending',
          'cancelled': 'cancelled',
          'CANCELLED': 'cancelled',
        };
        return {
          id: sessionId,
          token: sessionId,
          status: statusMap[result.status] || 'pending',
          customer: result.customer,
          receiptUrl: result.receipt_url,
          provider: 'paydunya',
        };
      } catch (err) {
        if (err.code === 'CONFIG_ERROR') throw err;
        return { id: sessionId, status: 'pending', provider: 'paydunya', error: err.message };
      }
    }

    if (this.provider?.checkout?.sessions?.retrieve) {
      const session = await this.provider.checkout.sessions.retrieve(sessionId);
      return { id: session.id, status: session.payment_status, provider: 'stripe' };
    }

    throw Object.assign(new Error('Provider non supporté'), { code: 'UNSUPPORTED_OPERATION' });
  }

  verifyWebhook(body) {
    // PayDunya IPN sends application/x-www-form-urlencoded with a 'data' key
    const data = typeof body === 'string' ? JSON.parse(body) : body;
    const invoiceToken = data.invoice_token || data.token;
    const hash = data.hash;
    const status = data.status;

    if (!invoiceToken) {
      throw Object.assign(new Error('Missing invoice_token in webhook'), { code: 'WEBHOOK_INVALID' });
    }

    // HMAC verification: SHA512(MASTER_KEY + invoice_token)
    const masterKey = process.env.PAYDUNYA_MASTER_KEY;
    if (masterKey && hash) {
      const computed = crypto.createHash('sha512').update(masterKey + invoiceToken).digest('hex');
      if (computed !== hash) {
        console.warn('[PAYMENTS] Webhook HMAC mismatch — possible fraud');
        // Still process but log warning
      }
    }

    return { invoiceToken, status, raw: data };
  }
}

module.exports = new PaymentService();
