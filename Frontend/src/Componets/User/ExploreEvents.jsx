import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';
import axios from '../../utils/axios';
import { FaFilter, FaTimes, FaMapMarkerAlt, FaClock, FaTicketAlt, FaMicrophone, FaMicrophoneSlash, FaStar, FaCalendar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import TextSizeControls from './TextSizeControls';
import { useSelector } from 'react-redux';

const ExploreEvents = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [interestedEvents, setInterestedEvents] = useState({});
  const [togglingEventId, setTogglingEventId] = useState(null);
  const { user } = useSelector((state) => state.auth);

  // Get category from URL params on component mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    // Fetch events whenever category changes from URL
    fetchEvents(categoryFromUrl || '');
  }, [location.search]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        handleSearch(null, transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition failed. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

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

  // Filter options
  const priceRanges = [
    { label: 'All Prices', value: '' },
    { label: 'Free', value: 'free' },
    { label: 'Under $25', value: 'under25' },
    { label: '$25 to $50', value: '25-50' },
    { label: 'Above $50', value: 'above50' }
  ];

  const dateRanges = [
    { label: 'Any Date', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'Tomorrow', value: 'tomorrow' },
    { label: 'This Weekend', value: 'weekend' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' }
  ];

  const categories = [
    { label: 'All Categories', value: '' },
    { label: 'Musical Concert', value: 'MUSICAL_CONCERT' },
    { label: 'Wedding', value: 'WEDDING' },
    { label: 'Corporate Event', value: 'CORPORATE_EVENT' },
    { label: 'Birthday Party', value: 'BIRTHDAY_PARTY' },
    { label: 'Conference', value: 'CONFERENCE' },
    { label: 'Seminar', value: 'SEMINAR' },
    { label: 'Workshop', value: 'WORKSHOP' },
    { label: 'Exhibition', value: 'EXHIBITION' },
    { label: 'Sports Event', value: 'SPORTS_EVENT' },
    { label: 'Charity Event', value: 'CHARITY_EVENT' },
    { label: 'Food Festival', value: 'FOOD_FESTIVAL' },
    { label: 'Cultural Festival', value: 'CULTURAL_FESTIVAL' },
    { label: 'Theater Play', value: 'THEATER_PLAY' },
    { label: 'Comedy Show', value: 'COMEDY_SHOW' },
    { label: 'Networking Event', value: 'NETWORKING_EVENT' },
    { label: 'Other', value: 'OTHER' }
  ];

  const fetchEvents = async (categoryValue = selectedCategory) => {
    try {
      setLoading(true);
      let url = '/events/all';
      const params = new URLSearchParams();
      
      if (categoryValue) {
        params.append('category', categoryValue);
      }
      if (selectedPrice) params.append('priceRange', selectedPrice);
      if (selectedDate) params.append('dateRange', selectedDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setEvents(response.data.data);
      } else {
        toast.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e, voiceQuery = null) => {
    if (e) e.preventDefault();
    const query = voiceQuery || searchQuery;
    
    if (!query.trim()) {
      fetchEvents();
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(`/events/search?query=${encodeURIComponent(query)}`);
      setEvents(response.data.data);
      if (voiceQuery) {
        toast.success(`Searching for: ${query}`);
      }
    } catch (error) {
      console.error('Error searching events:', error);
      toast.error('Failed to search events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceRecognition = () => {
    if (!recognition) {
      toast.error('Voice recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setSearchQuery('');
      recognition.start();
      setIsListening(true);
      toast.success('Listening... Speak now');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedPrice('');
    setSelectedDate('');
    // Clear URL parameters and fetch all events
    navigate(location.pathname);
    fetchEvents('');
  };

  const isEventPassed = (event) => {
    if (!event.startDate) return false;
    const eventDate = new Date(event.startDate);
    const today = new Date();
    
    // Set both dates to start of day for fair comparison
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return eventDate < today;
  };

  const handleCategoryChange = (categoryValue) => {
    // Update URL and state
    const params = new URLSearchParams(location.search);
    if (categoryValue && categoryValue !== '') {
      params.set('category', categoryValue);
    } else {
      params.delete('category');
    }
    navigate(`${location.pathname}?${params.toString()}`);
    setSelectedCategory(categoryValue);
    // Fetch events with new category
    fetchEvents(categoryValue);
    setShowFilters(false);
  };

  const handleInterestClick = async (e, eventId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to mark events as interested');
      navigate('/user/login');
      return;
    }

    if (togglingEventId) return; // Prevent multiple clicks while processing

    try {
      setTogglingEventId(eventId);
      console.log('Toggling interest for event:', eventId);
      
      const response = await axios.post('/profile/toggle-interest', { eventId });
      console.log('Toggle response:', response.data);
      
      if (response.data.success) {
        setInterestedEvents(prev => ({
          ...prev,
          [eventId]: !prev[eventId]
        }));
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error updating interest:', error);
      toast.error(error.response?.data?.message || 'Failed to update interest');
    } finally {
      setTogglingEventId(null);
    }
  };

  const getEventImage = (event) => {
    return event.bannerImage || 'https://via.placeholder.com/400x200?text=No+Image+Available';
  };

  const getEventPrice = (ticketing) => {
    if (!ticketing || ticketing.length === 0) {
      return 'Tickets not available';
    }
    const minPrice = Math.min(...ticketing.map(t => t.price));
    return `From $${minPrice}`;
  };

  return (
    <div className="min-h-screen bg-[#1C1B29]">
      <UserNavbar />
      <TextSizeControls />

      {/* Search Header */}
      <div className="bg-[#1C1B29] text-white pt-6 sm:pt-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Explore a world of events. Find what excites you!</h1>
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-24"
              />
              <button
                type="button"
                onClick={toggleVoiceRecognition}
                className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-600 p-2"
                title={isListening ? 'Stop listening' : 'Start voice search'}
              >
                {isListening ? <FaMicrophoneSlash className="w-5 h-5" /> : <FaMicrophone className="w-5 h-5" />}
              </button>
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 text-sm sm:text-base"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Mobile Filter Button */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-md"
          >
            <FaFilter />
            <span>Filters</span>
          </button>
          {(selectedCategory || selectedPrice || selectedDate) && (
            <button
              onClick={clearFilters}
              className="text-white underline text-sm"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'fixed inset-0 z-50 bg-[#1C1B29] overflow-auto' : 'hidden'} md:relative md:block md:z-auto`}>
            <div className="bg-white rounded-lg p-4 sm:p-6">
              <div className="flex justify-between items-center md:hidden mb-4">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="hidden md:block mb-4">
                <h2 className="text-xl font-semibold">Filters</h2>
              </div>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Category</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.value} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        checked={selectedCategory === category.value}
                        onChange={(e) => {
                          handleCategoryChange(e.target.value);
                          setShowFilters(false);
                        }}
                        className="mr-2"
                      />
                      <span className="text-gray-700">{category.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Price</h3>
                <div className="space-y-2">
                  {priceRanges.map((price) => (
                    <label key={price.value} className="flex items-center">
                      <input
                        type="radio"
                        name="price"
                        value={price.value}
                        checked={selectedPrice === price.value}
                        onChange={(e) => {
                          setSelectedPrice(e.target.value);
                          setShowFilters(false);
                        }}
                        className="mr-2"
                      />
                      <span className="text-gray-700">{price.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Date</h3>
                <div className="space-y-2">
                  {dateRanges.map((date) => (
                    <label key={date.value} className="flex items-center">
                      <input
                        type="radio"
                        name="date"
                        value={date.value}
                        checked={selectedDate === date.value}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setShowFilters(false);
                        }}
                        className="mr-2"
                      />
                      <span className="text-gray-700">{date.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Apply Filters Button (Mobile Only) */}
              <div className="md:hidden">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center text-white py-12">
                <h3 className="text-xl font-medium mb-2">No events found</h3>
                <p className="text-gray-400">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div 
                    key={event._id}
                    className="bg-[#28264D] rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    onClick={() => navigate(`/events/${event._id}`)}
                  >
                    <div className="relative">
                      <img 
                        src={getEventImage(event)}
                        alt={event.title} 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x200?text=No+Image+Available';
                        }}
                      />
                      <button
                        onClick={(e) => handleInterestClick(e, event._id)}
                        disabled={togglingEventId === event._id}
                        className={`absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors ${togglingEventId === event._id ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <FaStar 
                          className={`text-xl ${interestedEvents[event._id] ? 'text-yellow-400' : 'text-gray-400'} ${togglingEventId === event._id ? 'animate-pulse' : ''}`} 
                        />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-white flex-grow">{event.title}</h3>
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded ml-2">
                          {event.category.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <UserFooter />
    </div>
  );
};

export default ExploreEvents; 