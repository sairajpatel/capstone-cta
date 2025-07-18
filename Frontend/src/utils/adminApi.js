import axios from './axios';

export const fetchDashboardStats = async () => {
  try {
    const response = await axios.get('/admin/dashboard/stats');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUserStats = async () => {
  try {
    const response = await axios.get('/admin/users/stats');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const fetchRevenueStats = async () => {
  try {
    const response = await axios.get('/admin/revenue/stats');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUpcomingEvents = async () => {
  try {
    const response = await axios.get('/events/upcoming');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 