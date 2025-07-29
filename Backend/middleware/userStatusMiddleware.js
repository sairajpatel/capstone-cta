const User = require('../models/userModel');

const checkUserStatus = async (req, res, next) => {
    try {
        // Get user from database to check current status
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user status is active
        if (user.status !== 'active') {
            let statusMessage = 'Your account has been deactivated.';
            if (user.status === 'blocked') {
                statusMessage = 'Your account has been blocked. Please contact support.';
            } else if (user.status === 'inactive') {
                statusMessage = 'Your account is currently inactive. Please contact support to reactivate.';
            }
            
            return res.status(403).json({
                success: false,
                message: statusMessage,
                status: user.status
            });
        }

        // Add user status to request object for use in other middleware/routes
        req.userStatus = user.status;
        next();
    } catch (error) {
        console.error('Error checking user status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking user status'
        });
    }
};

module.exports = { checkUserStatus }; 