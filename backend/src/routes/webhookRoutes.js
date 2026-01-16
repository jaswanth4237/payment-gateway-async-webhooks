const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const auth = require('../middleware/auth');

router.get('/webhooks', auth, webhookController.listWebhooks);
router.post('/webhooks/:id/retry', auth, webhookController.retryWebhook);
router.post('/merchants/webhook-config', auth, webhookController.updateConfig);
router.post('/merchants/regenerate-secret', auth, webhookController.regenerateSecret);

router.get('/merchants/me', auth, (req, res) => res.json(req.merchant));

module.exports = router;
