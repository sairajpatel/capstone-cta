// Initialize Stripe with proper error handling
let stripe = null;

// Only initialize Stripe if we have a valid secret key
if (process.env.STRIPE_SECRET_KEY && 
    process.env.STRIPE_SECRET_KEY.trim() !== '' && 
    process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    try {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        console.log('Stripe initialized successfully');
    } catch (error) {
        console.error('Error initializing Stripe:', error.message);
        console.error('Full error:', error);
        stripe = null;
    }
} else {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('STRIPE_SECRET_KEY not found in environment variables');
    } else if (process.env.STRIPE_SECRET_KEY.trim() === '') {
        console.error('STRIPE_SECRET_KEY is empty in environment variables');
    } else if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
        console.error('STRIPE_SECRET_KEY format is invalid - should start with sk_');
    }
}

const Booking = require('../models/bookingModel');
const { Event } = require('../models/eventModel');

// Create PaymentIntent for booking
exports.createPaymentIntent = async (req, res) => {
    try {
        console.log('=== PAYMENT INTENT CREATION START ===');
        console.log('Request body:', req.body);
        console.log('User:', req.user);
        console.log('Stripe initialized:', !!stripe);
        console.log('Environment variables:', {
            STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET',
            STRIPE_PUBLISHABLE_KEY: process.env.Publishable_Key ? 'SET' : 'NOT SET',
            STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'NOT SET'
        });

        // Check if Stripe is properly initialized
        if (!stripe) {
            console.error('Stripe not initialized - missing STRIPE_SECRET_KEY');
            return res.status(500).json({
                success: false,
                message: 'Payment service is not configured. Please contact support.'
            });
        }

        const { bookingId, amount, currency = 'usd' } = req.body;
        console.log('Payment intent data:', { bookingId, amount, currency });

        // Validate required fields
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required'
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        // Validate booking exists and belongs to user
        const booking = await Booking.findById(bookingId).populate('event');
        console.log('Found booking:', booking ? 'YES' : 'NO');
        
        if (!booking) {
            console.error('Booking not found:', bookingId);
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking belongs to the authenticated user
        if (booking.user.toString() !== req.user._id.toString()) {
            console.error('Unauthorized booking access:', {
                bookingUser: booking.user.toString(),
                requestUser: req.user._id.toString()
            });
            return res.status(403).json({
                success: false,
                message: 'Not authorized to pay for this booking'
            });
        }

        // Check if booking is already paid
        if (booking.status === 'confirmed') {
            console.error('Booking already paid:', bookingId);
            return res.status(400).json({
                success: false,
                message: 'Booking is already paid'
            });
        }

        // Validate that event exists
        if (!booking.event) {
            console.error('Event not found for booking:', bookingId);
            return res.status(404).json({
                success: false,
                message: 'Event not found for this booking'
            });
        }

        // Convert amount to cents (Stripe expects amounts in cents)
        const amountInCents = Math.round(amount * 100);
        console.log('Amount in cents:', amountInCents);

        // Validate amount is reasonable
        if (amountInCents < 50) { // Minimum 50 cents
            return res.status(400).json({
                success: false,
                message: 'Amount must be at least $0.50'
            });
        }

        console.log('Creating Stripe PaymentIntent...');
        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: currency,
            metadata: {
                bookingId: bookingId,
                eventId: booking.event._id.toString(),
                userId: req.user._id.toString(),
                ticketQuantity: booking.quantity,
                ticketType: booking.ticketType
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        console.log('PaymentIntent created successfully:', paymentIntent.id);
        console.log('=== PAYMENT INTENT CREATION END ===');

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('=== PAYMENT INTENT CREATION ERROR ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Handle specific Stripe errors
        if (error.type === 'StripeCardError') {
            return res.status(400).json({
                success: false,
                message: 'Card error: ' + error.message
            });
        } else if (error.type === 'StripeInvalidRequestError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid request: ' + error.message
            });
        } else if (error.type === 'StripeAPIError') {
            return res.status(500).json({
                success: false,
                message: 'Payment service error. Please try again later.'
            });
        }
        
        console.error('Stripe error details:', error);
        console.error('=== PAYMENT INTENT CREATION ERROR END ===');
        
        res.status(500).json({
            success: false,
            message: 'Error creating payment intent. Please try again.'
        });
    }
};

// Confirm payment and update booking
exports.confirmPayment = async (req, res) => {
    try {
        console.log('=== CONFIRM PAYMENT START ===');
        console.log('Request body:', req.body);
        console.log('User:', req.user);
        
        // Test model imports
        console.log('Booking model:', typeof Booking);
        console.log('Event model:', typeof Event);
        
        // Check if Stripe is properly initialized
        if (!stripe) {
            console.error('Stripe not initialized');
            return res.status(500).json({
                success: false,
                message: 'Payment service is not configured. Please contact support.'
            });
        }

        const { paymentIntentId, bookingId } = req.body;
        console.log('Confirming payment:', { paymentIntentId, bookingId });

        // Validate required fields
        if (!paymentIntentId || !bookingId) {
            console.error('Missing required fields:', { paymentIntentId, bookingId });
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID and booking ID are required'
            });
        }

        // Retrieve the payment intent from Stripe
        console.log('Retrieving payment intent from Stripe...');
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        console.log('Payment intent status:', paymentIntent.status);

        if (paymentIntent.status === 'succeeded') {
            console.log('Payment succeeded, updating booking...');
            
            // Find the booking first to validate it exists
            const existingBooking = await Booking.findById(bookingId);
            if (!existingBooking) {
                console.error('Booking not found:', bookingId);
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }

            // Update booking status
            const booking = await Booking.findByIdAndUpdate(
                bookingId,
                {
                    status: 'confirmed',
                    paymentIntentId: paymentIntentId,
                    paidAt: new Date()
                },
                { new: true }
            );

            console.log('Booking updated successfully:', booking ? 'YES' : 'NO');

            // Update event ticket availability
            if (booking && booking.event) {
                console.log('Updating event ticket availability...');
                const event = await Event.findById(booking.event);
                if (event && event.ticketing) {
                    const ticketType = event.ticketing.find(t => t.name === booking.ticketType);
                    if (ticketType) {
                        console.log('Updating ticket quantity:', { 
                            before: ticketType.quantity, 
                            after: ticketType.quantity - booking.quantity 
                        });
                        ticketType.quantity -= booking.quantity;
                        await event.save();
                        console.log('Event ticket availability updated');
                    } else {
                        console.log('Ticket type not found in event');
                    }
                } else {
                    console.log('Event or ticketing not found');
                }
            }

            console.log('=== CONFIRM PAYMENT SUCCESS ===');
            res.status(200).json({
                success: true,
                message: 'Payment confirmed successfully',
                booking: booking
            });
        } else {
            console.log('Payment not successful, status:', paymentIntent.status);
            res.status(400).json({
                success: false,
                message: 'Payment not successful'
            });
        }

    } catch (error) {
        console.error('=== CONFIRM PAYMENT ERROR ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Error confirming payment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
    try {
        // Check if Stripe is properly initialized
        if (!stripe) {
            return res.status(500).json({
                success: false,
                message: 'Payment service is not configured. Please contact support.'
            });
        }

        const { paymentIntentId } = req.params;

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        res.status(200).json({
            success: true,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
        });

    } catch (error) {
        console.error('Payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving payment status'
        });
    }
};

