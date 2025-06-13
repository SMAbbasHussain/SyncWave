const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: [true, 'Role is required'],
    validate: {
      validator: function(v) {
        return ['user', 'assistant', 'system'].includes(v);
      },
      message: props => `${props.value} is not a valid role`
    }
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [1, 'Content cannot be empty'],
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true }); // Ensure each message gets its own ID

const aiConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  messages: {
    type: [messageSchema],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Conversation must have at least one message'
    }
  },
  title: {
    type: String,
    default: 'New AI Chat',
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  strict: 'throw' // Throw errors for unknown fields
});

// Add compound index
aiConversationSchema.index({ userId: 1, lastUpdated: -1 });

module.exports = mongoose.model('AiConversation', aiConversationSchema);