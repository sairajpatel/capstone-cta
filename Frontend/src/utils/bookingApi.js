import axios from './axios';

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post('/api/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user's bookings
export const getUserBookings = async () => {
  try {
    const response = await axios.get('/api/bookings/my-bookings');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get booking details
export const getBookingDetails = async (bookingId) => {
  try {
    const response = await axios.get(`/api/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
  try {
    const response = await axios.put(`/api/bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 