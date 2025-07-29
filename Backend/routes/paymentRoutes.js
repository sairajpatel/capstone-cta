const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    handleWebhook
} = require('../controllers/paymentController');

// Payment routes (protected)
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm-payment', protect, confirmPayment);
router.get('/payment-status/:paymentIntentId', protect, getPaymentStatus);

// Webhook route (unprotected - Stripe needs to access this)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router; 