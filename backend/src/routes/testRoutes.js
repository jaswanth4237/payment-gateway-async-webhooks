const express = require('express');
const router = express.Router();
const { paymentQueue, refundQueue, webhookQueue } = require('../queues');

router.get('/status', async (req, res) => {
    const [paymentStats, refundStats, webhookStats] = await Promise.all([
        paymentQueue.getJobCounts(),
        refundQueue.getJobCounts(),
        webhookQueue.getJobCounts()
    ]);

    res.json({
        pending: paymentStats.waiting + refundStats.waiting + webhookStats.waiting,
        processing: paymentStats.active + refundStats.active + webhookStats.active,
        completed: paymentStats.completed + refundStats.completed + webhookStats.completed,
        failed: paymentStats.failed + refundStats.failed + webhookStats.failed,
        worker_status: 'running'
    });
});

module.exports = router;
