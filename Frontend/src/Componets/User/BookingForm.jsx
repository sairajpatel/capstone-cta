import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { PaymentGateway } from './PaymentGateway';
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
          <PaymentGateway
            bookingId={booking._id}
            amount={calculateTotal()}
            onSuccess={() => {
              setShowConfirmation(true);
              toast.success('Payment successful! Booking confirmed.');
            }}
            onError={(error) => {
              toast.error(error || 'Payment failed. Please try again.');
              setShowPayment(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Book Tickets</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Ticket Type
            </label>
            <div className="space-y-2">
              {tickets.map((ticket, index) => (
                <label key={index} className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedTicket === ticket.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="ticketType"
                    value={ticket.name}
                    checked={selectedTicket === ticket.name}
                    onChange={() => handleTicketSelect(ticket.name)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{ticket.name}</div>
                    <div className="text-sm text-gray-500">
                      {ticket.price === 0 ? 'Free' : `$${ticket.price}`}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {ticket.quantity} available
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedTicket && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Total Amount:</span>
              <span className="font-bold">${calculateTotal()}</span>
            </div>
            
            {!selectedTicket && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">Please select a ticket type to continue</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || !selectedTicket}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                loading || !selectedTicket
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-[#2B293D] text-white hover:bg-opacity-90 hover:scale-105'
              }`}
            >
              {loading ? 'Processing...' : 'Continue to Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm; 