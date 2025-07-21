import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateTicketQRData } from '../../utils/qrCodeUtils';

const BookingConfirmation = ({ booking, onClose, onViewBookings }) => {
  const formatEventDate = (event) => {
    if (!event || !event.startDate) return 'Date not available';
    try {
      const date = new Date(event.startDate);
      if (isNaN(date.getTime())) return 'Date not available';

      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      const formattedDate = date.toLocaleDateString('en-US', options);
      const timeString = event.startTime ? 
        (event.endTime ? `${event.startTime} - ${event.endTime}` : event.startTime) 
        : '';

      return timeString ? `${formattedDate} at ${timeString}` : formattedDate;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date not available';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600">Thank you for your booking.</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Event Details */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">{booking.event.title}</h3>
            <p className="text-gray-600 mt-1">{formatEventDate(booking.event)}</p>
            <p className="text-gray-600">{booking.event.location}</p>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Ticket Type</p>
                <p className="font-medium">{booking.ticketType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="font-medium">{booking.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium">${booking.totalAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Booking ID</p>
                <p className="font-medium">{booking._id}</p>
              </div>
            </div>
          </div>

          {/* Tickets Grid */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Your Tickets</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {booking.ticketNumbers.map((ticketNumber, index) => (
                <div key={index} className="flex flex-col h-full">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 flex-1 flex flex-col items-center">
                    <div className="bg-white p-2 rounded-lg shadow-sm mb-3">
                      <QRCodeSVG
                        value={generateTicketQRData(booking, ticketNumber)}
                        size={120}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <div className="text-center mt-auto">
                      <p className="text-sm font-medium text-gray-900">Ticket #{index + 1}</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">{ticketNumber}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onViewBookings}
              className="flex-1 bg-[#2B293D] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              View My Bookings
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation; 