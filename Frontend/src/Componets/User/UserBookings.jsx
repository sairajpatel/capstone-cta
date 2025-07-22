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
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  const handleCancelClick = (bookingId) => {
    setCancellingBookingId(bookingId);
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    try {
      const response = await axios.put(`/bookings/${cancellingBookingId}/cancel`);
      if (response.data.success) {
        fetchBookings(); // Refresh bookings list
        setShowCancelConfirm(false);
      } else {
        setError('Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Error cancelling booking');
    } finally {
      setCancellingBookingId(null);
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

  const CancelConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Cancel Booking</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setShowCancelConfirm(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Keep Booking
          </button>
          <button
            onClick={handleCancelConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );

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

                  {/* Actions */}
                  {booking.status === 'confirmed' && (
                    <div className="mt-6 pt-4 border-t">
                      <button
                        onClick={() => handleCancelClick(booking._id)}
                        className="w-full h-11 flex items-center justify-center px-6 text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-all duration-200 font-medium gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel Booking
                      </button>
                    </div>
                  )}

                  {/* Tickets */}
                  {booking.status === 'confirmed' && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 mb-3">Your Tickets</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {booking.ticketNumbers.map((ticketNumber, index) => (
                          <div key={index} className="flex flex-col h-full">
                            <div className="bg-white border border-gray-200 rounded-lg p-4 flex-1 flex flex-col items-center">
                              <div className="bg-white p-2 rounded-lg shadow-sm mb-3">
                                <QRCodeSVG
                                  value={generateTicketQRData(booking, ticketNumber)}
                                  size={120}
                                  level="H"
                                  includeMargin={true}
                                />
                              </div>
                              <div className="text-center mt-auto">
                                <p className="text-sm font-medium text-gray-900">Ticket #{index + 1}</p>
                                <p className="text-xs text-gray-500 mt-1 font-mono">{ticketNumber}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modal for Cancel Confirmation */}
                  {showCancelConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Cancel Booking</h3>
                        <p className="text-gray-600 mb-6">
                          Are you sure you want to cancel this booking? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-6 h-11 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-200 font-medium"
                          >
                            Keep Booking
                          </button>
                          <button
                            onClick={handleCancelConfirm}
                            className="px-6 h-11 text-white bg-red-600 rounded-md hover:bg-red-700 transition-all duration-200 font-medium flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Yes, Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCancelConfirm && <CancelConfirmationModal />}
      <UserFooter />
    </div>
  );
};

export default UserBookings; 