const Refund = require('../models/refundModel');
const Payment = require('../models/paymentModel');
const { refundQueue, webhookQueue } = require('../queues');
const { generateId } = require('../utils/crypto');

exports.createRefund = async (req, res) => {
    const { id: paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = await Payment.findByIdAndMerchant(paymentId, req.merchant.id);
    if (!payment) return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Payment not found' } });

    if (payment.status !== 'success') {
        return res.status(400).json({ error: { code: 'BAD_REQUEST_ERROR', description: 'Only successful payments can be refunded' } });
    }

    const totalRefunded = await Refund.getTotalRefunded(paymentId);

    if (parseInt(amount) > (payment.amount - totalRefunded)) {
        return res.status(400).json({ error: { code: 'BAD_REQUEST_ERROR', description: 'Refund amount exceeds available amount' } });
    }

    const refundId = generateId('rfnd_');
    const refundData = {
        id: refundId,
        payment_id: paymentId,
        merchant_id: req.merchant.id,
        amount: parseInt(amount),
        reason: reason || '',
        status: 'pending'
    };

    const refund = await Refund.create(refundData);

    // Webhook for Creation
    await webhookQueue.add({
        merchantId: req.merchant.id,
        event: 'refund.created',
        payload: {
            event: 'refund.created',
            timestamp: Math.floor(Date.now() / 1000),
            data: { refund: { ...refund, created_at: new Date().toISOString() } }
        }
    });

    await refundQueue.add({ refundId });
    res.status(201).json({ ...refund, created_at: new Date().toISOString() });
};

exports.getRefund = async (req, res) => {
    const refund = await Refund.findByIdAndMerchant(req.params.id, req.merchant.id);
    if (!refund) return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Refund not found' } });
    res.json(refund);
};
