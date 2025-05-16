const express = require('express');
const { signup, login, getProfile } = require('../controllers/authController');
const passport = require('passport');
const { verifyToken } = require('../utils/jwtUtils');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', verifyToken); // Add this new route

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account' // Forces account selection
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }),
  (req, res) => {
    // Successful authentication
    const token = generateToken(req.user._id);
    res.redirect(`http://localhost:3000/auth-success?token=${token}`);
  }
);

// Logout Route
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;