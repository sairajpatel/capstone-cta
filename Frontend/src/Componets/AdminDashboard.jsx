import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer
} from 'recharts';
import AdminNavbar from './Navbar/AdminNavbar';
import { fetchDashboardStats, fetchUserStats, fetchRevenueStats, fetchUpcomingEvents } from '../utils/adminApi';
import { Link } from 'react-router-dom';

const formatEventDateTime = (date, time) => {
  const eventDate = new Date(date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  return `${formattedDate} at ${time}`;
};

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    kpiStats: [],
    revenueData: [],
    upcomingEvents: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [stats, userStats, revenueStats, upcoming] = await Promise.all([
          fetchDashboardStats(),
          fetchUserStats(),
          fetchRevenueStats(),
          fetchUpcomingEvents()
        ]);

        // Format KPI stats
        const kpiStats = [
          { label: 'Total Events', value: stats.events.total },
          { label: 'Active Users', value: userStats.active },
          { label: 'Revenue', value: `$${revenueStats.total.toLocaleString()}` },
          { label: 'Tickets Sold', value: stats.events.ticketsSold }
        ];

        setDashboardData({
          kpiStats,
          revenueData: revenueStats.monthly,
          upcomingEvents: upcoming.data || []
        });
      } catch (err) {
        setError(err.message);
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData.kpiStats.map((kpi, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-sm font-medium text-gray-500">{kpi.label}</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-lg font-semibold mb-4">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2B293D" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <Link to="/admin/events" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Events →
            </Link>
          </div>
          {dashboardData.upcomingEvents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-sm uppercase tracking-wider">
                    <th className="py-3 px-4">Image</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dashboardData.upcomingEvents.map((event, idx) => (
                    <tr key={event._id || idx} className="hover:bg-gray-50">
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
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-3 ${
                            ['bg-green-500', 'bg-yellow-500', 'bg-blue-500'][idx % 3]
                          }`}></span>
                          <div>
                            <div className="font-medium text-gray-900">{event.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        {formatEventDateTime(event.startDate, event.startTime)}
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        📍 {event.location}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No upcoming events</p>
          )}
        </div>
      </div>
    </>
  );
}
