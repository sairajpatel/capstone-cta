import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { getPaymentStatus } from '../../utils/paymentApi';
import axios from '../../utils/axios';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    useEffect(() => {
        const clientSecret = searchParams.get('payment_intent_client_secret');
        
        if (clientSecret) {
            checkPaymentStatus(clientSecret);
        } else {
            setIsLoading(false);
        }
    }, [searchParams]);

    const checkPaymentStatus = async (clientSecret) => {
        try {
            // Extract payment intent ID from client secret
            const paymentIntentId = clientSecret.split('_secret_')[0];
            
            const response = await getPaymentStatus(paymentIntentId);
            
            if (response.success) {
                setPaymentStatus(response.status);
                if (response.status === 'succeeded') {
                    toast.success('Payment successful!');
                    
                    // Get bookingId from URL params or localStorage
                    const bookingId = searchParams.get('bookingId') || localStorage.getItem('currentBookingId');
                    
                    if (bookingId) {
                        // Call confirmPayment endpoint
                        try {
                            const confirmData = { 
                                paymentIntentId,
                                bookingId 
                            };
                            console.log('Sending confirmPayment data:', confirmData);
                            
                            const response = await axios.post('/payments/confirm-payment', confirmData);
                            console.log('Payment confirmed successfully:', response.data);
                            setPaymentConfirmed(true);
                            
                            // Clean up localStorage
                            localStorage.removeItem('currentBookingId');
                        } catch (confirmError) {
                            console.error('Error confirming payment:', confirmError);
                            console.error('Error response:', confirmError.response?.data);
                            // Don't show error to user as payment was successful
                        }
                    } else {
                        console.log('No bookingId found for confirmation');
                    }
                }
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            toast.error('Error checking payment status');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewBookings = () => {
        navigate('/user/bookings');
    };

    const handleExploreEvents = () => {
        navigate('/user/dashboard');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Processing your payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
            >
                {paymentStatus === 'succeeded' ? (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </motion.div>
                        
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
                        <p className="text-gray-600 mb-8">
                            {paymentConfirmed 
                                ? "Your booking has been confirmed and payment processed successfully." 
                                : "Your payment has been processed successfully. Confirming your booking..."
                            }
                        </p>
                        
                        <div className="space-y-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleViewBookings}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                            >
                                View My Bookings
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleExploreEvents}
                                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
                            >
                                Explore More Events
                            </motion.button>
                        </div>
                    </>
                ) : (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </motion.div>
                        
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Processing</h1>
                        <p className="text-gray-600 mb-8">Your payment is being processed. You'll receive a confirmation once it's complete.</p>
                        
                        <div className="space-y-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleViewBookings}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                            >
                                Check Booking Status
                            </motion.button>
                            
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleExploreEvents}
                                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
                            >
                                Back to Dashboard
                            </motion.button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default PaymentSuccess; 