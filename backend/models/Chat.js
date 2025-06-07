const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Private chat settings
  settings: {
    muteNotifications: {
      type: Boolean,
      default: false
    },
    disappearingMessages: {
      enabled: {
        type: Boolean,
        default: false
      },
      duration: {
        type: Number, // in milliseconds
        default: 0
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ createdAt: -1 });

// Method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

// Method to get the other participant
chatSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(p => p.toString() !== userId.toString());
};

// Static method to find chats for a user
chatSchema.statics.findUserChats = function(userId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  return this.find({ 
    participants: userId,
    isActive: true 
  })
  .populate('participants', 'username profilePic')
  .sort({ lastActivity: -1 })
  .skip(skip)
  .limit(limit);
};

module.exports = mongoose.model('Chat', chatSchema);