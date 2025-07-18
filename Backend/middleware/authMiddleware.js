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

            // Check if user is admin or organizer based on role in token
            if (decoded.role === 'admin') {
                req.admin = await Admin.findById(decoded.id);
                if (!req.admin) {
                    return res.status(401).json({
                        success: false,
                        message: 'Not authorized to access this route'
                    });
                }
            } else if (decoded.role === 'organizer') {
                req.organizer = await Organizer.findById(decoded.id);
                if (!req.organizer) {
                    return res.status(401).json({
                        success: false,
                        message: 'Not authorized to access this route'
                    });
                }
            }

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
        let userRole;
        
        // Check if user is admin or organizer
        if (req.admin) {
            userRole = 'admin';
        } else if (req.organizer) {
            userRole = 'organizer';
        }

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        next();
    };
}; 