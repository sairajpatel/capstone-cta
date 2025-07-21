import React from 'react';
import { format } from 'date-fns';

const BookingConfirmation = ({ booking, onClose, onViewBookings }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Success Header */}
        <div className="bg-[#2B293D] p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#2B293D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
          <p className="text-gray-300 mt-1">Your tickets have been booked successfully</p>
        </div>

        {/* Booking Details */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{booking.event.title}</h3>
              <p className="text-gray-600">
                {format(new Date(booking.event.date), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ticket Type</span>
                <span className="font-medium">{booking.ticketType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quantity</span>
                <span className="font-medium">{booking.quantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium">${booking.totalAmount}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Ticket Numbers</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                {booking.ticketNumbers.map((number, index) => (
                  <div key={index} className="text-sm text-gray-600 font-mono">
                    {number}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    A confirmation email has been sent to your registered email address.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={onViewBookings}
              className="flex-1 bg-[#2B293D] text-white py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              View My Bookings
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
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