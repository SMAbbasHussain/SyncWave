const User = require('../models/User');
const LoginAttempt = require('../models/LoginAttempt');
const { generateToken } = require('../utils/jwtUtils');
const bcrypt = require('bcryptjs');

const signup = async (req, res) => {
  const { username, email, password,phoneNo } = req.body;
  try {
    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Create new user
    const user = new User({ username, email, password,phoneNo });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    if (!user.password) {
      throw new Error('This account is linked to Google. Use Google login.');
    }

    // Get login attempt record or create a new one
    let attempt = await LoginAttempt.findOne({ email });
    if (!attempt) {
      attempt = new LoginAttempt({ email: user.email, failedAttempts: 0, lockUntil: null });
    }


    // Check if user is locked
    if (attempt.lockUntil && attempt.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((attempt.lockUntil - Date.now()) / (60 * 1000)); // in minutes
      return res.status(403).json({ error: `Too many failed attempts. Try again in ${remainingTime} minutes.` });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      attempt.failedAttempts += 1;

      if (attempt.failedAttempts >= 3) {
        attempt.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }

      await attempt.save();
      throw new Error('Invalid credentials');
    }

    // Reset failed attempts on successful login
    attempt.failedAttempts = 0;
    attempt.lockUntil = null;
    await attempt.save();

    const token = generateToken(user._id);
    res.json({ token });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Google OAuth Login
const googleAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Google authentication failed' });
    }

    const token = generateToken(req.user._id);
    res.redirect(`/dashboard?token=${token}`); // Redirect with token
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { signup, login, googleAuth };
