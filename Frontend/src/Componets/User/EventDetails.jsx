import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../utils/axios';
import BookingForm from './BookingForm';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';
import { toast } from 'react-hot-toast';
import TextSizeControls from './TextSizeControls';
import { FaStar } from 'react-icons/fa';

const UserEventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [isTogglingInterest, setIsTogglingInterest] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    if (user && token) {
      fetchUserBookings();
    }
    const checkInterestStatus = async () => {
      try {
        const response = await axios.get('/profile/interested-events');
        const interestedEvents = response.data.events.map(event => event._id);
        setIsInterested(interestedEvents.includes(eventId));
      } catch (error) {
        console.error('Error checking interest status:', error);
      }
    };

    if (user && token) {
      checkInterestStatus();
    }
  }, [eventId, user, token]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`/events/${eventId}`);
      if (response.data.success) {
        setEvent(response.data.data);
      } else {
        setError('Failed to fetch event details');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err.response?.data?.message || 'Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    setBookingsLoading(true);
    try {
      const response = await axios.get('/bookings/my-bookings');
      if (response.data.success) {
        // Filter bookings for this event
        const eventBookings = response.data.data.filter(
          booking => booking.event._id === eventId
        );
        setUserBookings(eventBookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const isEventPassed = () => {
    if (!event || !event.startDate) return false;
    const eventDate = new Date(event.startDate);
    const today = new Date();
    
    // Set both dates to start of day for fair comparison
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return eventDate < today;
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Date not available';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date not available';
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date not available';
    }
  };

  const handleBooking = () => {
    if (!user) {
      // Redirect to login if user is not authenticated
      toast.error('Please login to book tickets');
      navigate('/user/login');
      return;
    }

    if (isEventPassed()) {
      toast.error('This event has already ended');
      return;
    }

    setShowBookingForm(true);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await axios.put(`/bookings/${bookingId}/cancel`);
      if (response.data.success) {
        fetchUserBookings();
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  };

  const handleToggleInterest = async () => {
    if (!user) {
      toast.error('Please login to mark events as interested');
      navigate('/user/login');
      return;
    }

    try {
      setIsTogglingInterest(true);
      console.log('Toggling interest for event:', eventId);
      const response = await axios.post('/profile/toggle-interest', { eventId: eventId });
      console.log('Toggle interest response:', response.data);
      setIsInterested(response.data.isInterested);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error toggling interest:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update interest status';
      toast.error(errorMessage);
    } finally {
      setIsTogglingInterest(false);
    }
  };

  const getEventImage = (event) => {
    if (!event) return null;
    if (event.bannerImage) return event.bannerImage;
    return 'https://via.placeholder.com/1200x400?text=No+Image+Available';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error || 'Event not found'}</div>
        <button
          onClick={() => navigate('/events')}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <TextSizeControls />
      <main className="container mx-auto px-4 pt-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="md:col-span-2">
              {/* Event Banner */}
              <div className="relative rounded-lg overflow-hidden mb-8">
                <img
                  src={getEventImage(event)}
                  alt={event?.title}
                  className="w-full h-[400px] object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/1200x400?text=No+Image+Available';
                  }}
                />
                <button
                  onClick={handleToggleInterest}
                  disabled={isTogglingInterest}
                  className={`absolute top-4 right-4 p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors ${isTogglingInterest ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <FaStar 
                    className={`text-2xl ${isInterested ? 'text-yellow-400' : 'text-gray-400'} ${isTogglingInterest ? 'animate-pulse' : ''}`} 
                  />
                </button>
              </div>

              {/* Event Status */}
              {isEventPassed() && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
                  This event has ended
                </div>
              )}

              {/* Event Title and Basic Info */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-2">📅</span>
                    {formatDate(event.startDate)}
                  </div>
                  {event.startTime && (
                    <div className="flex items-center">
                      <span className="mr-2">⏰</span>
                      {event.startTime}
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className="mr-2">📍</span>
                    {event.location}
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="prose max-w-none mb-8">
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <div className="text-gray-600 whitespace-pre-wrap">
                  {event.description || 'No description available'}
                </div>
              </div>

              {/* User's Tickets Section */}
              {user && userBookings.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Your Tickets</h2>
                  <div className="space-y-4">
                    {userBookings.map(booking => (
                      <div
                        key={booking._id}
                        className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-semibold text-lg">{booking.ticketType}</p>
                            <p className="text-gray-600">Quantity: {booking.quantity}</p>
                            <p className="text-gray-600">Total: ${booking.totalAmount}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="font-medium text-gray-900">Ticket Numbers:</p>
                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                            {booking.ticketNumbers.map(number => (
                              <div key={number} className="text-sm font-mono text-gray-600">
                                {number}
                              </div>
                            ))}
                          </div>
                        </div>

                        {booking.status === 'confirmed' && !isEventPassed() && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Ticket Information */}
            <div>
              <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
                <h2 className="text-2xl font-bold mb-4">
                  {isEventPassed() ? 'Event Ended' : (event.eventType === 'free' ? 'Free Event' : 'Select Tickets')}
                </h2>
                
                {isEventPassed() ? (
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">This event has already taken place.</p>
                  </div>
                ) : event.eventType === 'free' ? (
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">This is a free event. Register now to secure your spot!</p>
                    <button 
                      onClick={handleBooking}
                      className="w-full bg-[#2B293D] text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                    >
                      Register Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {event.ticketing?.map((ticket, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 cursor-pointer transition-colors border-[#2B293D] bg-white hover:bg-[#2B293D]/5"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{ticket.name}</h3>
                            <p className="text-sm text-gray-600">{ticket.quantity} tickets left</p>
                          </div>
                          <span className="text-lg font-bold">${ticket.price}</span>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleBooking}
                      className="w-full bg-[#2B293D] text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <button 
                    onClick={handleToggleInterest}
                    className="text-gray-600 hover:text-[#2B293D] text-sm flex items-center justify-center gap-2"
                  >
                    <FaStar className={`text-2xl ${isInterested ? 'text-yellow-400' : 'text-gray-400'}`} />
                    {isInterested ? 'Interested' : 'Mark as Interested'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <UserFooter />

      {/* Booking Form Modal */}
      {showBookingForm && event && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <BookingForm
              event={event}
              onClose={() => {
                setShowBookingForm(false);
                fetchUserBookings(); // Refresh bookings after new booking
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEventDetails; 