const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getAllConversations,
  markAsRead,
  deleteMessage
} = require('../controllers/chatController');
const { verifyToken } = require('../utils/jwtUtils');

// Apply auth middleware to all chat routes
router.use(verifyToken);

// Send a new message
router.post('/', sendMessage);

// Get conversation with specific user
router.get('/:userId', getConversation);

// Get all conversations (for chat list)
router.get('/', getAllConversations);

// Mark messages as read
router.put('/:senderId/read', markAsRead);

// Delete a message
router.delete('/:messageId', deleteMessage);

module.exports = router;