import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { format } from 'date-fns';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings/my-bookings');
      setBookings(response.data.data);
    } catch (err) {
      setError('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`);
      fetchBookings(); // Refresh bookings list
    } catch (err) {
      setError('Error cancelling booking');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No bookings found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map(booking => (
            <div
              key={booking._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">
                  {booking.event.title}
                </h2>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <span className="font-medium">Date: </span>
                    {format(new Date(booking.event.date), 'PPP')}
                  </p>
                  <p>
                    <span className="font-medium">Ticket Type: </span>
                    {booking.ticketType}
                  </p>
                  <p>
                    <span className="font-medium">Quantity: </span>
                    {booking.quantity}
                  </p>
                  <p>
                    <span className="font-medium">Total Amount: </span>
                    ${booking.totalAmount}
                  </p>
                  <p>
                    <span className="font-medium">Status: </span>
                    <span className={`font-medium ${
                      booking.status === 'confirmed' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="font-medium">Ticket Numbers:</p>
                  <div className="bg-gray-50 p-2 rounded">
                    {booking.ticketNumbers.map(number => (
                      <div key={number} className="text-sm text-gray-600">
                        {number}
                      </div>
                    ))}
                  </div>
                </div>

                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings; 