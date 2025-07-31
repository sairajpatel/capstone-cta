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
    healthCheck,
    debugEnv
} = require('../controllers/paymentController');

// Health check route (no authentication required)
router.get('/health', healthCheck);

// Test route (no authentication required)
router.get('/test-config', testStripeConfig);

// Debug environment variables (no authentication required)
router.get('/debug-env', debugEnv);

// Payment routes (protected)
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm-payment', protect, confirmPayment);
router.post('/test-confirm-payment', protect, testConfirmPayment);
router.get('/payment-status/:paymentIntentId', protect, getPaymentStatus);

// Webhook route (unprotected - Stripe needs to access this)
// Note: Raw body parsing is handled in server.js for this route
router.post('/webhook', handleWebhook);
router.get('/webhook-test', testWebhook);
router.post('/webhook-test-payment', testWebhookPayment);

module.exports = router; 