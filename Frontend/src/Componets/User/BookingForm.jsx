import React, { useState } from 'react';
import axios from '../../utils/axios';
import PaymentGateway from './PaymentGateway';
import BookingConfirmation from './BookingConfirmation';

const BookingForm = ({ event, onClose }) => {
  const [selectedTicket, setSelectedTicket] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    if (!selectedTicket) return 0;
    const ticket = event.ticketing.find(t => t.name === selectedTicket);
    return ticket ? ticket.price * quantity : 0;
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      const ticket = event.ticketing.find(t => t.name === selectedTicket);
      if (ticket && value <= ticket.quantity) {
        setQuantity(value);
        setError('');
      } else {
        setError('Not enough tickets available');
      }
    }
  };

  const handleTicketSelect = (ticketName) => {
    setSelectedTicket(ticketName);
    setQuantity(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) {
      setError('Please select a ticket type');
      return;
    }

    const ticket = event.ticketing.find(t => t.name === selectedTicket);
    if (!ticket || ticket.quantity < quantity) {
      setError('Not enough tickets available');
      return;
    }

    // If it's a free ticket, create booking directly
    if (ticket.price === 0) {
      await createBooking();
    } else {
      // Show payment gateway for paid tickets
      setShowPayment(true);
    }
  };

  const createBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/bookings', {
        eventId: event._id,
        ticketType: selectedTicket,
        quantity: quantity
      });

      if (response.data.success) {
        setBooking(response.data.data);
        setShowConfirmation(true);
      } else {
        setError('Failed to create booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Error creating booking');
    } finally {
      setLoading(false);
      setShowPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    createBooking();
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (showConfirmation && booking) {
    return (
      <BookingConfirmation
        booking={booking}
        onClose={onClose}
        onViewBookings={() => {
          window.location.href = '/bookings';
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Book Tickets</h2>
              <p className="text-gray-600">{event.title}</p>
            </div>
            <button
              onClick={onClose}
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
                Select Ticket Type
              </label>
              <div className="space-y-2">
                {event.ticketing.map((ticket) => (
                  <div
                    key={ticket.name}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTicket === ticket.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                    onClick={() => handleTicketSelect(ticket.name)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{ticket.name}</p>
                        <p className="text-sm text-gray-500">
                          {ticket.quantity} tickets available
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${ticket.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-medium text-gray-700">Total Amount:</span>
                <span className="font-semibold text-gray-900">
                  ${calculateTotal()}
                </span>
              </div>

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
                  'Continue to Payment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showPayment && (
        <PaymentGateway
          amount={calculateTotal()}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
};

export default BookingForm; 