import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { createPaymentIntent, confirmPayment } from '../../utils/paymentApi';

const PaymentForm = ({ booking, onPaymentSuccess, onPaymentError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        if (booking && booking._id) {
            createPaymentIntentForBooking();
        }
    }, [booking]);

    const createPaymentIntentForBooking = async () => {
        try {
            setIsLoading(true);
            const response = await createPaymentIntent(
                booking._id,
                booking.totalAmount,
                'usd'
            );
            
            if (response.success) {
                setClientSecret(response.clientSecret);
            } else {
                setMessage('Failed to initialize payment. Please try again.');
            }
        } catch (error) {
            console.error('Error creating payment intent:', error);
            setMessage('Error initializing payment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    // Make sure to change this to your payment completion page
                    return_url: `${window.location.origin}/payment-success`,
                },
            });

            if (error) {
                if (error.type === "card_error" || error.type === "validation_error") {
                    setMessage(error.message);
                } else {
                    setMessage("An unexpected error occurred.");
                }
                onPaymentError && onPaymentError(error);
            } else {
                // Payment succeeded
                await confirmPayment(booking.paymentIntentId, booking._id);
                onPaymentSuccess && onPaymentSuccess();
                toast.success('Payment successful!');
            }
        } catch (error) {
            console.error('Payment error:', error);
            setMessage('Payment failed. Please try again.');
            onPaymentError && onPaymentError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const paymentElementOptions = {
        layout: "tabs",
        fields: {
            billingDetails: {
                name: 'auto',
                email: 'auto',
                phone: 'auto',
            },
        },
    };

    if (isLoading && !clientSecret) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6"
        >
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Details</h2>
                <p className="text-gray-600">Complete your booking payment</p>
            </div>

            {booking && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Booking Summary</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Event:</span> {booking.event?.title}</p>
                        <p><span className="font-medium">Tickets:</span> {booking.quantity} x {booking.ticketType}</p>
                        <p><span className="font-medium">Total:</span> ${booking.totalAmount}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {clientSecret && (
                    <PaymentElement 
                        id="payment-element" 
                        options={paymentElementOptions}
                        className="mb-4"
                    />
                )}

                {message && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{message}</p>
                    </div>
                )}

                <motion.button
                    type="submit"
                    disabled={isLoading || !stripe || !elements}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                        isLoading || !stripe || !elements
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    }`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing...
                        </div>
                    ) : (
                        `Pay $${booking?.totalAmount || 0}`
                    )}
                </motion.button>
            </form>

            <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Your payment is secured by Stripe</p>
                <p>Test card: 4242 4242 4242 4242</p>
            </div>
        </motion.div>
    );
};

export default PaymentForm; 