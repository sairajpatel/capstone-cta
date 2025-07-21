import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../utils/axios';
import UserNavbar from './UserNavbar';
import UserFooter from './UserFooter';

const TicketVerification = () => {
  const { bookingId, ticketNumber } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const response = await axios.get(`/bookings/${bookingId}`);
        if (response.data.success) {
          setTicket(response.data.data);
        } else {
          setError('Failed to fetch ticket details');
        }
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Error fetching ticket details');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [bookingId]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'TBA';
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'TBA';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B293D]"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            {error || 'Ticket not found'}
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  const isValidTicket = ticket.ticketNumbers.includes(ticketNumber);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Ticket Status Banner */}
            <div className={`p-4 ${isValidTicket ? 'bg-green-500' : 'bg-red-500'} text-white text-center`}>
              <h2 className="text-xl font-bold">
                {isValidTicket ? 'Valid Ticket' : 'Invalid Ticket'}
              </h2>
            </div>

            {/* Event Banner */}
            {ticket.event.bannerImage && (
              <div className="w-full h-64 overflow-hidden">
                <img
                  src={ticket.event.bannerImage}
                  alt={ticket.event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x400?text=No+Banner+Image';
                  }}
                />
              </div>
            )}

            {/* Event Details */}
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{ticket.event.title}</h1>
              
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{formatDate(ticket.event.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">{ticket.event.startTime || 'TBA'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{ticket.event.location}</p>
                    </div>
                  </div>
                </div>

                {/* Ticket Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ticket Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Ticket Type</p>
                      <p className="font-medium">{ticket.ticketType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Ticket Number</p>
                      <p className="font-medium">{ticketNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className={`font-medium ${ticket.status === 'confirmed' ? 'text-green-600' : 'text-red-600'}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className={`mt-6 p-4 rounded-lg ${isValidTicket ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center">
                    <div className={`rounded-full p-2 ${isValidTicket ? 'bg-green-100' : 'bg-red-100'}`}>
                      {isValidTicket ? (
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className={`font-semibold ${isValidTicket ? 'text-green-800' : 'text-red-800'}`}>
                        {isValidTicket ? 'Ticket Verified' : 'Invalid Ticket'}
                      </h3>
                      <p className={`text-sm ${isValidTicket ? 'text-green-600' : 'text-red-600'}`}>
                        {isValidTicket 
                          ? 'This ticket is valid and can be used for entry.' 
                          : 'This ticket is not valid or has already been used.'}
                      </p>
                    </div>
                  </div>
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