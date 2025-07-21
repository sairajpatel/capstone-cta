const express = require('express');
const router = express.Router();
const {
    registerAdmin,
    loginAdmin,
    logout,
    getProfile,
    updateProfile,
    getDashboardStats,
    getUserStats,
    getRevenueStats,
    getAllUsers,
    updateUserStatus
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// Auth routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', protect, restrictTo('admin'), logout);

// Profile routes
router.get('/profile', protect, restrictTo('admin'), getProfile);
router.put('/profile', protect, restrictTo('admin'), updateProfile);

// Dashboard routes
router.get('/dashboard/stats', protect, restrictTo('admin'), getDashboardStats);
router.get('/users/stats', protect, restrictTo('admin'), getUserStats);
router.get('/revenue/stats', protect, restrictTo('admin'), getRevenueStats);

// User management routes
router.get('/users', protect, restrictTo('admin'), getAllUsers);
router.put('/users/:userId/status', protect, restrictTo('admin'), updateUserStatus);

module.exports = router; 