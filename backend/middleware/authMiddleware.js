// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authMiddleware = {
    authenticate: async (req, res, next) => {
        try {
            // Get token from header or query param
            const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
            
            if (!token) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Optional: Fetch user from database to ensure they still exist
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            req.userId = decoded.userId;
            req.user = user; // Add user object to request
            next();
        } catch (error) {
            console.error('Authentication error:', error);
            res.status(401).json({ error: 'Invalid or expired token' });
        }
    },

    // Optional: Admin check middleware
    isAdmin: (req, res, next) => {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    },

    // Alternative export names for flexibility
    authenticateToken: async (req, res, next) => {
        return authMiddleware.authenticate(req, res, next);
    }
};

// Export both individual functions and the full object
module.exports = authMiddleware.authenticate; // Default export for backward compatibility
module.exports.authMiddleware = authMiddleware; // Named export for full object
module.exports.authenticateToken = authMiddleware.authenticate; // Named export for consistency