import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaCalendar, FaMapMarkerAlt, FaTicketAlt } from 'react-icons/fa';
import axios from '../../utils/axios';
import UserNavbar from './UserNavbar';
import TextSizeControls from './TextSizeControls';
import toast from 'react-hot-toast';

const InterestedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingEventId, setTogglingEventId] = useState(null);

  useEffect(() => {
    fetchInterestedEvents();
  }, []);

  const fetchInterestedEvents = async () => {
    try {
      console.log('Fetching interested events...');
      const response = await axios.get('/profile/interested-events');
      console.log('Interested events response:', response.data);
      
      if (response.data.success) {
        setEvents(response.data.events || []);
      } else {
        toast.error('Failed to fetch interested events');
      }
    } catch (error) {
      console.error('Error fetching interested events:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch interested events');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInterest = async (eventId) => {
    try {
      setTogglingEventId(eventId);
      const response = await axios.post('/profile/toggle-interest', { eventId });
      if (response.data.success) {
        // Remove the event from the list
        setEvents(events.filter(event => event._id !== eventId));
        toast.success('Event removed from interests');
      } else {
        toast.error('Failed to update interest');
      }
    } catch (error) {
      console.error('Error toggling interest:', error);
      toast.error(error.response?.data?.message || 'Failed to update interest');
    } finally {
      setTogglingEventId(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Date not available';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date not available';
      return date.toLocaleDateString('en-US', {
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

  const getEventPrice = (ticketing) => {
    if (!ticketing || ticketing.length === 0) return 'Free';
    const prices = ticketing.map(ticket => ticket.price);
    const minPrice = Math.min(...prices);
    return `From $${minPrice}`;
  };

  const getEventImage = (event) => {
    if (event.bannerImage) return event.bannerImage;
    return 'https://via.placeholder.com/400x200?text=No+Image+Available';
  };

  return (
    <div className="min-h-screen bg-[#1C1B29]">
      <UserNavbar />
      <TextSizeControls />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Interested Events</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <FaStar className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-400 text-xl">No interested events yet</p>
            <Link to="/events" className="text-yellow-400 hover:text-yellow-500 mt-4 inline-block">
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-[#28264D] rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105">
                <div className="relative">
                  <img 
                    src={getEventImage(event)}
                    alt={event.title} 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = 'https://via.placeholder.com/400x200?text=No+Image+Available';
                    }}
                  />
                  <button
                    onClick={() => handleToggleInterest(event._id)}
                    disabled={togglingEventId === event._id}
                    className={`absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors ${togglingEventId === event._id ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <FaStar 
                      className={`text-xl text-yellow-400 ${togglingEventId === event._id ? 'animate-pulse' : ''}`} 
                    />
                  </button>
                  {event.status === 'cancelled' && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded">
                      Cancelled
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-white flex-grow">{event.title}</h3>
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded ml-2">
                      {event.category}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-center">
                      <FaCalendar className="mr-2 text-yellow-400" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-yellow-400" />
                      <span>{event.venue || event.location}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <FaTicketAlt className="mr-2 text-yellow-400" />
                      <span>{getEventPrice(event.ticketing)}</span>
                    </div>

                    {event.organizer && (
                      <div className="text-sm text-gray-400">
                        By: {event.organizer.name}
                      </div>
                    )}
                  </div>
                  
                  <Link
                    to={`/events/${event._id}`}
                    className="mt-4 inline-block w-full text-center bg-yellow-400 text-black py-2 rounded-md hover:bg-yellow-500 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestedEvents; 