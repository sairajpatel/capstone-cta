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
    getRevenueStats
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

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

module.exports = router; 