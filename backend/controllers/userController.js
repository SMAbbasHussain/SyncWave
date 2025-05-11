const User = require("../models/User");
const jwt = require('jsonwebtoken');



const updateUserProfile = async (req, res) => {
  const userId = req.user.userId;
  const { bio, profilePic } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.bio = bio || user.bio;
    user.profilePic = profilePic || user.profilePic;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { updateUserProfile };
