import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminNavbar from './Navbar/AdminNavbar';
import axios from '../utils/axios';
import { FaMapMarkerAlt } from 'react-icons/fa';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    kpiStats: [],
    revenueData: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [eventsResponse, statsResponse, revenueResponse] = await Promise.all([
        axios.get('/events/upcoming'),
        axios.get('/admin/dashboard/stats'),
        axios.get('/admin/revenue/stats')
      ]);

      if (eventsResponse.data.success) {
        setUpcomingEvents(eventsResponse.data.data);
      }

      if (statsResponse.data.success && revenueResponse.data.success) {
        const stats = statsResponse.data.data;
        const kpiStats = [
          { label: 'Total Events', value: stats.events.total },
          { label: 'Active Users', value: stats.users.total },
          { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}` },
          { label: 'Tickets Sold', value: stats.events.ticketsSold }
        ];

        setDashboardStats({
          kpiStats,
          revenueData: revenueResponse.data.data.monthly
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <AdminNavbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.kpiStats.map((kpi, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">{kpi.label}</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue Over Time</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardStats.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2B293D" 
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
            <Link to="/admin/events" className="text-blue-600 hover:text-blue-700">
              View All Events →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm uppercase tracking-wider">
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upcomingEvents.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <img
                          src={event.bannerImage}
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
                    <td className="py-4 px-4 text-gray-500">
                      {formatDate(event.startDate)}
                      <div className="text-sm text-gray-400">{event.startTime}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-gray-500">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        {event.location}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        to={`/admin/events/edit/${event._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
                {upcomingEvents.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-500">
                      No upcoming events found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
