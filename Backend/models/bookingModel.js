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
  timestamps: true
});

// Generate unique ticket numbers
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const ticketNumbers = [];
    for (let i = 0; i < this.quantity; i++) {
      // Generate a unique ticket number: EVENT-TIMESTAMP-SEQUENTIAL
      const ticketNumber = `${this.event}-${Date.now()}-${i + 1}`;
      ticketNumbers.push(ticketNumber);
    }
    this.ticketNumbers = ticketNumbers;
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking; 