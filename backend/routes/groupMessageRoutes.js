const express = require('express');
const router = express.Router();
const groupMessageController = require('../controllers/groupMessageController');

// Send a new group message
router.post('/', groupMessageController.sendGroupMessage);

// Get all messages for a specific group
router.get('/group/:groupId', groupMessageController.getGroupMessages);

// Get recent messages from all groups user is part of
router.get('/recent', groupMessageController.getRecentGroupMessages);

// Delete a group message
router.delete('/:messageId', groupMessageController.deleteGroupMessage);

module.exports = router; 