import axios from './axios';

// Fetch dashboard statistics
export const fetchDashboardStats = async () => {
    try {
        const response = await axios.get('/admin/dashboard/stats');
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch dashboard stats');
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

// Fetch user statistics
export const fetchUserStats = async () => {
    try {
        const response = await axios.get('/admin/users/stats');
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch user stats');
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching user stats:', error);
        throw error;
    }
};

// Fetch revenue statistics
export const fetchRevenueStats = async () => {
    try {
        const response = await axios.get('/admin/revenue/stats');
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch revenue stats');
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        throw error;
    }
};

// Fetch upcoming events
export const fetchUpcomingEvents = async () => {
    try {
        const response = await axios.get('/events/admin/upcoming');
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch upcoming events');
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        throw error;
    }
}; 