const Payment = require('../models/paymentModel');
const IdempotencyKey = require('../models/idempotencyModel');
const { paymentQueue, webhookQueue } = require('../queues');
const { generateId } = require('../utils/crypto');

exports.createPayment = async (req, res) => {
    const idempotencyKey = req.headers['idempotency-key'];
    const { order_id, amount, method, vpa } = req.body;

    if (idempotencyKey) {
        const existing = await IdempotencyKey.findValid(idempotencyKey, req.merchant.id);
        if (existing) {
            return res.status(201).json(existing.response);
        }
        await IdempotencyKey.delete(idempotencyKey, req.merchant.id);
    }

    if (!order_id || !method || !amount) {
        return res.status(400).json({ error: { code: 'BAD_REQUEST_ERROR', description: 'Missing required fields' } });
    }

    const paymentId = generateId('pay_');
    const paymentData = {
        id: paymentId,
        merchant_id: req.merchant.id,
        order_id,
        amount: parseInt(amount),
        currency: req.body.currency || 'INR',
        method,
        vpa,
        status: 'pending'
    };

    const payment = await Payment.create(paymentData);

    // Webhook for Creation
    await webhookQueue.add({
        merchantId: req.merchant.id,
        event: 'payment.created',
        payload: {
            event: 'payment.created',
            timestamp: Math.floor(Date.now() / 1000),
            data: { payment: { ...payment, created_at: new Date().toISOString() } }
        }
    });

    // Enqueue for processing
    await paymentQueue.add({ paymentId });

    const response = {
        ...payment,
        created_at: new Date().toISOString()
    };

    if (idempotencyKey) {
        await IdempotencyKey.create(idempotencyKey, req.merchant.id, response);
    }

    res.status(201).json(response);
};

exports.capturePayment = async (req, res) => {
    const { id } = req.params;
    const payment = await Payment.findByIdAndMerchant(id, req.merchant.id);

    if (!payment) return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Payment not found' } });

    if (payment.status !== 'success') {
        return res.status(400).json({ error: { code: 'BAD_REQUEST_ERROR', description: 'Payment not in capturable state' } });
    }

    await Payment.capture(id);
    const updated = await Payment.findById(id);
    res.json(updated);
};

exports.getPayment = async (req, res) => {
    const payment = await Payment.findByIdAndMerchant(req.params.id, req.merchant.id);
    if (!payment) return res.status(404).json({ error: { code: 'NOT_FOUND', description: 'Payment not found' } });
    res.json(payment);
};
