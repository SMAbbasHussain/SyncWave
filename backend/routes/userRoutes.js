const express = require("express");
const router = express.Router();
const { 
  updateProfile,
  blockUser,
  unblockUser,
  getProfile
} = require("../controllers/userController");
const { verifyToken } = require("../utils/jwtUtils");

// Apply verifyToken middleware to all user routes
router.use(verifyToken);

// Update user profile
router.put("/profile", updateProfile);

// Block a user
router.post("/block/:userId", blockUser);

// Unblock a user
router.post("/unblock/:userId", unblockUser);

// Get user profile
router.get("/:userId", getProfile);

module.exports = router;