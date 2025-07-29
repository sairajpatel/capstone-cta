import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';
import Video from '../../assets/user_hero.mp4';
import axios from '../../utils/axios';
import { FaChevronDown, FaChevronUp, FaMusic, FaGlassCheers, FaPalette, FaRunning, FaLaptop, FaGraduationCap, FaTheaterMasks, FaHeart, FaStar } from 'react-icons/fa';
import { MdCorporateFare, MdCake, MdEventSeat, MdSportsHandball, MdFoodBank, MdCelebration } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import TextSizeControls from './TextSizeControls';
//animaton
// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const cardHoverVariants = {
  hover: {
    y: -4,
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.99,
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  }
};

const imageVariants = {
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  }
};

const fadeInUp = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const scaleIn = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

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
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="py-12 px-4 relative"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="flex items-center justify-between mb-8"
            variants={fadeInUp}
          >
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-white relative inline-block"
              whileHover={{ scale: 1.02 }}
            >
              {title}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.h2>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {events.map((event) => {
              if (!event) return null;
              const { month, day } = getMonthAndDate(event.startDate);
              const isToggling = togglingEventId === event._id;
              const isInterested = interestedEvents[event._id];

              return (
                <motion.div 
                  key={event._id}
                  variants={cardHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="bg-[#28264D] rounded-xl overflow-hidden shadow-lg transform-gpu"
                  onClick={() => handleCardClick(event._id)}
                >
                  <div className="relative overflow-hidden group">
                    <motion.img
                      src={getEventImage(event)}
                      alt={event.title}
                      variants={imageVariants}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Image+Available';
                      }}
                    />
                    <motion.div 
                      className="absolute top-4 left-4 bg-white text-black rounded-lg p-2 text-center min-w-[60px] shadow-md backdrop-blur-sm bg-opacity-90"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-sm font-bold text-blue-600">{month}</div>
                      <div className="text-xl font-bold leading-none">{day}</div>
                    </motion.div>
                    <motion.button
                      onClick={(e) => handleInterestClick(e, event._id)}
                      disabled={isToggling}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className={`absolute top-4 right-4 p-3 rounded-full bg-black bg-opacity-50 backdrop-blur-sm hover:bg-opacity-70 transition-all duration-300 ${
                        isToggling ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <FaStar 
                        className={`text-xl transition-colors duration-300 ${
                          isInterested ? 'text-yellow-400' : 'text-gray-400'
                        } ${isToggling ? 'animate-pulse' : ''}`}
                      />
                    </motion.button>
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"
                    />
                  </div>
                  <motion.div 
                    className="p-4 space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                        {event.category.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                      </span>
                      <span className="text-sm text-gray-400">
                        {event.eventType === 'ticketed' && event.ticketing && event.ticketing[0] ? 
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-semibold text-green-400"
                          >
                            ₹{event.ticketing[0].price}
                          </motion.span>
                          : 
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-blue-400"
                          >
                            Free
                          </motion.span>
                        }
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg text-white line-clamp-2 hover:line-clamp-none transition-all duration-300">
                      {event.title}
                    </h3>
                    <div className="flex items-center text-gray-400 text-sm">
                      <motion.div 
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        {event.organizer?.organization || 'Event Organizer'}
                      </motion.div>
                    </div>
                    <motion.div 
                      className="flex items-center justify-between pt-2 border-t border-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.span 
                        className={`flex items-center gap-1 text-sm ${isInterested ? 'text-yellow-400' : 'text-gray-400'}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        <FaStar className={isInterested ? 'text-yellow-400' : 'text-gray-400'} />
                        {isInterested ? 'Interested' : 'Mark Interest'}
                      </motion.span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        View Details →
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>
    );
  };

  return (
    <div className="min-h-screen bg-[#1C1B29]">
      <UserNavbar />
      <TextSizeControls />

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-[60vh] flex items-center justify-center text-center px-4 mt-6"
      >
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          src={Video}
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative z-20 text-white max-w-2xl mx-auto"
        >
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Don't miss out!
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-lg md:text-xl mb-8"
          >
            Explore the vibrant events happening locally and globally.
          </motion.p>
          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            onSubmit={handleSearch} 
            className="w-full max-w-xl mx-auto"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                className="w-full px-6 py-3 rounded-full text-gray-800 text-lg focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                Search
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      </motion.section>

      {/* Categories */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="py-12 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            variants={fadeInUp}
            className="text-2xl font-bold mb-8 text-center text-white"
          >
            Explore Categories
          </motion.h2>
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {visibleCategories.map((cat) => (
              <motion.button
                key={cat.value}
                variants={itemVariants}
                whileHover={{ scale: 1.02, backgroundColor: "#322f5d" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(cat.value)}
                className="flex flex-col items-center justify-center p-4 bg-[#28264D] rounded-xl transition-colors"
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <motion.div 
                  className="text-blue-400 mb-2"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {cat.icon}
                </motion.div>
                <span className="text-white text-sm text-center">{cat.label}</span>
              </motion.button>
            ))}
          </motion.div>
          
          {Array.isArray(categories) && categories.length > 8 && (
            <motion.div 
              variants={fadeInUp}
              className="text-center mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors"
                transition={{ duration: 0.2, ease: "easeOut" }}
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
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center text-red-400 py-4"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-10"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-12 w-12 border-b-2 border-white mx-auto"
            />
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-white"
            >
              Loading events...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <EventSection
            title="Search Results"
            events={searchResults}
            formatDate={formatDate}
            navigate={navigate}
          />
        )}
      </AnimatePresence>

      {/* Popular Events */}
      <AnimatePresence>
        {!loading && popularEvents.length > 0 && (
          <EventSection
            title="Popular Events in Your City"
            events={popularEvents}
            formatDate={formatDate}
            navigate={navigate}
          />
        )}
      </AnimatePresence>

      {/* No Events Message */}
      <AnimatePresence>
        {!loading && !error && popularEvents.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="text-center py-10"
          >
            <p className="text-gray-400">No upcoming events found. Check back later!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <UserFooter />
    </div>
  );
};

export default UserDashboard;