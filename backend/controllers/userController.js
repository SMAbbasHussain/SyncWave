const User = require('../models/User');

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, bio, profilePic, phoneNo, status } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate username uniqueness
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      user.username = username;
    }

    // Update other fields
    if (bio !== undefined) user.bio = bio;
    if (profilePic !== undefined) user.profilePic = profilePic;
    if (phoneNo !== undefined) user.phoneNo = phoneNo;
    if (status !== undefined) user.status = status;

    await user.save();

    // Return updated user (excluding sensitive data)
    const userData = user.toObject();
    delete userData.password;
    delete userData.blockedUsers;

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Block a user
exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user._id;

    // Prevent self-block
    if (userId === currentUser.toString()) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    // Check if user exists
    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add to blocked list (avoid duplicates)
    const user = await User.findByIdAndUpdate(
      currentUser,
      { $addToSet: { blockedUsers: userId } },
      { new: true }
    );

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unblock a user
exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user._id;

    // Remove from blocked list
    const user = await User.findByIdAndUpdate(
      currentUser,
      { $pull: { blockedUsers: userId } },
      { new: true }
    );

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -blockedUsers');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};