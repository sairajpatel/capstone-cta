const express = require('express');
const router = express.Router();
const {
    registerAdmin,
    loginAdmin,
    logout,
    getAdminProfile,
    updateAdminProfile,
    uploadProfilePhoto,
    getDashboardStats,
    getUserStats,
    getRevenueStats
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// Auth routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', protect, restrictTo('admin'), logout);

// Profile routes
router.get('/profile', protect, restrictTo('admin'), getAdminProfile);
router.put('/profile', protect, restrictTo('admin'), updateAdminProfile);
router.post('/profile/photo', protect, restrictTo('admin'), uploadProfilePhoto);

// Dashboard routes
router.get('/dashboard/stats', protect, restrictTo('admin'), getDashboardStats);
router.get('/users/stats', protect, restrictTo('admin'), getUserStats);
router.get('/revenue/stats', protect, restrictTo('admin'), getRevenueStats);

module.exports = router; 