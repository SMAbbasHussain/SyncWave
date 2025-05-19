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
    
    // Create complete user data for localStorage
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      phoneNo: user.phoneNo,
      profilePic: user.profilePic || '/PFP2.png', // Default profile picture
      bio: user.bio || '', // Empty bio by default
      isLoggedIn: true
    };

    res.status(201).json({ 
      token,
      user: userData // Send complete user data to frontend
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  console.log("🔐 Login attempt started");
  const { email, password } = req.body;
  const ip = req.ip;
  const userAgent = req.get('User-Agent');

  try {
    console.log("🔍 Searching user by email:", email);
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ error: 'User not found' });
    }

    console.log("✅ User found:", user.username);

    // If user has GoogleId but no password (or just no password set)
    if (!user.password) {
      console.log("❌ User has no password (Google login user or corrupted data)");
      return res.status(400).json({ error: 'This account has no password. Please use Google login or reset your password.' });
    }

    console.log("🔐 Checking login attempts...");
    let attempt = await LoginAttempt.findOne({ email });
    if (!attempt) {
      attempt = new LoginAttempt({
        email,
        ipAddress: ip,
        userAgent,
        failedAttempts: 0
      });
      console.log("📄 Created new LoginAttempt document");
    }

    if (attempt.lockUntil && attempt.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((attempt.lockUntil - Date.now()) / 60000);
      console.log("🔒 Account locked. Time remaining:", remainingTime, "minutes");
      return res.status(403).json({ error: `Account locked. Try again in ${remainingTime} minutes.` });
    }

    console.log("🔑 Verifying password...");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      attempt.failedAttempts += 1;
      console.log("❌ Password mismatch. Failed attempts:", attempt.failedAttempts);

      if (attempt.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        attempt.lockUntil = new Date(Date.now() + LOCK_TIME);
        console.log("🔒 Account locked for", LOCK_TIME / 60000, "minutes");
      }

      await attempt.save();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log("✅ Password verified. Resetting attempts...");
    attempt.failedAttempts = 0;
    attempt.lockUntil = null;
    await attempt.save();

    const token = generateToken(user._id);
    console.log("🎟 Token generated. Sending response...");

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
    console.error("🔥 Login backend error:", error);
    res.status(500).json({ error: error.message || 'Internal server error' });
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

// Add to authController.js
const logout = async (req, res) => {
  try {
    // For JWT, we typically just need to clear client-side tokens
    // If you want to implement server-side token invalidation, you would:
    // 1. Add token to a blacklist
    // 2. Check blacklist during authentication
    
    res.status(200).json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Logout failed' 
    });
  }
};


// Update exports
module.exports = { signup, login, googleAuth, logout };