// Webhook handler for Stripe events
exports.handleWebhook = async (req, res) => {
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    console.log('Body type:', typeof req.body);
    console.log('Body length:', req.body ? req.body.length : 'No body');
    console.log('Stripe-Signature header:', req.headers['stripe-signature']);
    
    // Check if Stripe is properly initialized
    if (!stripe) {
        console.error('Stripe not initialized for webhook - check STRIPE_SECRET_KEY environment variable');
        return res.status(500).json({
            success: false,
            message: 'Payment service is not configured. Please check server logs for details.',
            error: 'STRIPE_SECRET_KEY not properly configured'
        });
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log('Webhook secret configured:', !!endpointSecret);
    console.log('Webhook secret length:', endpointSecret ? endpointSecret.length : 0);

    if (!endpointSecret) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return res.status(500).json({
            success: false,
            message: 'Webhook secret not configured'
        });
    }

    if (!sig) {
        console.error('No Stripe signature found in headers');
        return res.status(400).json({
            success: false,
            message: 'No Stripe signature found'
        });
    }

    // Ensure req.body is a Buffer for Stripe webhook verification
    let rawBody;
    if (Buffer.isBuffer(req.body)) {
        rawBody = req.body;
    } else if (typeof req.body === 'string') {
        rawBody = Buffer.from(req.body, 'utf8');
    } else {
        console.error('Request body is not in the expected format:', typeof req.body);
        return res.status(400).json({
            success: false,
            message: 'Invalid request body format'
        });
    }

    let event;

    try {
        console.log('Attempting to construct event...');
        
        // In development, allow bypassing signature verification for testing
        if (process.env.NODE_ENV === 'development' && req.headers['x-test-mode'] === 'true') {
            console.log('Development mode: Bypassing signature verification');
            event = JSON.parse(rawBody.toString());
        } else {
            event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
        }
        
        console.log('Webhook signature verified successfully');
        console.log('Event type:', event.type);
        console.log('Event ID:', event.id);
        console.log('Event data object:', event.data.object);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        console.error('Error details:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            console.log('Payment metadata:', paymentIntent.metadata);
            console.log('Payment amount:', paymentIntent.amount);
            console.log('Payment status:', paymentIntent.status);
            
            // Update booking status
            if (paymentIntent.metadata.bookingId) {
                console.log('Updating booking:', paymentIntent.metadata.bookingId);
                try {
                    const updatedBooking = await Booking.findByIdAndUpdate(
                        paymentIntent.metadata.bookingId,
                        {
                            status: 'confirmed',
                            paymentIntentId: paymentIntent.id,
                            paidAt: new Date()
                        },
                        { new: true }
                    );
                    console.log('Booking updated successfully:', updatedBooking ? 'YES' : 'NO');
                    if (updatedBooking) {
                        console.log('Updated booking status:', updatedBooking.status);
                    }
                } catch (updateError) {
                    console.error('Error updating booking:', updateError);
                }
            } else {
                console.log('No bookingId found in payment metadata');
            }
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            console.log('Failed payment metadata:', failedPayment.metadata);
            
            // Update booking status to failed
            if (failedPayment.metadata.bookingId) {
                console.log('Updating failed booking:', failedPayment.metadata.bookingId);
                try {
                    const updatedBooking = await Booking.findByIdAndUpdate(
                        failedPayment.metadata.bookingId,
                        {
                            status: 'failed',
                            paymentIntentId: failedPayment.id
                        },
                        { new: true }
                    );
                    console.log('Failed booking updated successfully:', updatedBooking ? 'YES' : 'NO');
                } catch (updateError) {
                    console.error('Error updating failed booking:', updateError);
                }
            } else {
                console.log('No bookingId found in failed payment metadata');
            }
            break;

        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('Checkout session completed:', session.id);
            console.log('Session metadata:', session.metadata);
            
            // Handle checkout session completion if needed
            if (session.metadata.bookingId) {
                console.log('Updating booking from checkout session:', session.metadata.bookingId);
                try {
                    const updatedBooking = await Booking.findByIdAndUpdate(
                        session.metadata.bookingId,
                        {
                            status: 'confirmed',
                            paymentIntentId: session.payment_intent,
                            paidAt: new Date()
                        },
                        { new: true }
                    );
                    console.log('Booking updated from checkout session:', updatedBooking ? 'YES' : 'NO');
                } catch (updateError) {
                    console.error('Error updating booking from checkout session:', updateError);
                }
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    console.log('=== WEBHOOK PROCESSING COMPLETE ===');
    res.json({ received: true });
}; 

// Test endpoint to check Stripe configuration
exports.testStripeConfig = async (req, res) => {
    try {
        console.log('=== STRIPE CONFIG TEST ===');
        console.log('Stripe initialized:', !!stripe);
        
        // Check environment variables in detail
        const envCheck = {
            STRIPE_SECRET_KEY: {
                exists: !!process.env.STRIPE_SECRET_KEY,
                length: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0,
                startsWithSk: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.startsWith('sk_') : false,
                isEmpty: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.trim() === '' : true
            },
            STRIPE_PUBLISHABLE_KEY: {
                exists: !!process.env.Publishable_Key,
                length: process.env.Publishable_Key ? process.env.Publishable_Key.length : 0,
                startsWithPk: process.env.Publishable_Key ? process.env.Publishable_Key.startsWith('pk_') : false
            },
            STRIPE_WEBHOOK_SECRET: {
                exists: !!process.env.STRIPE_WEBHOOK_SECRET,
                length: process.env.STRIPE_WEBHOOK_SECRET ? process.env.STRIPE_WEBHOOK_SECRET.length : 0
            }
        };
        
        console.log('Environment variables check:', envCheck);

        if (!stripe) {
            return res.status(500).json({
                success: false,
                message: 'Stripe not initialized - check STRIPE_SECRET_KEY configuration',
                config: {
                    stripeInitialized: false,
                    envVars: envCheck,
                    recommendations: [
                        'Ensure STRIPE_SECRET_KEY is set in Vercel environment variables',
                        'STRIPE_SECRET_KEY should start with "sk_"',
                        'STRIPE_SECRET_KEY should not be empty or have extra whitespace'
                    ]
                }
            });
        }

        // Test Stripe connection
        try {
            const testPaymentIntent = await stripe.paymentIntents.create({
                amount: 100, // $1.00
                currency: 'usd',
                metadata: { test: true }
            });
            
            console.log('Stripe test successful:', testPaymentIntent.id);
            
            return res.status(200).json({
                success: true,
                message: 'Stripe configuration is working',
                testPaymentIntentId: testPaymentIntent.id,
                config: {
                    stripeInitialized: true,
                    envVars: {
                        STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
                        STRIPE_PUBLISHABLE_KEY: !!process.env.Publishable_Key,
                        STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET
                    }
                }
            });
        } catch (stripeError) {
            console.error('Stripe test failed:', stripeError);
            return res.status(500).json({
                success: false,
                message: 'Stripe test failed: ' + stripeError.message,
                error: stripeError.message
            });
        }
    } catch (error) {
        console.error('Config test error:', error);
        return res.status(500).json({
            success: false,
            message: 'Config test error: ' + error.message
        });
    }
};

// Simple health check endpoint
exports.healthCheck = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Payment service is running',
            timestamp: new Date().toISOString(),
            stripeInitialized: !!stripe,
            envVars: {
                STRIPE_SECRET_KEY: {
                    exists: !!process.env.STRIPE_SECRET_KEY,
                    length: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0,
                    startsWithSk: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.startsWith('sk_') : false,
                    isEmpty: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.trim() === '' : true
                }
            }
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment service error'
        });
    }
}; 

