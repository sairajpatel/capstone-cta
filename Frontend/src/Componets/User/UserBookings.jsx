import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { format } from 'date-fns';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/bookings/my-bookings');
      if (response.data.success) {
        setBookings(response.data.data);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await axios.put(`/bookings/${bookingId}/cancel`);
      if (response.data.success) {
        fetchBookings(); // Refresh bookings list
      } else {
        setError('Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Error cancelling booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B293D]"></div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">No bookings found</p>
            <a 
              href="/events" 
              className="mt-4 inline-block text-[#2B293D] hover:text-opacity-80"
            >
              Browse Events
            </a>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map(booking => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {booking.event.bannerImage && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={booking.event.bannerImage}
                      alt={booking.event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Banner+Image';
                      }}
                    />
                  </div>
                )}
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
      </main>

      <UserFooter />
    </div>
  );
};

export default UserBookings; 