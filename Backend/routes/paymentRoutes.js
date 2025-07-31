const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    handleWebhook,
    testStripeConfig,
    testWebhook,
    testConfirmPayment,
    testWebhookPayment,
    healthCheck
} = require('../controllers/paymentController');

// Health check route (no authentication required)
router.get('/health', healthCheck);

// Test route (no authentication required)
router.get('/test-config', testStripeConfig);

// Payment routes (protected)
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm-payment', protect, confirmPayment);
router.post('/test-confirm-payment', protect, testConfirmPayment);
router.get('/payment-status/:paymentIntentId', protect, getPaymentStatus);

// Webhook route (unprotected - Stripe needs to access this)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
router.get('/webhook-test', testWebhook);
router.post('/webhook-test-payment', testWebhookPayment);

module.exports = router; 