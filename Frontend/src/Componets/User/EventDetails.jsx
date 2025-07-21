import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import BookingForm from './BookingForm';

const UserEventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`/api/events/${eventId}`);
      setEvent(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{error || 'Event not found'}</div>
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
    <div className="relative">
      {/* Event Details Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Event Details</h2>
            <p className="text-gray-600">{event.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Date and Time</h2>
            <p className="text-gray-600">
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Location</h2>
            <p className="text-gray-600">{event.location}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Tickets</h2>
            <div className="space-y-2">
              {event.ticketing && event.ticketing.map(ticket => (
                <div
                  key={ticket.name}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">{ticket.name}</p>
                    <p className="text-sm text-gray-600">
                      {ticket.quantity} tickets available
                    </p>
                  </div>
                  <p className="text-lg font-semibold">${ticket.price}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowBookingForm(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && event && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <BookingForm
              event={event}
              onClose={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEventDetails; 