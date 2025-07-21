import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';
import { QRCodeSVG } from 'qrcode.react';
import { generateTicketQRData } from '../../utils/qrCodeUtils';

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

  const formatEventDate = (event) => {
    try {
      if (!event || !event.startDate) return 'Date not available';

      const date = new Date(event.startDate);
      if (isNaN(date.getTime())) return 'Date not available';

      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      const formattedDate = date.toLocaleDateString('en-US', options);
      const timeString = event.startTime ? 
        (event.endTime ? `${event.startTime} - ${event.endTime}` : event.startTime) 
        : '';

      return timeString ? `${formattedDate} at ${timeString}` : formattedDate;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date not available';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B293D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">My Tickets</h1>

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
                {/* Event Banner */}
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

                {/* Event Details */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{booking.event.title}</h3>
                  <p className="text-gray-600 mb-4">{formatEventDate(booking.event)}</p>
                  <p className="text-gray-600 mb-4">{booking.event.location}</p>

                  {/* Booking Details */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Ticket Type</p>
                        <p className="font-medium">{booking.ticketType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-medium">{booking.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium">${booking.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className={`font-medium ${
                          booking.status === 'confirmed' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tickets */}
                  {booking.status === 'confirmed' && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Your Tickets</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {booking.ticketNumbers.map((ticketNumber, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                              <QRCodeSVG
                                value={generateTicketQRData(booking, ticketNumber)}
                                size={120}
                                level="H"
                                includeMargin={true}
                              />
                            </div>
                            <div className="mt-3 text-center">
                              <p className="text-xs font-medium text-gray-900">Ticket #{index + 1}</p>
                              <p className="text-xs text-gray-500 mt-1">{ticketNumber}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {booking.status === 'confirmed' && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UserFooter />
    </div>
  );
};

export default UserBookings; 