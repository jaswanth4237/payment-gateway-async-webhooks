const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const refundController = require('../controllers/refundController');
const auth = require('../middleware/auth');

router.post('/payments', auth, paymentController.createPayment);
router.post('/payments/:id/capture', auth, paymentController.capturePayment);
router.get('/payments/:id', auth, paymentController.getPayment);

router.post('/payments/:id/refunds', auth, refundController.createRefund);
router.get('/refunds/:id', auth, refundController.getRefund);

module.exports = router;
