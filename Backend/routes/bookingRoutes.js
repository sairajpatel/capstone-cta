const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking
} = require('../controllers/bookingController');

// All routes require authentication
router.use(protect);

// Restrict to users only
router.use(restrictTo('user'));

// Create a new booking
router.post('/', createBooking);

// Get user's bookings
router.get('/my-bookings', getUserBookings);

// Get single booking details
router.get('/:bookingId', getBookingDetails);

// Cancel booking
router.put('/:bookingId/cancel', cancelBooking);

module.exports = router; 