const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const User = require('../models/User');
const webpush = require('web-push');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Send group message
const sendGroupMessage = async (req, res) => {
  try {
    const { groupId, content, attachments = [], mentions = [] } = req.body;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group || !group.isMember(senderId)) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    if (group.permissions.onlyAdminsCanPost && !group.isAdmin(senderId)) {
      return res.status(403).json({ error: 'Only admins can post in this group' });
    }

    // This check is already here and is correct. If the group is muted, we stop.
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
    group.lastActivity = new Date();
    await group.save();

    const populatedMessage = await GroupMessage.populate(message, [
      { path: 'senderId', select: 'username profilePic' },
      { path: 'mentions', select: 'username profilePic' }
    ]);

    if (req.io) {
      // 1. Emit 'newGroupMessage' to ALL members to update their chat UI.
      group.members.forEach(member => {
        req.io.to(member.userId.toString()).emit('newGroupMessage', populatedMessage);
      });

      // 2. **** NOTIFICATION LOGIC ****
      // A. Send a special, high-priority notification to MENTIONED users.
      mentions.forEach(mentionedUserId => {
        // Don't send a mention notification if a user mentions themselves.
        if (mentionedUserId.toString() !== senderId.toString()) {
            req.io.to(mentionedUserId.toString()).emit('notification', {
              type: 'mention', // A specific type for mentions
              title: `You were mentioned in ${group.name}`,
              body: `${req.user.username}: ${content.trim().substring(0, 100)}...`,
              sender: {
                _id: req.user._id,
                username: req.user.username,
                profilePic: req.user.profilePic
              },
              groupId: group._id,
              messageId: message._id
            });
        }
      });

      // B. Send a standard notification to OTHER group members (not the sender, not the mentioned).
      const notificationPayload = {
        type: 'group',
        title: group.name,
        body: `${req.user.username}: ${content.trim().substring(0, 100)}...`,
        sender: {
          _id: req.user._id,
          username: req.user.username,
          profilePic: req.user.profilePic
        },
        groupId: group._id,
        messageId: message._id
      };
      
      group.members.forEach(member => {
        const memberIdStr = member.userId.toString();
        // Condition: Is this member NOT the sender AND NOT already mentioned?
        if (memberIdStr !== senderId.toString() && !mentions.includes(memberIdStr)) {
          // A more advanced implementation would check for per-user group mute settings here.
          req.io.to(memberIdStr).emit('notification', notificationPayload);
        }
      });
      // **** END NOTIFICATION LOGIC ****

      // **** 2. BACKGROUND PUSH NOTIFICATION LOGIC ****

      // A. Get all member IDs from the group, excluding the sender
      const recipientIds = group.members
        .map(member => member.userId.toString())
        .filter(id => id !== senderId.toString());

      // B. Find all user documents for these recipients in a single query
      const recipients = await User.find({
        '_id': { $in: recipientIds }
      }).select('pushSubscriptions');

      // C. Prepare the notification payloads
      const mentionPayload = JSON.stringify({
        title: `You were mentioned in ${group.name}`,
        body: `${req.user.username}: ${content.trim()}`,
        icon: req.user.profilePic || '/logo192.png',
        data: { url: `/homepage?chatId=${group._id}&type=group` }
      });

      const groupPayload = JSON.stringify({
        title: group.name,
        body: `${req.user.username}: ${content.trim()}`,
        icon: group.groupIcon || '/logo192.png', // Use group icon if available
        data: { url: `/homepage?chatId=${group._id}&type=group` }
      });

      // D. Loop through the recipients and send notifications
      recipients.forEach(recipient => {
        // Skip if this recipient has no subscriptions
        if (!recipient.pushSubscriptions || recipient.pushSubscriptions.length === 0) {
          return;
        }

        // Determine which payload to send
        const isMentioned = mentions.includes(recipient._id.toString());
        const payloadToSend = isMentioned ? mentionPayload : groupPayload;

        // Send the notification to all of the user's registered devices
        recipient.pushSubscriptions.forEach(sub => {
          webpush.sendNotification(sub, payloadToSend).catch(error => {
            console.error(`Error sending push to ${recipient._id}:`, error.statusCode);
            // In a production app, you would handle expired subscriptions (410) here
            // by removing them from the user's document.
          });
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