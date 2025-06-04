const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const User = require('../models/User');

// Send group message
const sendGroupMessage = async (req, res) => {
  try {
    const { groupId, content, attachments = [], mentions = [] } = req.body;
    const senderId = req.user._id;

    // Check if user is member
    const group = await Group.findById(groupId);
    if (!group || !group.isMember(senderId)) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    // Check permissions
    if (group.permissions.onlyAdminsCanPost && !group.isAdmin(senderId)) {
      return res.status(403).json({ error: 'Only admins can post in this group' });
    }

    // Check if group is muted
    if (group.permissions.isMuted && !group.isAdmin(senderId)) {
      return res.status(403).json({ error: 'Group is currently muted' });
    }

    const message = new GroupMessage({
      groupId,
      senderId,
      content,
      attachments,
      mentions
    });

    await message.save();

    // Update group's last activity
    group.lastActivity = new Date();
    await group.save();

    const populatedMessage = await GroupMessage.populate(message, [
      {
        path: 'senderId',
        select: 'username profilePic'
      },
      {
        path: 'mentions',
        select: 'username profilePic'
      }
    ]);

    // Emit to all group members
    if (req.io) {
      group.members.forEach(member => {
        req.io.to(member.userId.toString()).emit('newGroupMessage', populatedMessage);
      });

      // Send special notification to mentioned users
      mentions.forEach(mentionedUserId => {
        req.io.to(mentionedUserId.toString()).emit('mentioned', {
          type: 'group',
          groupId,
          messageId: message._id,
          sender: req.user
        });
      });
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get group messages
const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Check if user is member
    const group = await Group.findById(groupId);
    if (!group || !group.isMember(req.user._id)) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    const messages = await GroupMessage.find({
      groupId,
      isDeleted: false,
      deletedFor: { $ne: req.user._id }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('senderId', 'username profilePic')
      .populate('mentions', 'username profilePic')
      .populate('reactions.userId', 'username profilePic');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { messageIds } = req.body;

    // Check if user is member
    const group = await Group.findById(groupId);
    if (!group || !group.isMember(req.user._id)) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    await GroupMessage.updateMany(
      {
        _id: { $in: messageIds },
        groupId,
        'readBy.userId': { $ne: req.user._id }
      },
      {
        $push: { readBy: { userId: req.user._id } }
      }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete group message
const deleteGroupMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteForEveryone = false } = req.body;

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is sender or admin
    const group = await Group.findById(message.groupId);
    const isOwner = message.senderId.toString() === req.user._id.toString();
    const isAdmin = group && group.isAdmin(req.user._id);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    if (deleteForEveryone && isAdmin) {
      // Hard delete for everyone
      message.isDeleted = true;
    } else {
      // Soft delete for user
      if (!message.deletedFor.includes(req.user._id)) {
        message.deletedFor.push(req.user._id);
      }
    }

    await message.save();

    // Emit socket event
    if (req.io && deleteForEveryone) {
      group.members.forEach(member => {
        req.io.to(member.userId.toString()).emit('messageDeleted', {
          messageId,
          groupId: message.groupId
        });
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendGroupMessage,
  getGroupMessages,
  markMessagesAsRead,
  deleteGroupMessage
};