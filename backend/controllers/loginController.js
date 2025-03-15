// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("./models/User"); // Import user schema

// const router = express.Router();

// // Login Route
// router.post("/login", async (req, res) => {
//   const { email, username, password } = req.body;

//   try {
//     // Find user by email or username
//     const user = await User.findOne({
//       $or: [{ email: email }, { username: username }],
//     });

//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     // Check password (if password-based authentication)
//     if (user.password && !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { userId: user._id, email: user.email },
//       "your_jwt_secret",
//       { expiresIn: "1h" }
//     );

//     res.json({ message: "Login successful", token });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// });

// module.exports = router;
