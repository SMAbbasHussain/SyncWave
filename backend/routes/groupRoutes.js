const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Group management routes
router.post('/', groupController.createGroup);
router.get('/', groupController.getUserGroups);
router.get('/:groupId', groupController.getGroupDetails);

// Member management routes
router.post('/:groupId/join-requests', groupController.handleJoinRequest);
router.post('/:groupId/members', groupController.addMember);
router.delete('/:groupId/members/:userId', groupController.removeMember);
router.put('/:groupId/members/role', groupController.updateMemberRole);

// Group settings routes
router.put('/:groupId', groupController.updateGroupInfo);
router.post('/:groupId/pin', groupController.pinMessage);
router.delete('/:groupId/pin/:messageId', groupController.unpinMessage);
router.put('/:groupId/mute', groupController.toggleGroupMute);

module.exports = router;