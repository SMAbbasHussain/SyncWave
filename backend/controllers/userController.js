const User = require('../models/User');
const cloudinary = require("../utils/cloudinary");
const mongoose = require('mongoose');

// Helper function to format user data for responses
const formatUserResponse = (user) => {
  const userData = user.toObject();
  delete userData.password;
  delete userData.blockedUsers;
  delete userData.__v;
  delete userData.isGoogleAuth;
  
  return {
    ...userData,
    profilePic: userData.profilePic || '/PFP2.png',
    bio: userData.bio || '',
    phoneNo: userData.phoneNo || '',
    status: userData.status || 'offline',
    lastSeen: userData.lastSeen || new Date().toISOString()
  };
};

// Get current user's complete profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: formatUserResponse(user)
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
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
    if (profilePic && profilePic !== user.profilePic) {
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId: userToBlockId } = req.params; // ID of the user to block
    const { userId: currentUserId } = req.user;   // ID of the logged-in user

    // Prevent self-block
    if (userToBlockId === currentUserId) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot block yourself' 
      });
    }

    // Check if user to block exists
    const userToBlock = await User.findById(userToBlockId).session(session);
    if (!userToBlock) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // --- Perform all updates within the transaction ---

    // 1. Update the current user: add to blockedUsers and remove from friends
    const updatedCurrentUser = await User.findByIdAndUpdate(
      currentUserId,
      { 
        $addToSet: { blockedUsers: userToBlockId }, // Add to blocked list
        $pull: { friends: userToBlockId }           // Remove from friends list
      },
      { new: true, session } // Pass the session and get the updated doc
    );

    // 2. Update the user who is being blocked: remove current user from their friends list
    await User.findByIdAndUpdate(
      userToBlockId,
      {
        $pull: { friends: currentUserId } // Remove from their friends list
      },
      { session } // Pass the session
    );
    
    // If all operations were successful, commit the transaction
    await session.commitTransaction();

    res.json({ 
      success: true,
      message: 'User blocked and removed from friends successfully',
      user: formatUserResponse(updatedCurrentUser) // Return the updated blocker's profile
    });

  } catch (error) {
    // If any operation fails, abort the entire transaction
    await session.abortTransaction();
    console.error("Block user transaction error:", error);
    res.status(500).json({ 
      success: false,
      error: 'An error occurred while blocking the user. Please try again.' 
    });
  } finally {
    // End the session
    session.endSession();
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
    );

    res.json({ 
      success: true,
      message: 'User unblocked successfully',
      user: formatUserResponse(user)
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

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: formatUserResponse(user)
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Search users by username
exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Search for users whose email contains the query string
    // Exclude the current user from results
    const users = await User.find({
      email: { $regex: q, $options: 'i' },
      _id: { $ne: req.user.userId } // Exclude current user
    })
    .select('username email profilePic') // Only return necessary fields
    .limit(10); // Limit results to prevent overwhelming response

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};