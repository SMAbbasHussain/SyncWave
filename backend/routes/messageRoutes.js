const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Send a new message
router.post('/', messageController.sendMessage);

// Get conversation with a specific user
router.get('/conversation/:userId', messageController.getConversation);

// Get all conversations
router.get('/conversations', messageController.getAllConversations);

// Mark messages as read
router.patch('/read/:senderId', messageController.markAsRead);

// Delete a message
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router; 