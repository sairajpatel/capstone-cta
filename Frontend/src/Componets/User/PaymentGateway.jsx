import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    colorSuccess: '#10b981',
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '12px',
  },
  rules: {
    '.Tab': {
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '8px',
    },
    '.Tab:hover': {
      color: '#3b82f6',
      borderColor: '#3b82f6',
      backgroundColor: '#f8fafc',
    },
    '.Tab--selected': {
      borderColor: '#3b82f6',
      backgroundColor: '#eff6ff',
      color: '#1e40af',
    },
    '.Input': {
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '16px',
    },
    '.Input:focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
    '.Label': {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
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
        return_url: `${window.location.origin}/payment-success?bookingId=${bookingId}`,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Payment Details</h2>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Secure Payment
            </div>
          </div>

          {/* Amount Display */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Amount</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">${amount}</span>
            </div>
          </div>

          {/* Payment Element */}
          <div className="mb-6">
            <PaymentElement 
              id="payment-element" 
              options={paymentElementOptions}
            />
          </div>

          {/* Error Message */}
          {message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !stripe || !elements}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold text-base sm:text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white mr-2 sm:mr-3"></div>
                <span className="text-sm sm:text-base">Processing Payment...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm sm:text-base">Pay ${amount}</span>
              </div>
            )}
          </button>

          {/* Security Notice */}
          <div className="mt-4 sm:mt-6 text-center">
            <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Your payment information is secure and encrypted
            </div>
          </div>
        </form>
      </div>
    </div>
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
const PaymentGateway = ({ onSuccess, onError }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    const amount = searchParams.get('amount');

    // Validate required parameters
    if (!bookingId || !amount) {
      setError('Missing booking information. Please try again.');
      setLoading(false);
      return;
    }

    // Store bookingId in localStorage as fallback
    localStorage.setItem('currentBookingId', bookingId);

    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        console.log('Creating payment intent with data:', {
          bookingId,
          amount,
          currency: 'usd'
        });
        
        const response = await axios.post('/payments/create-payment-intent', {
          bookingId,
          amount,
          currency: 'usd'
        });

        console.log('Payment intent response:', response.data);

        if (response.data.success) {
          setClientSecret(response.data.clientSecret);
        } else {
          console.error('Payment intent failed:', response.data);
          setError(response.data.message);
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers,
          config: err.config
        });
        
        // Show detailed error information
        let errorMessage = 'Error creating payment intent';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Setting up payment...</h3>
          <p className="text-gray-600">Please wait while we prepare your secure payment form.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-6 md:py-8">
      {clientSecret && (
        <Elements 
          options={{
            clientSecret,
            appearance,
          }} 
          stripe={stripePromise}
        >
          <CheckoutForm 
            bookingId={searchParams.get('bookingId')}
            amount={searchParams.get('amount')}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      )}
    </div>
  );
};

export { PaymentGateway, PaymentComplete };
export default PaymentGateway; 