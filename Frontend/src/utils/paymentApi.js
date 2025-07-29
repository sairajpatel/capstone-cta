import axios from './axios';

export const createPaymentIntent = async (amount, metadata = {}) => {
  try {
    const response = await axios.post('/stripe/create-payment-intent', {
      amount,
      currency: 'usd',
      metadata
    });
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const confirmPayment = async (paymentIntentId) => {
  try {
    const response = await axios.post('/stripe/confirm-payment', {
      paymentIntentId
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

export const getPaymentStatus = async (paymentIntentId) => {
  try {
    const response = await axios.get(`/stripe/payment-status/${paymentIntentId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};

export const createRefund = async (paymentIntentId, amount, reason = 'requested_by_customer') => {
  try {
    const response = await axios.post('/stripe/create-refund', {
      paymentIntentId,
      amount,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
}; 