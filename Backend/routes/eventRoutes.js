const express = require('express');
const router = express.Router();
const { protect: organizerProtect } = require('../middleware/authMiddleware');
const { protect, restrictTo } = require('../middleware/auth');
const {
    createEventBasic,
    updateEventBanner,
    updateEventTicketing,
    publishEvent,
    getEventDetails,
    getOrganizerEvents,
    getEventCategories,
    getPopularEvents,
    getEventsByCategory,
    searchEvents,
    createTestEvent,
    getAllEvents,
    getUpcomingEvents,
    getAdminUpcomingEvents,
    getAdminPastEvents
} = require('../controllers/eventController');

// Public routes (no authentication required)
router.get('/categories', getEventCategories);
router.get('/popular', getPopularEvents);
router.get('/category/:category', getEventsByCategory);
router.get('/search', searchEvents);
router.get('/all', getAllEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/:eventId', getEventDetails);

// Admin routes
router.get('/admin/upcoming', protect, restrictTo('admin'), getAdminUpcomingEvents);
router.get('/admin/past', protect, restrictTo('admin'), getAdminPastEvents);

// Protected routes for organizers
router.use(organizerProtect);
router.post('/', createEventBasic);
router.patch('/:eventId/banner', updateEventBanner);
router.patch('/:eventId/ticketing', updateEventTicketing);
router.patch('/:eventId/publish', publishEvent);
router.get('/organizer/events', getOrganizerEvents);

module.exports = router; 