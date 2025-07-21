const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  ticketType: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  ticketNumbers: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate unique ticket numbers
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const ticketNumbers = [];
    const timestamp = Date.now();
    const eventId = this.event.toString().slice(-6); // Get last 6 characters of event ID
    
    for (let i = 0; i < this.quantity; i++) {
      // Generate a unique ticket number: EVENT-TIMESTAMP-SEQUENTIAL
      const ticketNumber = `${eventId}-${timestamp}-${(i + 1).toString().padStart(3, '0')}`;
      ticketNumbers.push(ticketNumber);
    }
    this.ticketNumbers = ticketNumbers;
  }
  next();
});

// Add index for faster queries
bookingSchema.index({ user: 1, event: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 