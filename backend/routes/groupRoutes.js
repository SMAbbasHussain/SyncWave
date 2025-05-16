const express = require('express');
const router = express.Router();
const {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addMember,
  removeMember,
  updateMemberRole,
  updateGroupInfo,
  handleJoinRequest,
  toggleGroupMute,
  pinMessage,
  unpinMessage
} = require('../controllers/groupController');
const { verifyToken } = require('../utils/jwtUtils');

// Apply auth middleware to all group routes
router.use(verifyToken);

// Group CRUD operations
router.post('/', createGroup);
router.get('/', getUserGroups);
router.get('/:groupId', getGroupDetails);
router.put('/:groupId', updateGroupInfo);

// Member management
router.post('/:groupId/members', addMember);
router.delete('/:groupId/members/:userId', removeMember);
router.put('/:groupId/members/:userId/role', updateMemberRole);

// Group features
router.post('/:groupId/join-requests', handleJoinRequest);
router.put('/:groupId/mute', toggleGroupMute);
router.post('/:groupId/pin/:messageId', pinMessage);
router.delete('/:groupId/pin/:messageId', unpinMessage);

module.exports = router;