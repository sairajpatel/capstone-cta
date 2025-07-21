const express = require('express');
const router = express.Router();
const { protect: organizerProtect } = require('../middleware/authMiddleware');
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
    getAdminPastEvents,
    editEvent,
    getEventForEditing
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
router.get('/admin/upcoming', getAdminUpcomingEvents);
router.get('/admin/past', getAdminPastEvents);

// Test route (temporary)
router.post('/test/create', createTestEvent);

// Protected routes for organizers
router.use(organizerProtect); // Apply organizer protection to all routes below
router.post('/', createEventBasic);
router.patch('/:eventId/banner', updateEventBanner);
router.patch('/:eventId/ticketing', updateEventTicketing);
router.patch('/:eventId/publish', publishEvent);
router.get('/organizer/events', getOrganizerEvents);

// New edit routes
router.get('/edit/:eventId', getEventForEditing);
router.put('/:eventId', editEvent);

module.exports = router; 