const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../utils/jwtUtils");

router.use(verifyToken);

// User profile
router.get("/users/:userId", userController.getProfile);
router.put("/users/profile", userController.updateProfile);

// Block management
router.post("/users/block/:userId", userController.blockUser);
router.post("/users/unblock/:userId", userController.unblockUser);

module.exports = router;