import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../utils/axios';
import BookingConfirmation from './BookingConfirmation';

const BookingForm = ({ event, onClose }) => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    ticketType: event.ticketing[0]?.name || '',
    quantity: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  const selectedTicket = event.ticketing.find(ticket => ticket.name === formData.ticketType);
  const totalAmount = selectedTicket ? selectedTicket.price * formData.quantity : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user || !token) {
      navigate('/user/login?redirect=' + window.location.pathname);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const response = await axios.post('/bookings', {
        eventId: event._id,
        ticketType: formData.ticketType,
        quantity: parseInt(formData.quantity),
        totalAmount: totalAmount
      });

      if (response.data.success) {
        setBookingConfirmation(response.data.data);
      } else {
        setError(response.data.message || 'Booking failed. Please try again.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      if (err.response?.status === 401) {
        navigate('/user/login?redirect=' + window.location.pathname);
        return;
      }
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Error creating booking';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBookings = () => {
    navigate('/user/bookings');
  };

  if (bookingConfirmation) {
    return (
      <BookingConfirmation
        booking={bookingConfirmation}
        onClose={onClose}
        onViewBookings={handleViewBookings}
      />
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4">Book Tickets</h2>
      <h3 className="text-xl mb-4">{event.title}</h3>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ticket Type
          </label>
          <select
            name="ticketType"
            value={formData.ticketType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B293D]"
            required
          >
            {event.ticketing.map(ticket => (
              <option key={ticket.name} value={ticket.name}>
                {ticket.name} - ${ticket.price}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            min="1"
            max={selectedTicket?.quantity || 1}
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B293D]"
            required
          />
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount:</span>
            <span className="text-xl font-bold">${totalAmount}</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 bg-[#2B293D] text-white py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors
              ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm; 