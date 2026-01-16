const crypto = require('crypto');

const generateSignature = (payload, secret) => {
    return crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
};

const generateId = (prefix) => {
    return prefix + crypto.randomBytes(8).toString('hex');
};

module.exports = {
    generateSignature,
    generateId
};
