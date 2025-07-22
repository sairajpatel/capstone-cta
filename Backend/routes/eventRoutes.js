const express = require('express');
const router = express.Router();
const { protect: organizerProtect } = require('../middleware/authMiddleware');
const { protect: adminProtect } = require('../middleware/adminAuthMiddleware');
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
    updateEventAdmin
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
router.use('/admin', adminProtect); // Protect all admin routes
router.get('/admin/upcoming', getAdminUpcomingEvents);
router.get('/admin/past', getAdminPastEvents);
router.patch('/admin/:eventId', updateEventAdmin);

// Test route (temporary)
router.post('/test/create', createTestEvent);

// Protected routes for organizers
router.use(organizerProtect);
router.post('/', createEventBasic);
router.patch('/:eventId/banner', updateEventBanner);
router.patch('/:eventId/ticketing', updateEventTicketing);
router.patch('/:eventId/publish', publishEvent);
router.get('/organizer/events', getOrganizerEvents);

module.exports = router; 