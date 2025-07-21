import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminNavbar from './Navbar/AdminNavbar';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, role, newStatus) => {
    try {
      const response = await axios.put(`/admin/users/${userId}/status?role=${role}`, {
        status: newStatus
      });

      if (response.data.success) {
        toast.success('User status updated successfully');
        fetchUsers(); // Refresh the user list
      } else {
        throw new Error(response.data.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter((user) => {
    return (
      (roleFilter === 'All' || user.role === roleFilter) &&
      (statusFilter === 'All' || user.status.toLowerCase() === statusFilter.toLowerCase())
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Users</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Add New User
            </button>
          </div>

          <div className="flex space-x-4 mb-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="All">Role</option>
              <option value="Organizer">Organizer</option>
              <option value="User">User</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="All">Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Login</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3 text-indigo-600">{user.role}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-white text-xs ${
                          user.status.toLowerCase() === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3">{formatDate(user.lastLogin)}</td>
                    <td className="p-3 space-x-2 text-sm text-indigo-600">
                      <button 
                        onClick={() => {}} 
                        className="hover:underline"
                      >
                        View profile
                      </button>
                      <button 
                        onClick={() => {}} 
                        className="hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(
                          user._id,
                          user.role,
                          user.status.toLowerCase() === 'active' ? 'inactive' : 'active'
                        )}
                        className="hover:underline"
                      >
                        {user.status.toLowerCase() === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
