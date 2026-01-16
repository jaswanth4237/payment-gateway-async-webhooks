const WebhookLog = require('../models/webhookModel');
const Merchant = require('../models/merchantModel');
const { webhookQueue } = require('../queues');
const { v4: uuidv4 } = require('uuid');

exports.listWebhooks = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { data, total } = await WebhookLog.findByMerchant(req.merchant.id, limit, offset);
    res.json({ data, total, limit, offset });
};

exports.retryWebhook = async (req, res) => {
    const log = await WebhookLog.findById(req.params.id);
    if (!log || log.merchant_id !== req.merchant.id) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Webhook log not found' } });
    }

    await WebhookLog.resetRetry(log.id);
    await webhookQueue.add({
        merchantId: log.merchant_id,
        event: log.event,
        payload: log.payload,
        webhookLogId: log.id
    });

    res.json({ id: log.id, status: 'pending', message: 'Webhook retry scheduled' });
};

exports.updateConfig = async (req, res) => {
    await Merchant.updateWebhookConfig(req.merchant.id, req.body.webhook_url);
    res.json({ success: true, webhook_url: req.body.webhook_url });
};

exports.regenerateSecret = async (req, res) => {
    const newSecret = 'whsec_' + uuidv4().replace(/-/g, '').substring(0, 16);
    await Merchant.updateWebhookSecret(req.merchant.id, newSecret);
    res.json({ webhook_secret: newSecret });
};
