const { Router } = require('express');
const esign = require('./esign.service');

const router = Router();

router.post('/sign', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Données à signer requises' });
    const result = await esign.sign(data);
    res.json(result);
  } catch (err) {
    console.error('[ESIGN] Sign error:', err.message);
    res.status(err.code === 'CONFIG_ERROR' ? 503 : 500).json({ error: err.message });
  }
});

router.post('/verify', (req, res) => {
  try {
    const { data, signature } = req.body;
    if (!data || !signature) return res.status(400).json({ error: 'Données et signature requises' });
    const valid = esign.verify(data, signature);
    res.json({ valid });
  } catch (err) {
    console.error('[ESIGN] Verify error:', err.message);
    res.status(err.code === 'CONFIG_ERROR' ? 503 : 500).json({ error: err.message });
  }
});

module.exports = { router, basePath: '/api/esign' };
