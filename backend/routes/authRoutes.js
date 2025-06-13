const express = require('express');
const { signup, login, logout, googleAuth, verifyRecaptcha } = require('../controllers/authController');
const passport = require('passport');
const { generateToken } = require('../utils/jwtUtils');
const authenticateToken = require('../middleware/authMiddleware'); // Updated middleware
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-recaptcha', verifyRecaptcha);

// Protected logout route - requires authentication to identify user
router.get('/logout', authenticateToken, logout);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }),
  googleAuth // Use the updated googleAuth controller
);

module.exports = router;