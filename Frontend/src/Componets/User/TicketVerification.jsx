import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../utils/axios';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';

const TicketVerification = () => {
  const { bookingId, ticketNumber } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const response = await axios.get(`/bookings/${bookingId}`);
        if (response.data.success) {
          setTicketData(response.data.data);
        } else {
          setError('Invalid ticket');
        }
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Error verifying ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B293D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-700 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Ticket Verification Failed</h2>
            <p>{error}</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!ticketData) return null;

  const isValidTicket = ticketData.ticketNumbers.includes(ticketNumber);
  const ticketIndex = ticketData.ticketNumbers.indexOf(ticketNumber) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Ticket Status Banner */}
          <div className={`rounded-t-lg p-4 text-center text-white ${isValidTicket ? 'bg-green-600' : 'bg-red-600'}`}>
            <h2 className="text-2xl font-bold">
              {isValidTicket ? 'Valid Ticket' : 'Invalid Ticket'}
            </h2>
            <p className="mt-1 text-sm opacity-90">
              {isValidTicket ? 'This ticket is authentic and valid for entry' : 'This ticket is not valid'}
            </p>
          </div>

          {/* Ticket Details */}
          <div className="bg-white rounded-b-lg shadow-lg p-6">
            {/* Event Details */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900">{ticketData.event.title}</h3>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>{new Date(ticketData.event.startDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{ticketData.event.startTime || 'Time not specified'}</p>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>{ticketData.event.location}</p>
                </div>
              </div>
            </div>

            {/* Ticket Information */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ticket Type</p>
                  <p className="font-medium text-gray-900">{ticketData.ticketType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ticket Number</p>
                  <p className="font-medium text-gray-900">#{ticketIndex} of {ticketData.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-medium ${ticketData.status === 'confirmed' ? 'text-green-600' : 'text-red-600'}`}>
                    {ticketData.status.charAt(0).toUpperCase() + ticketData.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking Reference</p>
                  <p className="font-medium text-gray-900">{ticketNumber}</p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-8 bg-blue-50 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Security Information</h4>
                  <p className="mt-1 text-sm text-blue-700">
                    This ticket is non-transferable and should be presented along with a valid ID at the venue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UserFooter />
    </div>
  );
};

export default TicketVerification; 