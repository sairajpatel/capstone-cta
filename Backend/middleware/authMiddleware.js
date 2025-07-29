const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const Organizer = require('../models/organizerModel');
const User = require('../models/userModel');

// Protect routes
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Get token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Or from cookies
        else if (req.cookies.token) {
            token = req.cookies.token;
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check user role and set appropriate user object
            if (decoded.role === 'admin') {
                req.user = await Admin.findById(decoded.id);
            } else if (decoded.role === 'organizer') {
                req.user = await Organizer.findById(decoded.id);
            } else if (decoded.role === 'user') {
                req.user = await User.findById(decoded.id);
            }

            // Check if user exists
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found or not authorized'
                });
            }

            // Check user status for non-admin users
            if (decoded.role === 'user' && req.user.status !== 'active') {
                let statusMessage = 'Your account has been deactivated.';
                if (req.user.status === 'blocked') {
                    statusMessage = 'Your account has been blocked. Please contact support.';
                } else if (req.user.status === 'inactive') {
                    statusMessage = 'Your account is currently inactive. Please contact support to reactivate.';
                }
                
                return res.status(403).json({
                    success: false,
                    message: statusMessage,
                    status: req.user.status
                });
            }

            // Add role to request object
            req.userRole = decoded.role;
            next();
        } catch (err) {
            console.error('Token verification error:', err);
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        console.error('Middleware error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Restrict to certain roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        next();
    };
}; 