const Message = require('../models/Message');
const User = require('../models/User');

// Send a private message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, attachments = [] } = req.body;
    const senderId = req.user._id;

    // Validate receiver
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if blocked
    if (receiver.blockedUsers.includes(senderId)) {
      return res.status(403).json({ error: 'You are blocked by this user' });
    }

    // Create message
    const message = new Message({
      senderId,
      receiverId,
      content,
      attachments
    });

    await message.save();
    
    // Populate sender info for real-time updates
    const populatedMessage = await Message.populate(message, {
      path: 'senderId',
      select: 'username profilePic'
    });

    res.status(201).json(populatedMessage);
    
    // Emit socket event for real-time messaging
    req.io.to(receiverId.toString()).emit('newMessage', populatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get conversation between two users (with pagination)
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Validate other user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if blocked
    if (user.blockedUsers.includes(currentUserId)) {
      return res.status(403).json({ error: 'You are blocked by this user' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ],
      isDeleted: false,
      deletedFor: { $ne: currentUserId }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('senderId', 'username profilePic')
    .populate('receiverId', 'username profilePic');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all conversations for current user
const getAllConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: req.user._id },
            { receiverId: req.user._id }
          ],
          isDeleted: false,
          deletedFor: { $ne: req.user._id }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', req.user._id] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          'user.password': 0,
          'user.blockedUsers': 0,
          'user.email': 0
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user._id;

    await Message.updateMany(
      {
        senderId,
        receiverId,
        isRead: false
      },
      { 
        isRead: true,
        readAt: new Date() 
      }
    );

    // Emit socket event for read receipt
    req.io.to(senderId.toString()).emit('messagesRead', {
      receiverId,
      timestamp: new Date()
    });

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a message (soft delete)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only sender can delete
    if (!message.senderId.equals(userId)) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    // Soft delete
    message.deletedFor.push(userId);
    await message.save();

    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getAllConversations,
  markAsRead,
  deleteMessage
};