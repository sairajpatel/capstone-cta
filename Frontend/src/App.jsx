import { Routes, Route } from 'react-router-dom';
import React from "react";
import { Toaster } from 'react-hot-toast';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './Componets/AdminDashboard';
import AdminEventList from './Componets/AdminEventList';
import AdminUserList from './Componets/AdminUserList';
import AdminProfile from './Componets/AdminProfile';
import AdminProtectWrapper from './Componets/ProtectionWrapper/AdminProtectWrapper';
import OrganizerProtectWrapper from './Componets/ProtectionWrapper/OrganizerProtectWrapper';
import UserProtection from './Componets/User/ProtectionWrapper/UserProtection';
import OrganizerDashboard from './Componets/Organizer/OrganizerDashboard';
import OrganizerLogin from './Componets/Organizer/OrganizerLogin';
import OrganizerSignup from './Componets/Organizer/OrganizerSignup';
import UserDashboard from './Componets/User/UserDashboard';
import UserLogin from './Componets/User/UserLogin';
import UserSignup from './Componets/User/UserSignup';
import UserProfile from './Componets/User/UserProfile';
import UserBookings from './Componets/User/UserBookings';
import ExploreEvents from './Componets/User/ExploreEvents';
import EventDetails from './Componets/User/EventDetails';
import AboutUs from './Componets/User/AboutUs';
import ContactUs from './Componets/User/ContactUs';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminProtectWrapper><AdminDashboard /></AdminProtectWrapper>} />
        <Route path="/admin/events" element={<AdminProtectWrapper><AdminEventList /></AdminProtectWrapper>} />
        <Route path="/admin/users" element={<AdminProtectWrapper><AdminUserList /></AdminProtectWrapper>} />
        <Route path="/admin/profile" element={<AdminProtectWrapper><AdminProfile /></AdminProtectWrapper>} />

        {/* Organizer Routes */}
        <Route path="/organizer/login" element={<OrganizerLogin />} />
        <Route path="/organizer/signup" element={<OrganizerSignup />} />
        <Route path="/organizer/dashboard" element={<OrganizerProtectWrapper><OrganizerDashboard /></OrganizerProtectWrapper>} />

        {/* User Routes */}
        <Route path="/" element={<UserDashboard />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/user/profile" element={<UserProtection><UserProfile /></UserProtection>} />
        <Route path="/user/bookings" element={<UserProtection><UserBookings /></UserProtection>} />
        <Route path="/events" element={<ExploreEvents />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Default Route */}
        <Route path="*" element={<UserLogin />} />
      </Routes>
    </>
  );
}

export default App;
