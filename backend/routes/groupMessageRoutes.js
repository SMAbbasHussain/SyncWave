const express = require('express');
const router = express.Router();
const groupMessageController = require('../controllers/groupMessageController');
const { verifyToken } = require('../utils/jwtUtils');
const { checkGroupMember } = require('../middleware/chatMiddleware');

router.use(verifyToken);

// Group message operations
router.post('/groups/:groupId/messages', checkGroupMember, groupMessageController.sendGroupMessage);
router.get('/groups/:groupId/messages', checkGroupMember, groupMessageController.getGroupMessages);
router.get('/groups/messages/recent', groupMessageController.getRecentGroupMessages);
router.delete('/groups/messages/:messageId', groupMessageController.deleteGroupMessage);

module.exports = router;