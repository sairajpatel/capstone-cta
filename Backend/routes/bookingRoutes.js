const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');

// All routes require authentication
router.use(protect);

// Restrict to users only
router.use(restrictTo('user'));

// Create a new booking
router.post('/', bookingController.createBooking);

// Get user's bookings
router.get('/my-bookings', bookingController.getUserBookings);

// Get single booking details
router.get('/:bookingId', bookingController.getBookingDetails);

// Cancel booking
router.put('/:bookingId/cancel', bookingController.cancelBooking);

module.exports = router; 