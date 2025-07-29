const stripe = require('stripe')(process.env.STRIPE_API_KEY);

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency = 'usd', metadata = {} } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            metadata: metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Stripe payment intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment intent'
        });
    }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID is required'
            });
        }

        // Retrieve payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
            res.status(200).json({
                success: true,
                message: 'Payment successful',
                paymentIntent: paymentIntent
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment not completed',
                status: paymentIntent.status
            });
        }
    } catch (error) {
        console.error('Stripe confirm payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error confirming payment'
        });
    }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
    try {
        const { paymentIntentId } = req.params;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID is required'
            });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        res.status(200).json({
            success: true,
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100, // Convert from cents
            currency: paymentIntent.currency,
            metadata: paymentIntent.metadata
        });
    } catch (error) {
        console.error('Stripe get payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment status'
        });
    }
};

// Create refund
exports.createRefund = async (req, res) => {
    try {
        const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID is required'
            });
        }

        const refundData = {
            payment_intent: paymentIntentId,
            reason: reason
        };

        if (amount) {
            refundData.amount = Math.round(amount * 100); // Convert to cents
        }

        const refund = await stripe.refunds.create(refundData);

        res.status(200).json({
            success: true,
            refund: refund
        });
    } catch (error) {
        console.error('Stripe refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating refund'
        });
    }
}; 