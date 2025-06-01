const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../utils/jwtUtils");

router.use(verifyToken);

// User endpoints
router.get("/me", userController.getCurrentUser); // New endpoint for current user
router.get("/", userController.getProfile);
router.put("/profile", userController.updateProfile);

// Block management
router.post("/block/:userId", userController.blockUser);
router.post("/unblock/:userId", userController.unblockUser);

// Search users
router.get('/search', userController.searchUsers);

module.exports = router;