const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    handleWebhook
} = require('../controllers/paymentController');

// Protected routes (require authentication)
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm-payment', protect, confirmPayment);
router.get('/payment-status/:paymentIntentId', protect, getPaymentStatus);

// Webhook route (no authentication required)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router; 