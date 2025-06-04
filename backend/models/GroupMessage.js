const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  attachments: {
    type: [String], // Fixed array default issue
    default: []
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedFor: {
    type: [mongoose.Schema.Types.ObjectId], // Fixed array default issue
    ref: 'User',
    default: []
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Group-specific fields
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { 
  timestamps: true 
});

// Indexes for performance
groupMessageSchema.index({ groupId: 1, createdAt: -1 }); // Group timeline
groupMessageSchema.index({ senderId: 1 }); // Sender messages
groupMessageSchema.index({ isDeleted: 1, deletedFor: 1 }); // Soft deletes
groupMessageSchema.index({ 'readBy.userId': 1 }); // Read status
groupMessageSchema.index({ mentions: 1 }); // Mentioned users

// Methods
groupMessageSchema.methods.isDeletedFor = function(userId) {
  return this.deletedFor.includes(userId);
};

groupMessageSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(r => 
    r.userId.toString() === userId.toString() && r.emoji === emoji
  );
  
  if (!existingReaction) {
    this.reactions.push({ userId, emoji });
  }
};

groupMessageSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(r => 
    !(r.userId.toString() === userId.toString() && r.emoji === emoji)
  );
};

groupMessageSchema.methods.markReadBy = function(userId) {
  const existingRead = this.readBy.find(r => r.userId.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({ userId });
  }
};

groupMessageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(r => r.userId.toString() === userId.toString());
};

module.exports = mongoose.model('GroupMessage', groupMessageSchema);