import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPaymentStatus } from '../../utils/paymentApi';
import { toast } from 'react-hot-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const paymentIntentId = searchParams.get('payment_intent');
        
        if (paymentIntentId) {
          const response = await getPaymentStatus(paymentIntentId);
          setPaymentStatus(response);
          
          if (response.status === 'succeeded') {
            toast.success('Payment successful!');
          } else {
            toast.error('Payment failed or incomplete');
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        toast.error('Error checking payment status');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="text-center">
          {paymentStatus?.status === 'succeeded' ? (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your payment of ${paymentStatus?.amount} has been processed successfully.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/user/bookings')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  View My Bookings
                </button>
                <button
                  onClick={() => navigate('/user/dashboard')}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-6">
                Your payment could not be processed. Please try again.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/events')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Browse Events
                </button>
                <button
                  onClick={() => navigate('/user/dashboard')}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 