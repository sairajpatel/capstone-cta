import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from '../../utils/axios';
import { toast } from 'react-hot-toast';
import { STRIPE_CONFIG, STRIPE_ELEMENTS_OPTIONS } from '../../config/stripe';

const StripePaymentGateway = ({ amount, bookingData, onSuccess, onCancel }) => {
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // Load Stripe with your publishable key
        const stripeInstance = await loadStripe(STRIPE_CONFIG.publishableKey);
        setStripe(stripeInstance);

        // Create payment intent
        const response = await axios.post('/stripe/create-payment-intent', {
          amount: amount,
          currency: 'usd',
          metadata: {
            eventId: bookingData?.eventId,
            userId: bookingData?.userId,
            ticketType: bookingData?.ticketType,
            quantity: bookingData?.quantity
          }
        });

        if (response.data.success) {
          setClientSecret(response.data.clientSecret);
          
          // Create elements
          const elementsInstance = stripeInstance.elements({
            clientSecret: response.data.clientSecret,
            appearance: STRIPE_ELEMENTS_OPTIONS.appearance,
          });
          
          setElements(elementsInstance);

          // Create card element
          const card = elementsInstance.create('card', {
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          });

          card.mount('#card-element');
          setCardElement(card);
        }
      } catch (error) {
        console.error('Error initializing Stripe:', error);
        setError('Failed to initialize payment system');
      }
    };

    initializeStripe();
  }, [amount, bookingData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!stripe || !elements || !cardElement) {
      setError('Payment system not ready');
      setLoading(false);
      return;
    }

    try {
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setError(submitError.message);
        setLoading(false);
        return;
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (confirmError) {
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      // Payment successful
      toast.success('Payment successful!');
      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (cardElement) {
      cardElement.destroy();
    }
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
              <p className="text-gray-600">Amount to pay: ${amount}</p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Information
              </label>
              <div id="card-element" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {/* Stripe Card Element will be mounted here */}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !stripe}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                  loading || !stripe
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#2B293D] hover:bg-opacity-90'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Pay $${amount}`
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Secure payment powered by Stripe</p>
            <p>Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentGateway; 