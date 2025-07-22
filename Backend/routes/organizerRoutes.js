const express = require('express');
const router = express.Router();
const {
    registerOrganizer,
    logout,
    getProfile,
    updateProfile,
    loginOrganizer
} = require('../controllers/organizerController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerOrganizer);
router.post('/login', loginOrganizer);
// Protected routes
router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/logout', logout);

module.exports = router; 