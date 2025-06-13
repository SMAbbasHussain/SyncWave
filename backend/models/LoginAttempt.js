const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  failedAttempts: { 
    type: Number, 
    default: 0,
    min: 0
  },
  lockUntil: { 
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Optional helper: Check if account is currently locked
loginAttemptSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
