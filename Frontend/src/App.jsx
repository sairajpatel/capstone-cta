import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserSignup from './Componets/User/UserSignup';
import UserLogin from './Componets/User/UserLogin';
import UserDashboard from './Componets/User/UserDashboard';
import UserProfile from './Componets/User/UserProfile';
import UserBookings from './Componets/User/UserBookings';
import ExploreEvents from './Componets/User/ExploreEvents';
import EventDetails from './Componets/User/EventDetails';
import BookingForm from './Componets/User/BookingForm';
import AboutUs from './Componets/User/AboutUs';
import ContactUs from './Componets/User/ContactUs';
import OrganizerSignup from './Componets/Organizer/OrganizerSignup';
import OrganizerLogin from './Componets/Organizer/OrganizerLogin';
import OrganizerDashboard from './Componets/Organizer/OrganizerDashboard';
import EventSteps from './Componets/Organizer/CreateEvent/EventSteps';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './Componets/AdminDashboard';
import AdminEventList from './Componets/AdminEventList';
import AdminUserList from './Componets/AdminUserList';
import AdminProfile from './Componets/AdminProfile';
import UserProtection from './Componets/User/ProtectionWrapper/UserProtection';
import OrganizerProtectWrapper from './Componets/ProtectionWrapper/OrganizerProtectWrapper';
import AdminProtectWrapper from './Componets/ProtectionWrapper/AdminProtectWrapper';
import TicketVerification from './Componets/User/TicketVerification';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<ExploreEvents />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/events" element={<ExploreEvents />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/verify-ticket/:bookingId/:ticketNumber" element={<TicketVerification />} />

        {/* User Routes */}
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/login" element={<UserLogin />} />
        <Route element={<UserProtection />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/my-bookings" element={<UserBookings />} />
          <Route path="/book/:eventId" element={<BookingForm />} />
        </Route>

        {/* Organizer Routes */}
        <Route path="/organizer/signup" element={<OrganizerSignup />} />
        <Route path="/organizer/login" element={<OrganizerLogin />} />
        <Route element={<OrganizerProtectWrapper />}>
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/create-event" element={<EventSteps />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminProtectWrapper />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<AdminEventList />} />
          <Route path="/admin/users" element={<AdminUserList />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
