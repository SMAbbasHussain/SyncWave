const Group = require('../models/Group');
const User = require('../models/User');
const GroupMessage = require('../models/GroupMessage');

// Helper function to check group permissions
const checkGroupAdmin = (group, userId) => {
  return group.members.some(m => 
    m.userId.equals(userId) && ['admin', 'moderator'].includes(m.role)
  );
};

// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, description, photo } = req.body;
    const group = new Group({
      name,
      description,
      photo,
      creatorId: req.user._id,
      members: [{
        userId: req.user._id,
        role: 'admin'
      }]
    });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all groups for a user
const getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ 'members.userId': req.user._id })
      .populate('creatorId', 'username profilePic')
      .populate('members.userId', 'username profilePic')
      .populate('pinnedMessages.messageId')
      .populate('pinnedMessages.pinnedBy', 'username profilePic');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get group details
const getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('creatorId', 'username profilePic')
      .populate('members.userId', 'username profilePic')
      .populate('pinnedMessages.messageId')
      .populate('pinnedMessages.pinnedBy', 'username profilePic');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    if (!group.isMember(req.user._id)) {
      return res.status(403).json({ error: 'Not a group member' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle join request
const handleJoinRequest = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!checkGroupAdmin(group, req.user._id)) {
      return res.status(403).json({ error: 'Only admins can handle join requests' });
    }

    const request = group.joinRequests.find(req => 
      req.userId.toString() === userId && req.status === 'pending'
    );

    if (!request) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    request.status = status;
    if (status === 'approved') {
      group.members.push({
        userId,
        role: 'member',
        joinedAt: new Date()
      });
    }

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add member to group
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check permissions
    if (!checkGroupAdmin(group, req.user._id)) {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    // Check if user is already a member
    if (group.isMember(userId)) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add member
    group.members.push({
      userId,
      role: 'member'
    });

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove member from group
const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check permissions
    if (!checkGroupAdmin(group, req.user._id)) {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    // Prevent removing the last admin
    const admins = group.members.filter(m => m.role === 'admin');
    if (admins.length === 1 && admins[0].userId.equals(userId)) {
      return res.status(400).json({ error: 'Cannot remove the last admin' });
    }

    // Remove member
    group.members = group.members.filter(m => !m.userId.equals(userId));
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update member role
const updateMemberRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check permissions
    if (!checkGroupAdmin(group, req.user._id)) {
      return res.status(403).json({ error: 'Only admins can update roles' });
    }

    // Find and update member
    const member = group.members.find(m => m.userId.equals(userId));
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    member.role = role;
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update group info
const updateGroupInfo = async (req, res) => {
  try {
    const { name, description, photo } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check permissions
    if (!checkGroupAdmin(group, req.user._id)) {
      return res.status(403).json({ error: 'Only admins can update group info' });
    }

    // Update fields
    if (name) group.name = name;
    if (description) group.description = description;
    if (photo) group.photo = photo;

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pin a message
const pinMessage = async (req, res) => {
  try {
    const { messageId } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check permissions
    if (!checkGroupAdmin(group, req.user._id)) {
      return res.status(403).json({ error: 'Only admins can pin messages' });
    }

    // Check if message exists
    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Add to pinned messages
    group.pinnedMessages.push({
      messageId,
      pinnedBy: req.user._id
    });

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Unpin a message
const unpinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check permissions
    if (!checkGroupAdmin(group, req.user._id)) {
      return res.status(403).json({ error: 'Only admins can unpin messages' });
    }

    // Remove from pinned messages
    group.pinnedMessages = group.pinnedMessages.filter(
      pm => !pm.messageId.equals(messageId)
    );

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle group mute
const toggleGroupMute = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check permissions
    if (!checkGroupAdmin(group, req.user._id)) {
      return res.status(403).json({ error: 'Only admins can mute the group' });
    }

    group.permissions.isMuted = !group.permissions.isMuted;
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createGroup,
  getUserGroups,
  getGroupDetails,
  handleJoinRequest,
  addMember,
  removeMember,
  updateMemberRole,
  updateGroupInfo,
  pinMessage,
  unpinMessage,
  toggleGroupMute
};