import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminNavbar from './Navbar/AdminNavbar';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, userType, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      console.log('Updating status:', { userId, userType, newStatus });
      
      const response = await axios.patch(`/admin/users/${userId}/status`, {
        status: newStatus,
        userType
      });

      if (response.data.success) {
        toast.success(`User ${newStatus === 'Active' ? 'activated' : 'suspended'} successfully`);
        // Update the user in the local state
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, status: newStatus }
            : user
        ));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (userId, userType) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await axios.delete(`/admin/users/${userId}`, {
        data: { userType }
      });
      if (response.data.success) {
        toast.success('User deleted successfully');
        // Remove the user from the local state
        setUsers(users.filter(user => user._id !== userId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter((user) => {
    return (
      (roleFilter === 'All' || user.role === roleFilter) &&
      (statusFilter === 'All' || user.status === statusFilter)
    );
  });

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen bg-gray-100 p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
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
          </div>

          <div className="flex space-x-4 mb-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="All">Role</option>
              <option value="Admin">Admin</option>
              <option value="Organizer">Organizer</option>
              <option value="User">User</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="All">Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
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
                    <td className="p-3">{user.email}</td>
                    <td className="p-3 text-indigo-600">{user.role}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-white text-xs ${
                          user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-3 space-x-2 text-sm">
                      <Link 
                        to={`/admin/users/${user._id}`} 
                        className="text-indigo-600 hover:underline"
                      >
                        View profile
                      </Link>
                      <button 
                        onClick={() => handleStatusChange(user._id, user.userType, user.status)}
                        className={`hover:underline ${
                          user.status === 'Active' ? 'text-orange-600' : 'text-green-600'
                        }`}
                      >
                        {user.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                      {user.status === 'Inactive' && (
                        <button
                          onClick={() => handleDelete(user._id, user.userType)}
                          className="hover:underline text-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
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
