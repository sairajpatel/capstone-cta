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
    fetchTicketDetails();
  }, [bookingId, ticketNumber]);

  const fetchTicketDetails = async () => {
    try {
      const response = await axios.get(`/bookings/verify/${bookingId}/${ticketNumber}`);
      if (response.data.success) {
        setTicketData(response.data.data);
      } else {
        setError('Invalid ticket');
      }
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      setError('Failed to verify ticket');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date not available';

      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Date not available';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B293D]"></div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Ticket</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Ticket Status Banner */}
          <div className="bg-green-600 p-4 text-white text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Valid Ticket</h2>
          </div>

          {/* Event Details */}
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticketData.event.title}</h1>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(ticketData.event.startDate)}
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {ticketData.event.startTime} {ticketData.event.endTime && `- ${ticketData.event.endTime}`}
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {ticketData.event.location}
                </p>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ticket Type</p>
                  <p className="font-medium text-gray-900">{ticketData.ticketType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ticket Number</p>
                  <p className="font-medium text-gray-900">{ticketNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium text-green-600">Valid</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="font-medium text-gray-900">{bookingId}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="text-sm text-gray-500">
              <p>This ticket is non-transferable and should be presented at the event entrance.</p>
              <p className="mt-2">Powered by GatherGuru</p>
            </div>
          </div>
        </div>
      </div>
      <UserFooter />
    </div>
  );
};

export default TicketVerification; 