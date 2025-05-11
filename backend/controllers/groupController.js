const Group = require('../models/Group');
const User = require('../models/User');

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, photo } = req.body;
    const group = new Group({
      name,
      description,
      photo,
      creatorId: req.user._id
    });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all groups for a user
exports.getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ 'members.userId': req.user._id })
      .populate('creatorId', 'username profilePicture')
      .populate('members.userId', 'username profilePicture');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single group details
exports.getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('creatorId', 'username profilePicture')
      .populate('members.userId', 'username profilePicture')
      .populate('pinnedMessage.messageId')
      .populate('pinnedMessage.pinnedBy', 'username profilePicture');
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add member to group
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    if (group.isMember(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    group.members.push({
      userId,
      role: 'member',
      joinedAt: new Date()
    });

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove member from group
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    group.members = group.members.filter(member => 
      member.userId.toString() !== userId
    );

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update member role
exports.updateMemberRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can update roles' });
    }

    const member = group.members.find(m => m.userId.toString() === userId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.role = newRole;
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update group info
exports.updateGroupInfo = async (req, res) => {
  try {
    const { name, description, photo } = req.body;
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can update group info' });
    }

    if (name) group.name = name;
    if (description) group.description = description;
    if (photo) group.photo = photo;

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle join request
exports.handleJoinRequest = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can handle join requests' });
    }

    const request = group.joinRequests.find(req => 
      req.userId.toString() === userId && req.status === 'pending'
    );

    if (!request) {
      return res.status(404).json({ message: 'Join request not found' });
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
    res.status(500).json({ message: error.message });
  }
};


// Toggle group mute
exports.toggleGroupMute = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.isAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only admins can mute the group' });
    }

    group.permissions.isMuted = !group.permissions.isMuted;
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 