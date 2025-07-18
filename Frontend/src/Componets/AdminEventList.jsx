import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './Navbar/AdminNavbar';
import axios from '../utils/axios';

const AdminEventList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/events/admin/${activeTab}`);
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-[#E8F5E9] text-[#2E7D32]';
      case 'scheduled':
        return 'bg-[#FFF3E0] text-[#EF6C00]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateEvent = () => {
    navigate('/admin/events/create');
  };

  const handleEditEvent = (eventId) => {
    navigate(`/admin/events/edit/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-800">Events</h1>
              <button
                onClick={handleCreateEvent}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Event
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="px-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`py-4 px-1 border-b-2 font-medium ${
                    activeTab === 'upcoming'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`py-4 px-1 border-b-2 font-medium ${
                    activeTab === 'past'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Past
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm uppercase tracking-wider">
                      <th className="py-3 px-4">Image</th>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {events.map((event) => (
                      <tr key={event._id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden">
                            <img
                              src={`http://localhost:5000/${event.bannerImage}`}
                              alt={event.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-gray-900">{event.title}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(event.status)}`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-500">
                          {formatDate(event.startDate)}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleEditEvent(event._id)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {events.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    No events found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEventList; 