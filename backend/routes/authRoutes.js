const express = require('express');
const { signup, login } = require('../controllers/authController');
const passport = require('passport');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('http://localhost:3000/home');
});


// Logout Route
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;