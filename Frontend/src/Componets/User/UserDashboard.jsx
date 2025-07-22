import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';
import Video from '../../assets/user_hero.mp4';
import axios from '../../utils/axios';
import { FaChevronDown, FaChevronUp, FaMusic, FaGlassCheers, FaPalette, FaRunning, FaLaptop, FaGraduationCap, FaTheaterMasks, FaHeart, FaStar } from 'react-icons/fa';
import { MdCorporateFare, MdCake, MdEventSeat, MdSportsHandball, MdFoodBank, MdCelebration } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import TextSizeControls from './TextSizeControls';

export const UserDashboard = () => {
  const [popularEvents, setPopularEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const navigate = useNavigate();

  const initialCategories = [
    { label: 'Musical Concert', value: 'MUSICAL_CONCERT', icon: <FaMusic className="w-6 h-6" /> },
    { label: 'Wedding', value: 'WEDDING', icon: <FaGlassCheers className="w-6 h-6" /> },
    { label: 'Corporate Event', value: 'CORPORATE_EVENT', icon: <MdCorporateFare className="w-6 h-6" /> },
    { label: 'Birthday Party', value: 'BIRTHDAY_PARTY', icon: <MdCake className="w-6 h-6" /> },
    { label: 'Conference', value: 'CONFERENCE', icon: <FaLaptop className="w-6 h-6" /> },
    { label: 'Seminar', value: 'SEMINAR', icon: <FaGraduationCap className="w-6 h-6" /> },
    { label: 'Workshop', value: 'WORKSHOP', icon: <MdEventSeat className="w-6 h-6" /> },
    { label: 'Exhibition', value: 'EXHIBITION', icon: <FaPalette className="w-6 h-6" /> },
    { label: 'Sports Event', value: 'SPORTS_EVENT', icon: <MdSportsHandball className="w-6 h-6" /> },
    { label: 'Charity Event', value: 'CHARITY_EVENT', icon: <FaHeart className="w-6 h-6" /> },
    { label: 'Food Festival', value: 'FOOD_FESTIVAL', icon: <MdFoodBank className="w-6 h-6" /> },
    { label: 'Cultural Festival', value: 'CULTURAL_FESTIVAL', icon: <MdCelebration className="w-6 h-6" /> },
    { label: 'Theater Play', value: 'THEATER_PLAY', icon: <FaTheaterMasks className="w-6 h-6" /> },
    { label: 'Comedy Show', value: 'COMEDY_SHOW', icon: <FaTheaterMasks className="w-6 h-6" /> },
    { label: 'Networking Event', value: 'NETWORKING_EVENT', icon: <FaLaptop className="w-6 h-6" /> },
    { label: 'Other', value: 'OTHER', icon: <MdEventSeat className="w-6 h-6" /> }
  ];

  // Filter out past events from popular events before displaying
  const filterActiveEvents = (events) => {
    return events.filter(event => {
      if (!event.startDate) return true;
      const eventDate = new Date(event.startDate);
      const today = new Date();
      eventDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });
  };

  useEffect(() => {
    fetchPopularEvents();
    setCategories(initialCategories);
  }, []);

  const isEventPassed = (event) => {
    if (!event.startDate) return false;
    const eventDate = new Date(event.startDate);
    const today = new Date();
    
    // Set both dates to start of day for fair comparison
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return eventDate < today;
  };

  const fetchPopularEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/events/popular');
      if (response.data.success && Array.isArray(response.data.data)) {
        // Filter out past events before setting to state
        const activeEvents = filterActiveEvents(response.data.data);
        setPopularEvents(activeEvents);
      } else {
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching popular events:', error);
      setError('Failed to fetch events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/events/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        setSearchResults(response.data.data);
        if (response.data.data.length === 0) {
          toast.info('No events found matching your search');
        }
      } else {
        setError('Invalid search results format');
      }
    } catch (error) {
      console.error('Error searching events:', error);
      toast.error('Failed to search events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Ensure categories is always an array and has a length property
  const visibleCategories = Array.isArray(categories) ? 
    (showAllCategories ? categories : categories.slice(0, 8)) 
    : [];

  const handleCategoryClick = (categoryValue) => {
    // Navigate to explore events with the selected category
    const params = new URLSearchParams();
    params.set('category', categoryValue);
    navigate(`/events?${params.toString()}`);
  };

  const EventSection = ({ title, events = [] }) => {
    const [interestedEvents, setInterestedEvents] = useState({});
    const [togglingEventId, setTogglingEventId] = useState(null);
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
      if (user) {
        checkInterestedEvents();
      }
    }, [user]);

    const checkInterestedEvents = async () => {
      try {
        const response = await axios.get('/profile/interested-events');
        if (response.data.events) {
          const interested = {};
          response.data.events.forEach(event => {
            interested[event._id] = true;
          });
          setInterestedEvents(interested);
        }
      } catch (error) {
        console.error('Error checking interested events:', error);
      }
    };

    const handleCardClick = (eventId) => {
      navigate(`/events/${eventId}`);
    };

    const handleInterestClick = async (e, eventId) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!user) {
        toast.error('Please login to mark events as interested');
        navigate('/user/login');
        return;
      }

      if (togglingEventId === eventId) return;

      try {
        setTogglingEventId(eventId);
        
        // Optimistically update UI
        setInterestedEvents(prev => ({
          ...prev,
          [eventId]: !prev[eventId]
        }));

        const response = await axios.post('/profile/toggle-interest', { eventId });
        
        if (response.data.success) {
          toast.success(response.data.message);
        } else {
          // Revert on failure
          setInterestedEvents(prev => ({
            ...prev,
            [eventId]: !prev[eventId]
          }));
          toast.error('Failed to update interest');
        }
      } catch (error) {
        // Revert on error
        setInterestedEvents(prev => ({
          ...prev,
          [eventId]: !prev[eventId]
        }));
        console.error('Error updating interest:', error);
        toast.error(error.response?.data?.message || 'Failed to update interest');
      } finally {
        setTogglingEventId(null);
      }
    };

    const getMonthAndDate = (dateString) => {
      const date = new Date(dateString);
      const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = date.getDate();
      return { month, day };
    };

    const getEventImage = (event) => {
      if (event.bannerImage) return event.bannerImage;
      return 'https://via.placeholder.com/400x200?text=No+Image+Available';
    };

    return (
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center text-white">{title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              if (!event) return null;
              const { month, day } = getMonthAndDate(event.startDate);
              const isToggling = togglingEventId === event._id;
              const isInterested = interestedEvents[event._id];

              return (
                <div 
                  key={event._id} 
                  className="bg-[#28264D] rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => handleCardClick(event._id)}
                >
                  <div className="relative">
                    <img
                      src={getEventImage(event)}
                      alt={event.title}
                      className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Image+Available';
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-white text-black rounded-lg p-2 text-center min-w-[60px]">
                      <div className="text-sm font-bold">{month}</div>
                      <div className="text-xl font-bold leading-none">{day}</div>
                    </div>
                    <button
                      onClick={(e) => handleInterestClick(e, event._id)}
                      disabled={isToggling}
                      className={`absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-300 ${
                        isToggling ? 'cursor-not-allowed opacity-50' : 'hover:transform hover:scale-110'
                      }`}
                    >
                      <FaStar 
                        className={`text-xl transition-colors duration-300 ${
                          isInterested ? 'text-yellow-400' : 'text-gray-400'
                        } ${isToggling ? 'animate-pulse' : ''}`}
                      />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-blue-400 mb-1">
                      {event.category.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                    </div>
                    <h3 className="font-semibold text-lg mb-1 text-white">{event.title}</h3>
                    <p className="text-sm text-gray-400 mb-2">{event.organizer?.organization || 'Event Organizer'}</p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{event.eventType === 'ticketed' && event.ticketing && event.ticketing[0] ? `₹${event.ticketing[0].price}` : 'Free'}</span>
                      <span className="flex items-center gap-1">
                        <FaStar className={isInterested ? 'text-yellow-400' : 'text-gray-400'} />
                        {isInterested ? 'Interested' : 'Not interested'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#1C1B29]">
      <UserNavbar />
      <TextSizeControls />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center text-center px-4 mt-6">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src={Video}
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
        <div className="relative z-20 text-white max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Don't miss out!</h1>
          <p className="text-lg md:text-xl mb-8">Explore the vibrant events happening locally and globally.</p>
          <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full px-6 py-3 rounded-full text-gray-800 text-lg focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center text-white">Explore Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {visibleCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className="flex flex-col items-center justify-center p-4 bg-[#28264D] hover:bg-[#322f5d] rounded-xl transition-colors"
              >
                <div className="text-blue-400 mb-2">
                  {cat.icon}
                </div>
                <span className="text-white text-sm text-center">{cat.label}</span>
              </button>
            ))}
          </div>
          
          {Array.isArray(categories) && categories.length > 8 && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {showAllCategories ? (
                  <>
                    Show Less <FaChevronUp className="ml-2" />
                  </>
                ) : (
                  <>
                    Show More <FaChevronDown className="ml-2" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="text-center text-red-400 py-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading events...</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <EventSection
          title="Search Results"
          events={searchResults}
          formatDate={formatDate}
          navigate={navigate}
        />
      )}

      {/* Popular Events */}
      {!loading && popularEvents.length > 0 && (
        <EventSection
          title="Popular Events in Your City"
          events={popularEvents}
          formatDate={formatDate}
          navigate={navigate}
        />
      )}

      {/* No Events Message - Updated to be more specific */}
      {!loading && !error && popularEvents.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400">No upcoming events found. Check back later!</p>
        </div>
      )}

      <UserFooter />
    </div>
  );
};

export default UserDashboard;