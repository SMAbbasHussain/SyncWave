const User = require('../models/User');
const cloudinary = require("../utils/cloudinary");

// Helper function to format user data for responses
const formatUserResponse = (user) => {
  const userData = user.toObject();
  delete userData.password;
  delete userData.blockedUsers;
  delete userData.__v; // Remove version key
  return userData;
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, bio, profilePic, phoneNo, status } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Username validation
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          error: 'Username already taken' 
        });
      }
      user.username = username;
    }

    // Update fields
    if (bio !== undefined) user.bio = bio;
    if (phoneNo !== undefined) user.phoneNo = phoneNo;
    if (status !== undefined) user.status = status;

    // Handle profile picture upload
    if (profilePic) {
      try {
        const uploadedResponse = await cloudinary.uploader.upload(profilePic, {
          folder: "profile_pics",
          transformation: [{ width: 200, height: 200, crop: "fill" }],
        });
        user.profilePic = uploadedResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
          success: false,
          error: 'Failed to upload profile picture'
        });
      }
    }

    await user.save();

    res.json({
      success: true,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
};

// Block a user
exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user._id;

    // Prevent self-block
    if (userId === currentUser.toString()) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot block yourself' 
      });
    }

    // Check if user exists
    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Add to blocked list
    const user = await User.findByIdAndUpdate(
      currentUser,
      { $addToSet: { blockedUsers: userId } },
      { new: true }
    ).select('-password -blockedUsers -__v');

    res.json({ 
      success: true,
      message: 'User blocked successfully',
      user
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Unblock a user
exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user._id;

    const user = await User.findByIdAndUpdate(
      currentUser,
      { $pull: { blockedUsers: userId } },
      { new: true }
    ).select('-password -blockedUsers -__v');

    res.json({ 
      success: true,
      message: 'User unblocked successfully',
      user
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId)
      .select('-password -blockedUsers -__v');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};