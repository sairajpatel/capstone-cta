import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import stripePromise from '../../utils/stripe';

// Stripe Elements appearance configuration
const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#3b82f6',
    colorBackground: '#ffffff',
    colorText: '#1f2937',
    colorDanger: '#ef4444',
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    '.Tab': {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '12px',
    },
    '.Tab:hover': {
      color: '#3b82f6',
      borderColor: '#3b82f6',
    },
    '.Tab--selected': {
      borderColor: '#3b82f6',
      backgroundColor: '#eff6ff',
    },
  },
};

// Payment Form Component
const CheckoutForm = ({ bookingId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/payment-complete`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
      onError && onError(error.message);
    } else {
      setMessage("An unexpected error occurred.");
      onError && onError("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
    defaultValues: {
      billingDetails: {
        name: 'Auto-filled name',
        email: 'auto-filled@email.com',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h2>
          <p className="text-gray-600">Total Amount: ${amount}</p>
        </div>

        <PaymentElement 
          id="payment-element" 
          options={paymentElementOptions}
          className="mb-6"
        />

        {message && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay $${amount}`
          )}
        </button>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Your payment information is secure and encrypted.
        </div>
      </div>
    </form>
  );
};

// Payment Complete Page Component
const PaymentComplete = () => {
  const [status, setStatus] = useState(null);
  const [intentId, setIntentId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      setStatus("error");
      return;
    }

    stripePromise.then((stripe) => {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        if (!paymentIntent) {
          setStatus("error");
          return;
        }

        setStatus(paymentIntent.status);
        setIntentId(paymentIntent.id);
      });
    });
  }, []);

  const getStatusMessage = () => {
    switch (status) {
      case "succeeded":
        return {
          title: "Payment Successful!",
          message: "Your booking has been confirmed.",
          type: "success"
        };
      case "processing":
        return {
          title: "Payment Processing",
          message: "Your payment is being processed. You'll receive a confirmation shortly.",
          type: "info"
        };
      case "requires_payment_method":
        return {
          title: "Payment Failed",
          message: "Your payment was not successful, please try again.",
          type: "error"
        };
      default:
        return {
          title: "Payment Status Unknown",
          message: "We couldn't determine the status of your payment.",
          type: "warning"
        };
    }
  };

  const { title, message, type } = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {type === "success" && (
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {type === "error" && (
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>

          {intentId && (
            <p className="text-sm text-gray-500 mb-6">
              Payment ID: {intentId}
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate('/user/dashboard')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={() => navigate('/user/bookings')}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Payment Gateway Component
const PaymentGateway = ({ bookingId, amount, onSuccess, onError }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await axios.post('/payments/create-payment-intent', {
          bookingId,
          amount,
          currency: 'usd'
        });

        if (response.data.success) {
          setClientSecret(response.data.clientSecret);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err.response?.data?.message || 'Error creating payment intent');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId && amount) {
      createPaymentIntent();
    }
  }, [bookingId, amount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {clientSecret && (
          <Elements 
            options={{
              clientSecret,
              appearance,
            }} 
            stripe={stripePromise}
          >
            <CheckoutForm 
              bookingId={bookingId}
              amount={amount}
              onSuccess={onSuccess}
              onError={onError}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export { PaymentGateway, PaymentComplete };
export default PaymentGateway; 