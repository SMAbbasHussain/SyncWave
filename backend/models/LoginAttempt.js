const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Changed from username to email
  failedAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }
});

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
