const Booking = require('../models/bookingModel');
const Event = require('../models/eventModel');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { eventId, ticketType, quantity } = req.body;
    const userId = req.user._id; // Get user ID from authenticated request

    // Validate required fields
    if (!eventId || !ticketType || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find the ticket type and calculate total amount
    const selectedTicket = event.ticketing.find(ticket => ticket.name === ticketType);
    if (!selectedTicket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket type not found'
      });
    }

    // Check if enough tickets are available
    if (selectedTicket.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough tickets available'
      });
    }

    // Calculate total amount
    const totalAmount = selectedTicket.price * quantity;

    // Create the booking
    const booking = await Booking.create({
      user: userId,
      event: eventId,
      ticketType,
      quantity,
      totalAmount
    });

    // Update ticket quantity
    selectedTicket.quantity -= quantity;
    await event.save();

    // Populate event and user details
    await booking.populate([
      { path: 'event', select: 'title date location bannerImage' },
      { path: 'user', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId })
      .populate('event', 'title date location bannerImage')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// Get single booking details
exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('event', 'title date location bannerImage')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if the user is authorized to view this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking details',
      error: error.message
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if the user is authorized to cancel this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Return tickets to event quantity
    const event = await Event.findById(booking.event);
    if (event) {
      const ticketType = event.ticketing.find(t => t.name === booking.ticketType);
      if (ticketType) {
        ticketType.quantity += booking.quantity;
        await event.save();
      }
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
}; 