// Simple webhook test endpoint
exports.testWebhook = async (req, res) => {
    try {
        console.log('=== WEBHOOK TEST ENDPOINT ===');
        console.log('Method:', req.method);
        console.log('URL:', req.url);
        console.log('Headers:', req.headers);
        console.log('Environment variables:', {
            STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET',
            STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'NOT SET'
        });
        
        res.status(200).json({
            success: true,
            message: 'Webhook endpoint is accessible',
            timestamp: new Date().toISOString(),
            stripeInitialized: !!stripe,
            webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET
        });
    } catch (error) {
        console.error('Webhook test error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook test error: ' + error.message
        });
    }
}; 

// Test confirmPayment endpoint
exports.testConfirmPayment = async (req, res) => {
    try {
        console.log('=== TEST CONFIRM PAYMENT ===');
        console.log('Request body:', req.body);
        console.log('User:', req.user);
        
        // Test model imports
        console.log('Booking model:', typeof Booking);
        console.log('Event model:', typeof Event);
        
        // Test Stripe
        console.log('Stripe initialized:', !!stripe);
        
        res.status(200).json({
            success: true,
            message: 'Test endpoint working',
            models: {
                booking: typeof Booking,
                event: typeof Event
            },
            stripe: !!stripe
        });
    } catch (error) {
        console.error('Test confirmPayment error:', error);
        res.status(500).json({
            success: false,
            message: 'Test failed',
            error: error.message
        });
    }
}; 

