const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const Organizer = require('../models/organizerModel');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in cookies
        if (req.cookies.token) {
            token = req.cookies.token;
        }
        // Check for token in Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Please login to access this resource'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Log the decoded token for debugging
            console.log('Decoded token:', decoded);

            if (decoded.role === 'organizer') {
                req.organizer = await Organizer.findById(decoded.id);
                if (!req.organizer) {
                    return res.status(401).json({
                        success: false,
                        message: 'Organizer not found'
                    });
                }
            } else if (decoded.role === 'user') {
                req.user = await User.findById(decoded.id);
                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        message: 'User not found'
                    });
                }
            } else if (decoded.role === 'admin') {
                req.admin = await Admin.findById(decoded.id);
                if (!req.admin) {
                    return res.status(401).json({
                        success: false,
                        message: 'Admin not found'
                    });
                }
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid role'
                });
            }

            // Add token to request for future use
            req.token = token;
            next();
        } catch (err) {
            console.error('Token verification error:', err);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error in auth middleware'
        });
    }
}; 