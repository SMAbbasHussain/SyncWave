const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../utils/jwtUtils');
const { checkBlocked } = require('../middleware/chatMiddleware');

router.use(verifyToken);

// Message operations
router.post('/messages', checkBlocked, chatController.sendMessage);
router.get('/messages/conversations', chatController.getAllConversations);
router.get('/messages/conversations/:userId', checkBlocked, chatController.getConversation);
router.put('/messages/:senderId/read', chatController.markAsRead);
router.delete('/messages/:messageId', chatController.deleteMessage);

module.exports = router;