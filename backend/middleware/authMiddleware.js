// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = {
    authenticate: (req, res, next) => {
        try {
            // Get token from header or query param
            const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
            
            if (!token) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
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
    }
};

module.exports = authMiddleware.authenticate; // Export just the authenticate middleware