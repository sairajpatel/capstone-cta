const express = require('express');
const router = express.Router();
const {
    registerAdmin,
    loginAdmin,
    logout,
    getProfile,
    updateProfile,
    uploadProfileImage,
    getDashboardStats,
    getUserStats,
    getRevenueStats,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getUserDetails,
    getTicketStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authMiddleware');

// Auth routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', protect, restrictTo('admin'), logout);

// Profile routes
router.get('/profile', protect, restrictTo('admin'), getProfile);
router.put('/profile', protect, restrictTo('admin'), updateProfile);
router.post('/profile/upload-image', protect, restrictTo('admin'), uploadProfileImage);

// Dashboard routes
router.get('/dashboard/stats', protect, restrictTo('admin'), getDashboardStats);
router.get('/users/stats', protect, restrictTo('admin'), getUserStats);
router.get('/revenue/stats', protect, restrictTo('admin'), getRevenueStats);

// User management routes
router.get('/users', protect, restrictTo('admin'), getAllUsers);
router.get('/users/:userId', protect, restrictTo('admin'), getUserDetails);
router.patch('/users/:userId/status', protect, restrictTo('admin'), updateUserStatus);
router.delete('/users/:userId', protect, restrictTo('admin'), deleteUser);

// Ticket statistics route
router.get('/tickets/stats', protect, restrictTo('admin'), getTicketStats);

module.exports = router; 