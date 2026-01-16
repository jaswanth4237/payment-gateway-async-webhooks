const Merchant = require('../models/merchantModel');

const authenticate = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const apiSecret = req.headers['x-api-secret'];

    if (!apiKey || !apiSecret) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', description: 'API credentials missing' } });
    }

    try {
        const merchant = await Merchant.findByCredentials(apiKey, apiSecret);

        if (!merchant) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', description: 'Invalid API credentials' } });
        }

        req.merchant = merchant;
        next();
    } catch (err) {
        console.error('Auth Error:', err);
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', description: 'Authentication failed' } });
    }
};

module.exports = authenticate;
