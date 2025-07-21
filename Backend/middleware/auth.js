const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const Organizer = require('../models/organizerModel');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Please login to access this resource'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);

            if (decoded.role === 'admin') {
                const admin = await Admin.findById(decoded.id);
                if (!admin) {
                    return res.status(401).json({
                        success: false,
                        message: 'Admin not found'
                    });
                }
                req.admin = admin;
                req.userRole = 'admin';
            } else if (decoded.role === 'organizer') {
                const organizer = await Organizer.findById(decoded.id);
                if (!organizer) {
                    return res.status(401).json({
                        success: false,
                        message: 'Organizer not found'
                    });
                }
                req.organizer = organizer;
                req.userRole = 'organizer';
            } else if (decoded.role === 'user') {
                const user = await User.findById(decoded.id);
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: 'User not found'
                    });
                }
                req.user = user;
                req.userRole = 'user';
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid role'
                });
            }

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