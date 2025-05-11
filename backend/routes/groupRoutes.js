const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Group creation and retrieval
router.post('/', groupController.createGroup);
router.get('/my-groups', groupController.getUserGroups);
router.get('/:groupId', groupController.getGroupDetails);

// Member management
router.post('/:groupId/members', groupController.addMember);
router.delete('/:groupId/members/:userId', groupController.removeMember);
router.patch('/:groupId/members/role', groupController.updateMemberRole);

// Group info management
router.patch('/:groupId/info', groupController.updateGroupInfo);

// Join request handling
router.post('/:groupId/join-requests', groupController.handleJoinRequest);

// Group mute
router.patch('/:groupId/mute', groupController.toggleGroupMute);

module.exports = router; 