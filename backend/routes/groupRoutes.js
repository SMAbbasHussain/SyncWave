const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { verifyToken } = require('../utils/jwtUtils');
const { checkGroupMember, checkGroupAdmin } = require('../middleware/chatMiddleware');


// Verify token for all group routes
router.use(verifyToken);

// Group CRUD
router.post('/', groupController.createGroup);
router.get('/', groupController.getUserGroups);
router.get('/:groupId', checkGroupMember, groupController.getGroupDetails);
router.put('/:groupId', checkGroupAdmin, groupController.updateGroupInfo);

// Member management
router.post('/:groupId/members', checkGroupAdmin, groupController.addMember);
router.delete('/:groupId/members/:userId', checkGroupAdmin, groupController.removeMember);
router.put('/:groupId/members/:userId/role', checkGroupAdmin, groupController.updateMemberRole);

// Group features
router.post('/:groupId/join-requests', checkGroupAdmin, groupController.handleJoinRequest);
router.put('/:groupId/mute', checkGroupAdmin, groupController.toggleGroupMute);
router.post('/:groupId/pins/:messageId', checkGroupAdmin, groupController.pinMessage);
router.delete('/:groupId/pins/:messageId', checkGroupAdmin, groupController.unpinMessage);

module.exports = router;