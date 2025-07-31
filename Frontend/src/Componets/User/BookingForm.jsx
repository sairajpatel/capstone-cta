import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import PaymentGateway from './PaymentGateway';
import BookingConfirmation from './BookingConfirmation';
import { toast } from 'react-hot-toast';

const BookingForm = ({ event, onClose }) => {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  // Create a default free ticket if event is free and has no ticket types
  const tickets = event.eventType === 'free' && (!event.ticketing || event.ticketing.length === 0) 
    ? [{ name: 'Free Entry', price: 0, quantity: 100 }] 
    : event.ticketing || [];

  console.log('BookingForm - Event:', event);
  console.log('BookingForm - Tickets:', tickets);
  console.log('BookingForm - Selected ticket:', selectedTicket);
  console.log('BookingForm - Event description:', event?.description);
  console.log('BookingForm - Event title:', event?.title);

  const calculateTotal = () => {
    if (!selectedTicket) return 0;
    const ticket = tickets.find(t => t.name === selectedTicket);
    return ticket ? ticket.price * quantity : 0;
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      const ticket = tickets.find(t => t.name === selectedTicket);
      if (ticket && value <= ticket.quantity) {
        setQuantity(value);
        setError('');
      } else {
        setError('Not enough tickets available');
      }
    }
  };

  const handleTicketSelect = (ticketName) => {
    console.log('Selecting ticket:', ticketName);
    setSelectedTicket(ticketName);
    setQuantity(1);
    setError('');
  };

  const createBooking = async () => {
    try {
      setLoading(true);
      const ticket = tickets.find(t => t.name === selectedTicket);
      if (!ticket) {
        throw new Error('Please select a ticket type');
      }

      const bookingData = {
        eventId: event._id,
        ticketType: ticket.name,
        quantity: quantity,
        totalAmount: calculateTotal()
      };

      console.log('Creating booking with data:', bookingData);
      const response = await axios.post('/bookings', bookingData);
      
      if (response.data.success) {
        setBooking(response.data.data);
        console.log('Booking created successfully:', response.data.data);
        
        // Only show confirmation immediately for free tickets
        if (ticket.price === 0) {
          setShowConfirmation(true);
          toast.success('Booking created successfully!');
        }
        // For paid tickets, let the payment flow handle confirmation
      } else {
        throw new Error(response.data.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
      toast.error(err.message || 'Failed to create booking');
      throw err; // Re-throw to stop the payment flow
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called');
    
    if (!selectedTicket) {
      setError('Please select a ticket type');
      return;
    }

    const ticket = tickets.find(t => t.name === selectedTicket);
    console.log('Selected ticket:', ticket);
    
    if (!ticket || ticket.quantity < quantity) {
      setError('Not enough tickets available');
      return;
    }

    console.log('Creating booking...');
    // Create booking first, then handle payment
    await createBooking();
    
    console.log('Booking created, checking if payment needed...');
    // If it's a paid ticket, show payment gateway
    if (ticket.price > 0) {
      console.log('Paid ticket detected, showing payment gateway');
      setShowPayment(true);
    } else {
      console.log('Free ticket, showing confirmation directly');
    }
  };

  if (showConfirmation && booking) {
    return (
      <BookingConfirmation 
        booking={booking} 
        onClose={onClose}
        onViewBookings={() => navigate('/user/bookings')}
      />
    );
  }

  if (showPayment && booking) {
    console.log('Rendering PaymentGateway with booking:', booking._id, 'amount:', calculateTotal());
    console.log('showPayment:', showPayment, 'booking:', booking);
    
    // Test if PaymentGateway component is working
    console.log('PaymentGateway component:', PaymentGateway);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <h2 className="text-2xl font-bold mb-4">Payment Gateway</h2>
          <div className="text-center">
            <p className="text-gray-600 mb-4">Redirecting to secure payment page...</p>
            <button
              onClick={() => {
                const params = new URLSearchParams({
                  bookingId: booking._id,
                  amount: calculateTotal()
                });
                window.location.href = `/payment?${params.toString()}`;
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Book Tickets</h2>
            <button 
              onClick={onClose} 
              className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            {/* Event Details */}
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-3">{event?.title || 'Event'}</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span><span className="font-medium">Date:</span> {event?.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBD'}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><span className="font-medium">Time:</span> {event?.startTime || 'TBD'} {event?.endTime && `- ${event.endTime}`}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span><span className="font-medium">Location:</span> {event?.location || 'TBD'}</span>
                </div>
                {event?.description && (
                  <div className="flex items-start mt-3 pt-3 border-t border-gray-200">
                    <svg className="w-4 h-4 mr-2 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span><span className="font-medium">Description:</span> {event.description}</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ticket Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Ticket Type
                </label>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {tickets.map((ticket, index) => (
                    <label key={index} className={`block p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedTicket === ticket.name 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="ticketType"
                          value={ticket.name}
                          checked={selectedTicket === ticket.name}
                          onChange={() => handleTicketSelect(ticket.name)}
                          className="mr-4 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-lg">{ticket.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {ticket.price === 0 ? 'Free Entry' : `$${ticket.price}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{ticket.quantity}</div>
                          <div className="text-xs text-gray-500">available</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              {selectedTicket && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              {/* Total and Submit */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">${calculateTotal()}</span>
                </div>
                
                {!selectedTicket && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-blue-700 text-sm font-medium">Please select a ticket type to continue</span>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading || !selectedTicket}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform ${
                    loading || !selectedTicket
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] shadow-lg'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Continue to Book'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm; 