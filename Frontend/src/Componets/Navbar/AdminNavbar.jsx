import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/features/authSlice';
import logo from './assets/gatherguru_logo.svg';
import axios from '../../utils/axios';

export default function AdminNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const dropdownRef = useRef();

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const response = await axios.get('/admin/profile');
      if (response.data.success) {
        setAdminProfile(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin-login');
  };

  return (
    <header className="bg-[#2B293D] text-white px-6 py-3 flex justify-between items-center shadow">
      {/* Logo + Title */}
      <Link to="/admin/dashboard" className="flex items-center space-x-2">
        <img src={logo} alt="GatherGuru Logo" className="h-full w-[50%]" />
      </Link>

      {/* Nav Links */}
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link to="/admin/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/admin/events" className="hover:underline">Events</Link>
        <Link to="/admin/users" className="hover:underline">Users</Link>
        <Link to="/admin/tickets" className="hover:underline">Tickets</Link>

        {/* Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {adminProfile?.profileImage ? (
              <img
                src={adminProfile.profileImage}
                alt="Admin Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIj48L3BhdGg+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ij48L2NpcmNsZT48L3N2Zz4=';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                <span className="text-lg font-semibold text-white">
                  {adminProfile?.name?.charAt(0) || 'A'}
                </span>
              </div>
            )}
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded shadow-lg z-50">
              <div className="flex items-center px-4 py-3 border-b">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  {adminProfile?.profileImage ? (
                    <img
                      src={adminProfile.profileImage}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIj48L3BhdGg+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ij48L2NpcmNsZT48L3N2Zz4=';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      <span className="text-lg font-semibold text-white">
                        {adminProfile?.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">{adminProfile?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{adminProfile?.email}</p>
                </div>
              </div>

              <Link
                to="/admin/profile"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
