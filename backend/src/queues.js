const Queue = require('bull');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const paymentQueue = new Queue('payment-processing', redisUrl);
const webhookQueue = new Queue('webhook-delivery', redisUrl);
const refundQueue = new Queue('refund-processing', redisUrl);

module.exports = {
    paymentQueue,
    webhookQueue,
    refundQueue
};
