const GroupMessage = require('../models/GroupMessage');
const Group = require('../models/Group');
const User = require('../models/User');

// Send a new group message
exports.sendGroupMessage = async (req, res) => {
  try {
    const { groupId, content } = req.body;
    const message = new GroupMessage({
      groupId,
      senderId: req.user._id,
      content
    });

    await message.save();
    
    const populated = await GroupMessage.populate(message, [
      { path: 'senderId', select: 'username profilePic' },
      { path: 'groupId', select: 'name' }
    ]);

    res.status(201).json(populated);
    req.io.to(groupId.toString()).emit('newGroupMessage', populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get all messages for a group
exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member of the group
    const isMember = group.members.some(member => 
      member.userId.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member of the group to view messages' });
    }

    const messages = await GroupMessage.find({ groupId })
      .sort({ timestamp: 1 })
      .populate('senderId', 'username profilePicture')
      .populate('groupId', 'name');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a group message
exports.deleteGroupMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender or an admin of the group
    const group = await Group.findById(message.groupId);
    const isAdmin = group.members.some(member => 
      member.userId.toString() === userId.toString() && 
      member.role === 'admin'
    );

    if (message.senderId.toString() !== userId.toString() && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await message.remove();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recent messages from all groups user is part of
exports.getRecentGroupMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all groups user is part of
    const userGroups = await Group.find({ 'members.userId': userId });
    const groupIds = userGroups.map(group => group._id);

    // Get recent messages from these groups
    const recentMessages = await GroupMessage.find({ groupId: { $in: groupIds } })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('senderId', 'username profilePicture')
      .populate('groupId', 'name');

    res.json(recentMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 