// Test webhook with simulated payment success
exports.testWebhookPayment = async (req, res) => {
    try {
        console.log('=== TEST WEBHOOK PAYMENT ===');
        
        // Simulate a payment success event
        const testPaymentIntent = {
            id: 'pi_test_' + Date.now(),
            status: 'succeeded',
            metadata: {
                bookingId: req.body.bookingId || 'test_booking_id'
            }
        };
        
        console.log('Simulating payment success for booking:', testPaymentIntent.metadata.bookingId);
        
        // Update booking status
        if (testPaymentIntent.metadata.bookingId) {
            const updatedBooking = await Booking.findByIdAndUpdate(
                testPaymentIntent.metadata.bookingId,
                {
                    status: 'confirmed',
                    paymentIntentId: testPaymentIntent.id,
                    paidAt: new Date()
                },
                { new: true }
            );
            
            console.log('Test booking updated:', updatedBooking ? 'YES' : 'NO');
            
            res.status(200).json({
                success: true,
                message: 'Test webhook payment processed',
                booking: updatedBooking
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'No bookingId provided for test'
            });
        }
        
    } catch (error) {
        console.error('Test webhook payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Test webhook payment failed',
            error: error.message
        });
    }
};

// Debug environment variables endpoint
exports.debugEnv = async (req, res) => {
    try {
        console.log('=== ENVIRONMENT DEBUG ===');
        console.log('All environment variables:', Object.keys(process.env));
        
        const envInfo = {
            STRIPE_SECRET_KEY: {
                exists: !!process.env.STRIPE_SECRET_KEY,
                length: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0,
                startsWithSk: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.startsWith('sk_') : false,
                isEmpty: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.trim() === '' : true,
                value: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'NOT_SET'
            },
            STRIPE_PUBLISHABLE_KEY: {
                exists: !!process.env.Publishable_Key,
                length: process.env.Publishable_Key ? process.env.Publishable_Key.length : 0,
                startsWithPk: process.env.Publishable_Key ? process.env.Publishable_Key.startsWith('pk_') : false,
                value: process.env.Publishable_Key ? process.env.Publishable_Key.substring(0, 10) + '...' : 'NOT_SET'
            },
            STRIPE_WEBHOOK_SECRET: {
                exists: !!process.env.STRIPE_WEBHOOK_SECRET,
                length: process.env.STRIPE_WEBHOOK_SECRET ? process.env.STRIPE_WEBHOOK_SECRET.length : 0,
                value: process.env.STRIPE_WEBHOOK_SECRET ? process.env.STRIPE_WEBHOOK_SECRET.substring(0, 10) + '...' : 'NOT_SET'
            },
            NODE_ENV: process.env.NODE_ENV,
            stripeInitialized: !!stripe
        };
        
        console.log('Environment info:', envInfo);
        
        res.status(200).json({
            success: true,
            message: 'Environment debug info',
            envInfo: envInfo,
            recommendations: [
                'Check Vercel environment variables',
                'Ensure STRIPE_SECRET_KEY starts with sk_',
                'Make sure keys are not empty',
                'Remove any extra whitespace'
            ]
        });
    } catch (error) {
        console.error('Debug env error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug error: ' + error.message
        });
    }
}; 