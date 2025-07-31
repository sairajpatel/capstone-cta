import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';
import { QRCodeSVG } from 'qrcode.react';
import { generateTicketQRData } from '../../utils/qrCodeUtils';
import TextSizeControls from './TextSizeControls';

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
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <TextSizeControls />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B293D]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <TextSizeControls />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

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
                          booking.status === 'confirmed' ? 'text-green-600' : 
                          booking.status === 'pending' ? 'text-yellow-600' :
                          booking.status === 'cancelled' ? 'text-red-600' :
                          booking.status === 'failed' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {booking.status === 'confirmed' ? 'Confirmed' :
                           booking.status === 'pending' ? 'Pending Payment' :
                           booking.status === 'cancelled' ? 'Cancelled' :
                           booking.status === 'failed' ? 'Payment Failed' :
                           booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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

                  {booking.status === 'pending' && booking.totalAmount > 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <button
                        onClick={() => {
                          const params = new URLSearchParams({
                            bookingId: booking._id,
                            amount: booking.totalAmount
                          });
                          window.location.href = `/payment?${params.toString()}`;
                        }}
                        className="w-full h-11 flex items-center justify-center px-6 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-200 font-medium gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Complete Payment
                      </button>
                    </div>
                  )}

                  {booking.status === 'pending' && booking.totalAmount === 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Free event - No payment required</p>
                      </div>
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