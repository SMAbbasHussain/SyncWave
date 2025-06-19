const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../utils/jwtUtils");
const {authenticateToken} = require("../middleware/authMiddleware")

router.use(verifyToken);

// User endpoints
router.get("/me", userController.getCurrentUser); // New endpoint for current user
router.get("/", userController.getProfile);
router.get("/blocked", userController.getBlockedUsers);

router.put("/profile", userController.updateProfile);

// Block management
router.post("/block/:userId", userController.blockUser);
router.post("/unblock/:userId", userController.unblockUser);

// Search users
router.get('/search', userController.searchUsers);

router.patch('/heartbeat', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      status: 'online',
      lastSeen: new Date()
    });

    res.status(200).json({ 
      success: true,
      message: 'Status updated'
    });
  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update status'
    });
  }
});

module.exports = router;