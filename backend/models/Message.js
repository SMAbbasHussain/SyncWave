
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true // Now required since we're separating systems
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
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
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
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
  }]
}, { 
  timestamps: true 
});

// Comprehensive indexes for performance
messageSchema.index({ chatId: 1, createdAt: -1 }); // Chat timeline
messageSchema.index({ senderId: 1, receiverId: 1 }); // User conversations
messageSchema.index({ receiverId: 1, isRead: 1 }); // Unread messages
messageSchema.index({ isDeleted: 1, deletedFor: 1 }); // Soft deletes
messageSchema.index({ createdAt: -1 }); // Recent messages

// Methods
messageSchema.methods.isDeletedFor = function(userId) {
  return this.deletedFor.includes(userId);
};

messageSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(r => 
    r.userId.toString() === userId.toString() && r.emoji === emoji
  );
  
  if (!existingReaction) {
    this.reactions.push({ userId, emoji });
  }
};

messageSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(r => 
    !(r.userId.toString() === userId.toString() && r.emoji === emoji)
  );
};

module.exports = mongoose.model('Message', messageSchema);