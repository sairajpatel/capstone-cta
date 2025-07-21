import React, { useState } from 'react';

const PaymentGateway = ({ amount, onSuccess, onCancel }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (value) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    // Add slash after first 2 digits
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };

  const validateExpiryDate = (expiry) => {
    if (!expiry || expiry.length !== 5) return false;
    const [month, year] = expiry.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);

    if (isNaN(expMonth) || isNaN(expYear)) return false;
    if (expMonth < 1 || expMonth > 12) return false;
    
    // Allow any future date for dummy payments
    if (expYear > currentYear || (expYear === currentYear && expMonth >= currentMonth)) {
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    const cardDigits = cardNumber.replace(/\s/g, '');
    if (cardDigits.length < 13 || cardDigits.length > 16) {
      setError('Card number should be between 13 and 16 digits');
      setLoading(false);
      return;
    }

    if (!validateExpiryDate(expiryDate)) {
      setError('Please enter a valid future expiry date (MM/YY)');
      setLoading(false);
      return;
    }

    if (cvv.length < 3) {
      setError('CVV should be at least 3 digits');
      setLoading(false);
      return;
    }

    if (name.trim().length < 3) {
      setError('Please enter the cardholder name');
      setLoading(false);
      return;
    }

    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      // Simulate success for all cards except the test decline card
      if (cardNumber.replace(/\s/g, '') === '4111111111111111') {
        setError('Payment declined. Please use a different card.');
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (error) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
              onClick={onCancel}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength="19"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  placeholder="MM/YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength="5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength="3"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                  loading 
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
            <p>This is a simulated payment gateway for testing.</p>
            <p>Use any valid-looking card number except 4111 1111 1111 1111.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway; 