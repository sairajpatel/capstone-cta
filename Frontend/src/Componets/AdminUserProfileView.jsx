import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminNavbar from './Navbar/AdminNavbar';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

const AdminUserProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/admin/users/${userId}`);
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.patch(`/admin/users/${userId}/status`, {
        status: newStatus,
        userType: user.userType
      });

      if (response.data.success) {
        toast.success(`User ${newStatus === 'Active' ? 'activated' : 'suspended'} successfully`);
        setUser(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await axios.delete(`/admin/users/${userId}`, {
        data: { userType: user.userType }
      });
      if (response.data.success) {
        toast.success('User deleted successfully');
        navigate('/admin/users');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

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

  if (!user) {
    return (
      <>
        <AdminNavbar />
        <div className="min-h-screen bg-gray-100 p-6">
          <div className="text-center text-gray-600">User not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-indigo-600">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-white">User Profile</h1>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50"
                >
                  Back to Users
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Name</label>
                      <p className="text-gray-800">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="text-gray-800">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Role</label>
                      <p className="text-indigo-600 font-medium">{user.role}</p>
                    </div>
                    {user.organization && (
                      <div>
                        <label className="text-sm text-gray-500">Organization</label>
                        <p className="text-gray-800">{user.organization}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Account Status</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Status</label>
                      <p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            user.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Last Login</label>
                      <p className="text-gray-800">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 pt-6 border-t">
                <h2 className="text-lg font-semibold mb-4">Actions</h2>
                <div className="space-x-4">
                  <button
                    onClick={() => handleStatusChange(user.status === 'Active' ? 'Inactive' : 'Active')}
                    className={`px-4 py-2 rounded-lg ${
                      user.status === 'Active'
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                  </button>
                  {user.status === 'Inactive' && (
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Delete User
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUserProfileView; 