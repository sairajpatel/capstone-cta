// Initialize Stripe with proper error handling
let stripe;
try {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.warn('STRIPE_SECRET_KEY not found in environment variables');
        stripe = null;
    } else {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    }
} catch (error) {
    console.error('Error initializing Stripe:', error);
    stripe = null;
}

const Booking = require('../models/bookingModel');
const Event = require('../models/eventModel');

// Create PaymentIntent for booking
exports.createPaymentIntent = async (req, res) => {
    try {
        // Check if Stripe is properly initialized
        if (!stripe) {
            return res.status(500).json({
                success: false,
                message: 'Payment service is not configured. Please contact support.'
            });
        }

        const { bookingId, amount, currency = 'usd' } = req.body;

        // Validate booking exists and belongs to user
        const booking = await Booking.findById(bookingId).populate('event');
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking belongs to the authenticated user
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to pay for this booking'
            });
        }

        // Check if booking is already paid
        if (booking.status === 'confirmed') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already paid'
            });
        }

        // Convert amount to cents (Stripe expects amounts in cents)
        const amountInCents = Math.round(amount * 100);

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

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Payment Intent creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment intent'
        });
    }
};

// Confirm payment and update booking
exports.confirmPayment = async (req, res) => {
    try {
        // Check if Stripe is properly initialized
        if (!stripe) {
            return res.status(500).json({
                success: false,
                message: 'Payment service is not configured. Please contact support.'
            });
        }

        const { paymentIntentId, bookingId } = req.body;

        // Retrieve the payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === 'succeeded') {
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

            // Update event ticket availability
            const event = await Event.findById(booking.event);
            if (event) {
                const ticketType = event.ticketing.find(t => t.name === booking.ticketType);
                if (ticketType) {
                    ticketType.quantity -= booking.quantity;
                    await event.save();
                }
            }

            res.status(200).json({
                success: true,
                message: 'Payment confirmed successfully',
                booking: booking
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment not successful'
            });
        }

    } catch (error) {
        console.error('Payment confirmation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error confirming payment'
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
    // Check if Stripe is properly initialized
    if (!stripe) {
        console.error('Stripe not initialized for webhook');
        return res.status(500).json({
            success: false,
            message: 'Payment service is not configured'
        });
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return res.status(500).json({
            success: false,
            message: 'Webhook secret not configured'
        });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            
            // Update booking status
            if (paymentIntent.metadata.bookingId) {
                await Booking.findByIdAndUpdate(
                    paymentIntent.metadata.bookingId,
                    {
                        status: 'confirmed',
                        paymentIntentId: paymentIntent.id,
                        paidAt: new Date()
                    }
                );
            }
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            
            // Update booking status to failed
            if (failedPayment.metadata.bookingId) {
                await Booking.findByIdAndUpdate(
                    failedPayment.metadata.bookingId,
                    {
                        status: 'failed',
                        paymentIntentId: failedPayment.id
                    }
                );
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
}; 