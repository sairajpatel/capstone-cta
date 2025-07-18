import React, { useState } from "react";
import { FaBars, FaTimes, FaTicketAlt, FaStar } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import gatherguru_logo from "../../assets/gatherguru_logo.svg";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/features/authSlice";

const UserNavbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get user data from Redux store
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="bg-[#2B293D] text-white shadow-md relative z-50">
      <div className="flex justify-between items-center p-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={gatherguru_logo} alt="logo" className="w-[80%] h-full" />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 text-sm">
          <Link to="/user/dashboard" className="hover:text-yellow-400 text-xl">Home</Link>
          <Link to="/events" className="hover:text-yellow-400 text-xl">Events</Link>
          <Link to="/about" className="hover:text-yellow-400 text-xl">About</Link>
          <Link to="/contact" className="hover:text-yellow-400 text-xl">Contact</Link>
         
          <Link to="#" className="flex items-center gap-1 hover:text-yellow-400 text-xl">
            <FaTicketAlt /> Tickets
          </Link>
          <Link to="#" className="flex items-center gap-1 hover:text-yellow-400 text-xl">
            <FaStar /> Interested
          </Link>
          
          {/* Profile Dropdown */}
          <div className="relative text-xl">
            <button
              className="flex items-center gap-2 hover:text-yellow-400 focus:outline-none"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage}
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#28264D] flex items-center justify-center text-white uppercase">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                )}
              </div>
              <span className="hidden lg:inline">{user?.name || 'User'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Link 
                  to="/user/profile" 
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  View Profile
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }} 
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-2 text-sm">
          <div className="flex items-center space-x-3 px-2 py-3 border-b border-gray-700">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage}
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#28264D] flex items-center justify-center text-white uppercase">
                  {user?.name ? user.name[0] : 'U'}
                </div>
              )}
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <Link to="/user/dashboard" className="block px-2 py-1 hover:text-yellow-400">Home</Link>
          <Link to="/events" className="block px-2 py-1 hover:text-yellow-400">Events</Link>
          <Link to="/about" className="block px-2 py-1 hover:text-yellow-400">About</Link>
          <Link to="/contact" className="block px-2 py-1 hover:text-yellow-400">Contact</Link>
          <Link to="#" className="block px-2 py-1 hover:text-yellow-400">Tickets</Link>
          <Link to="#" className="block px-2 py-1 hover:text-yellow-400">Interested</Link>
          <Link to="/user/profile" className="block px-2 py-1 hover:text-yellow-400">View Profile</Link>
          <button onClick={handleLogout} className="block w-full text-left px-2 py-1 hover:text-yellow-400 text-red-400">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default UserNavbar;
