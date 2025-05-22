const express = require('express');
const { signup, login, logout } = require('../controllers/authController');
const passport = require('passport');
const { generateToken } = require('../utils/jwtUtils');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);

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
  async (req, res) => {
    try {
      const token = generateToken(req.user._id);
      
      // Check if user was just created (within last 5 minutes)
      const isNewUser = req.user.createdAt > new Date(Date.now() - 5 * 60 * 1000);
      // In authRoutes.js
      res.redirect(`http://localhost:3000/auth-success?token=${token}&isNewUser=${isNewUser}`);
    } catch (error) {
      console.error(error);
      res.redirect('/login?error=google_auth_failed');
    }
  }
);

module.exports = router;