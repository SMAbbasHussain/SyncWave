const express = require("express");
const router = express.Router();
const { updateUserProfile } = require("../controllers/userController");
const { verifyToken } = require("../utils/jwtUtils");

router.put("/profile",  verifyToken,updateUserProfile);

module.exports = router;
