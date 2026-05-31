const crypto = require('crypto');
const { getCapability } = require('../../core/runtime/capabilities');

class EsignService {
  getCap() {
    return getCapability('electronicSignature');
  }

  isAvailable() {
    const cap = this.getCap();
    return cap.available || cap.mode === 'mock';
  }

  isMock() {
    return this.getCap().mode === 'mock';
  }

  async sign(data) {
    if (this.isMock()) {
      const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
      console.log('[ESIGN MOCK] Signature générée (SHA256)');
      return {
        signature: hash,
        algorithm: 'SHA256',
        timestamp: new Date().toISOString(),
        simulated: true,
      };
    }

    const privateKey = process.env.ESIGN_PRIVATE_KEY;
    if (!privateKey) {
      throw Object.assign(new Error('Clé privée de signature non configurée'), { code: 'CONFIG_ERROR' });
    }

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(JSON.stringify(data));
    sign.end();
    const signature = sign.sign(privateKey, 'base64');

    return {
      signature,
      algorithm: 'RSA-SHA256',
      certificate: process.env.ESIGN_CERTIFICATE || null,
      timestamp: new Date().toISOString(),
    };
  }

  verify(data, signature) {
    const publicKey = process.env.ESIGN_PUBLIC_KEY;
    if (!publicKey) {
      throw Object.assign(new Error('Clé publique de vérification non configurée'), { code: 'CONFIG_ERROR' });
    }

    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(JSON.stringify(data));
    verify.end();
    return verify.verify(publicKey, signature, 'base64');
  }
}

module.exports = new EsignService();
