const express = require('express');
const router = express.Router();
const groupMessageController = require('../controllers/groupMessageController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Message routes
router.post('/', groupMessageController.sendGroupMessage);
router.get('/:groupId', groupMessageController.getGroupMessages);
router.post('/:groupId/read', groupMessageController.markMessagesAsRead);
router.delete('/:messageId', groupMessageController.deleteGroupMessage);

module.exports = router;