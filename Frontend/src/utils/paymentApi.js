import axios from './axios';

// Create payment intent
export const createPaymentIntent = async (bookingId, amount, currency = 'usd') => {
    try {
        const response = await axios.post('/payments/create-payment-intent', {
            bookingId,
            amount,
            currency
        });
        return response.data;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
};

// Confirm payment
export const confirmPayment = async (paymentIntentId, bookingId) => {
    try {
        const response = await axios.post('/payments/confirm-payment', {
            paymentIntentId,
            bookingId
        });
        return response.data;
    } catch (error) {
        console.error('Error confirming payment:', error);
        throw error;
    }
};

// Get payment status
export const getPaymentStatus = async (paymentIntentId) => {
    try {
        const response = await axios.get(`/payments/payment-status/${paymentIntentId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting payment status:', error);
        throw error;
    }
}; 