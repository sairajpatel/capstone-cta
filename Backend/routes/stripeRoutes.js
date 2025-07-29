const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    createRefund
} = require('../controllers/stripeController');

// Create payment intent
router.post('/create-payment-intent', protect, createPaymentIntent);

// Confirm payment
router.post('/confirm-payment', protect, confirmPayment);

// Get payment status
router.get('/payment-status/:paymentIntentId', protect, getPaymentStatus);

// Create refund
router.post('/create-refund', protect, createRefund);

module.exports = router; 