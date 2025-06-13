const User = require('../models/User');
const LoginAttempt = require('../models/LoginAttempt');
const { generateToken } = require('../utils/jwtUtils');
const bcrypt = require('bcryptjs');
const cloudinary = require('../utils/cloudinary');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes

const signup = async (req, res) => {
  const { username, email, password, phoneNo } = req.body;
  
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email 
          ? 'Email is already registered' 
          : 'Username is already taken'
      });
    }

    const user = new User({ 
      username, 
      email, 
      password, 
      phoneNo,
      status: 'online', // Set status to online on signup
      lastSeen: new Date()
    });
    await user.save();

    const token = generateToken(user._id);
    
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      phoneNo: user.phoneNo,
      profilePic: user.profilePic || '/PFP2.png',
      bio: user.bio || '',
      status: user.status,
      isLoggedIn: true
    };

    res.status(201).json({ 
      token,
      user: userData
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
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'This account has no password. Please use Google login or reset your password.' });
    }

    let attempt = await LoginAttempt.findOne({ email });
    if (!attempt) {
      attempt = new LoginAttempt({
        email,
        ipAddress: ip,
        userAgent,
        failedAttempts: 0
      });
    }

    if (attempt.lockUntil && attempt.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((attempt.lockUntil - Date.now()) / 60000);
      return res.status(403).json({ error: `Account locked. Try again in ${remainingTime} minutes.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      attempt.failedAttempts += 1;
      if (attempt.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
        attempt.lockUntil = new Date(Date.now() + LOCK_TIME);
      }
      await attempt.save();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset login attempts and update user status to online
    attempt.failedAttempts = 0;
    attempt.lockUntil = null;
    await attempt.save();

    // Update user status to online and lastSeen
    await User.findByIdAndUpdate(user._id, {
      status: 'online',
      lastSeen: new Date()
    });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        status: 'online'
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

const googleAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Google authentication failed' });
    }

    // If this is a new user and has a Google profile picture, save it
    if (req.user.isNew && req.user.profilePic) {
      try {
        // Upload Google profile picture to Cloudinary
        const uploadedResponse = await cloudinary.uploader.upload(req.user.profilePic, {
          folder: "profile_pics",
          transformation: [{ width: 200, height: 200, crop: "fill" }],
        });
        
        // Update user with the Cloudinary URL and status
        await User.findByIdAndUpdate(req.user._id, {
          profilePic: uploadedResponse.secure_url,
          status: 'online',
          lastSeen: new Date()
        });
        
        // Update the req.user object with the new URL
        req.user.profilePic = uploadedResponse.secure_url;
      } catch (uploadError) {
        console.error("Error uploading Google profile picture:", uploadError);
        // Fall back to the Google URL if Cloudinary upload fails
        await User.findByIdAndUpdate(req.user._id, {
          status: 'online',
          lastSeen: new Date()
        });
      }
    } else {
      // Update user status to online and lastSeen for Google auth
      await User.findByIdAndUpdate(req.user._id, {
        status: 'online',
        lastSeen: new Date()
      });
    }

    const token = generateToken(req.user._id);
    
    // Check if user was just created
    const isNewUser = req.user.isNew;
    
    // Redirect to frontend with token instead of sending JSON
    res.redirect(`${process.env.CLIENT_URLS}/auth-success?token=${token}&isNewUser=${isNewUser}`);
  } catch (error) {
    console.error('Google auth error:', error);
    res.redirect('/login?error=google_auth_failed');
  }
};

const logout = async (req, res) => {
  try {
    // Extract user ID from the JWT token or request
    const userId = req.user?._id || req.userId; // Assuming you have middleware that sets this
    
    if (userId) {
      // Update user status to offline and lastSeen
      await User.findByIdAndUpdate(userId, {
        status: 'offline',
        lastSeen: new Date()
      });
    }

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

module.exports = { signup, login, googleAuth, logout };