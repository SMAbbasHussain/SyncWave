const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../utils/jwtUtils');
const { checkBlocked } = require('../middleware/chatMiddleware');

// Apply authentication to all routes
router.use(verifyToken);

// Chat initialization and management
router.post('/initialize', checkBlocked, chatController.initializeChat);
router.get('/:chatId', chatController.getChatById);

// Message operations (simplified since sendMessage now handles chat creation)
router.post('/messages', checkBlocked, chatController.sendMessage);
router.get('/messages/conversations', chatController.getAllConversations);
router.get('/messages/conversations/:userId', chatController.getConversation);

// Message status operations
router.put('/messages/:senderId/read', chatController.markAsRead);
router.delete('/messages/:messageId', chatController.deleteMessage);

// Message reactions
router.post('/messages/:messageId/reactions', chatController.addReaction);
router.delete('/messages/:messageId/reactions', chatController.removeReaction);

// Additional utility routes
router.get('/:chatId/messages', chatController.getChatMessages);
router.put('/:chatId/activity', chatController.updateChatActivity);

module.exports = router;