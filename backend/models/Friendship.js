const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });


// Index for efficient querying of friendships

const Friendship = mongoose.model('Friendship', friendshipSchema);

module.exports = Friendship; 