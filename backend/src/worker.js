const { paymentQueue, webhookQueue, refundQueue } = require('./queues');
const axios = require('axios');
const Payment = require('./models/paymentModel');
const Refund = require('./models/refundModel');
const WebhookLog = require('./models/webhookModel');
const Merchant = require('./models/merchantModel');
const { generateSignature } = require('./utils/crypto');

const TEST_MODE = process.env.TEST_MODE === 'true';
const TEST_PROCESSING_DELAY = parseInt(process.env.TEST_PROCESSING_DELAY || 1000);
const TEST_PAYMENT_SUCCESS = process.env.TEST_PAYMENT_SUCCESS !== 'false';
const WEBHOOK_RETRY_INTERVALS_TEST = process.env.WEBHOOK_RETRY_INTERVALS_TEST === 'true';

const getRetryDelay = (attempt) => {
    if (WEBHOOK_RETRY_INTERVALS_TEST) {
        const intervals = [0, 5000, 10000, 15000, 20000];
        return intervals[attempt - 1] || 0;
    }
    const intervals = [0, 60000, 300000, 1800000, 7200000];
    return intervals[attempt - 1] || 0;
};

// 1. Process Payment Job
paymentQueue.process(async (job) => {
    const { paymentId } = job.data;
    const payment = await Payment.findById(paymentId);
    if (!payment) return;

    const delay = TEST_MODE ? TEST_PROCESSING_DELAY : (5000 + Math.random() * 5000);
    await new Promise(resolve => setTimeout(resolve, delay));

    let success;
    if (TEST_MODE) {
        success = TEST_PAYMENT_SUCCESS;
    } else {
        const threshold = payment.method === 'upi' ? 0.9 : 0.95;
        success = Math.random() < threshold;
    }

    const status = success ? 'success' : 'failed';
    const errorCode = success ? null : 'PAYMENT_FAILED';
    const errorDescription = success ? null : 'Transaction failed at bank.';

    await Payment.updateStatus(paymentId, status, errorCode, errorDescription);

    const updatedPayment = await Payment.findById(paymentId);
    const event = success ? 'payment.success' : 'payment.failed';
    const payload = {
        event,
        timestamp: Math.floor(Date.now() / 1000),
        data: { payment: updatedPayment }
    };

    await webhookQueue.add({ merchantId: payment.merchant_id, event, payload });
});

// 2. Deliver Webhook Job
webhookQueue.process(async (job) => {
    const { merchantId, event, payload, webhookLogId } = job.data;

    const merchant = await Merchant.findById(merchantId);
    if (!merchant || !merchant.webhook_url) return;

    let logId = webhookLogId;
    let attempts = 0;

    if (!logId) {
        logId = await WebhookLog.create({
            merchant_id: merchantId,
            event,
            payload,
            status: 'pending'
        });
    } else {
        const log = await WebhookLog.findById(logId);
        attempts = log.attempts;
    }

    attempts++;
    const signature = generateSignature(payload, merchant.webhook_secret);

    try {
        const response = await axios.post(merchant.webhook_url, payload, {
            headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': signature },
            timeout: 5000
        });

        await WebhookLog.updateAttempt(logId, 'success', attempts, response.status, JSON.stringify(response.data).substring(0, 1000), null);
    } catch (error) {
        const responseCode = error.response ? error.response.status : 500;
        const responseBody = error.response ? JSON.stringify(error.response.data) : error.message;

        if (attempts < 5) {
            const delay = getRetryDelay(attempts + 1);
            const nextRetry = new Date(Date.now() + delay);
            await WebhookLog.updateAttempt(logId, 'pending', attempts, responseCode, responseBody.substring(0, 1000), nextRetry);
            await webhookQueue.add({ merchantId, event, payload, webhookLogId: logId }, { delay });
        } else {
            await WebhookLog.updateAttempt(logId, 'failed', attempts, responseCode, responseBody.substring(0, 1000), null);
        }
    }
});

// 3. Process Refund Job
refundQueue.process(async (job) => {
    const { refundId } = job.data;
    const refund = await Refund.findById(refundId);
    if (!refund) return;

    const delay = 3000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, delay));

    await Refund.updateStatus(refundId, 'processed');

    const updatedRefund = await Refund.findById(refundId);
    const payload = {
        event: 'refund.processed',
        timestamp: Math.floor(Date.now() / 1000),
        data: { refund: updatedRefund }
    };

    await webhookQueue.add({ merchantId: refund.merchant_id, event: 'refund.processed', payload });
});

console.log('Worker started and listening for jobs...');
