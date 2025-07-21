const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking
} = require('../controllers/bookingController');

// Create a new booking
router.post('/', protect, createBooking);

// Get user's bookings
router.get('/my-bookings', protect, getUserBookings);

// Get single booking details
router.get('/:bookingId', protect, getBookingDetails);

// Cancel booking
router.put('/:bookingId/cancel', protect, cancelBooking);

module.exports = router; 