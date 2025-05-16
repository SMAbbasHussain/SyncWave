const User = require('../models/User');
const LoginAttempt = require('../models/LoginAttempt');
const { generateToken } = require('../utils/jwtUtils');
const bcrypt = require('bcryptjs');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

const signup = async (req, res) => {
  const { username, email, password, phoneNo } = req.body;
  
  try {
    // Validate existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email 
          ? 'Email is already registered' 
          : 'Username is already taken'
      });
    }

    // Create new user
    const user = new User({ username, email, password, phoneNo });
    await user.save();

    // Generate token
    const token = generateToken(user._id);
    res.status(201).json({ 
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic
      }
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Handle Google-authenticated users
    if (user.googleId && !user.password) {
      return res.status(400).json({ 
        error: 'This account uses Google login. Please sign in with Google.' 
      });
    }

    // Check login attempts
    let attempt = await LoginAttempt.findOne({ email }) || 
                 new LoginAttempt({ email, ipAddress: ip, userAgent });

    if (attempt.lockUntil && attempt.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((attempt.lockUntil - Date.now()) / 60000);
      return res.status(403).json({ 
        error: `Account locked. Try again in ${remainingTime} minutes.` 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      attempt.failedAttempts += 1;
      
      if (attempt.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        attempt.lockUntil = new Date(Date.now() + LOCK_TIME);
      }

      await attempt.save();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset attempts on success
    attempt.failedAttempts = 0;
    attempt.lockUntil = null;
    await attempt.save();

    // Generate token
    const token = generateToken(user._id);
    res.json({ 
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const googleAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Google authentication failed' });
    }

    const token = generateToken(req.user._id);
    res.json({ 
      token,
      user: {
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profilePic: req.user.profilePic
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { signup, login, googleAuth };