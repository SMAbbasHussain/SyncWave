const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  photo: {
    type: String,
    default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'admin', 'moderator'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    muted: {
      type: Boolean,
      default: false
    }
  }],
  permissions: {
    onlyAdminsCanPost: {
      type: Boolean,
      default: false
    },
    inviteOnly: {
      type: Boolean,
      default: false
    },
    allowMemberInvites: {
      type: Boolean,
      default: true
    },
    isMuted: {
      type: Boolean,
      default: false
    }
  },
  pinnedMessages: [{
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupMessage'
    },
    pinnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pinnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  joinRequests: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Add methods to the schema
groupSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.userId.toString() === userId.toString());
};

groupSchema.methods.isAdmin = function(userId) {
  return this.members.some(member => 
    member.userId.toString() === userId.toString() && 
    ['admin', 'moderator'].includes(member.role)
  );
};

module.exports = mongoose.model('Group', groupSchema);