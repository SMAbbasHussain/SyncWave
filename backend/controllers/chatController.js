const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

// Send a private message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, attachments = [] } = req.body;
    const senderId = req.user._id;

    const message = new Message({
      senderId,
      receiverId,
      content,
      attachments
    });

    await message.save();
    
    const populatedMessage = await Message.populate(message, {
      path: 'senderId',
      select: 'username profilePic'
    });

    res.status(201).json(populatedMessage);
    req.io.to(receiverId.toString()).emit('newMessage', populatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get conversation between two users
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id }
      ],
      isDeleted: false,
      deletedFor: { $ne: req.user._id }
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

// Initialize chat between two users
const initializeChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user._id;

    // Prevent self-chat
    if (currentUserId.toString() === participantId.toString()) {
      return res.status(400).json({ error: 'Cannot create chat with yourself' });
    }

    // Check if chat already exists between these users
    const existingChat = await Chat.findOne({
      participants: { 
        $all: [currentUserId, participantId],
        $size: 2 
      }
    }).populate('participants', 'username profilePic');

    if (existingChat) {
      return res.status(200).json({
        message: 'Chat already exists',
        chat: existingChat
      });
    }

    // Verify the other user exists
    const participant = await User.findById(participantId).select('username profilePic');
    if (!participant) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create new chat
    const newChat = new Chat({
      participants: [currentUserId, participantId],
      chatType: 'private',
      createdBy: currentUserId,
      lastActivity: new Date()
    });

    await newChat.save();

    // Populate the chat with participant details
    const populatedChat = await Chat.populate(newChat, {
      path: 'participants',
      select: 'username profilePic'
    });

    // Emit socket event to both users
    req.io.to(currentUserId.toString()).emit('chatInitialized', populatedChat);
    req.io.to(participantId.toString()).emit('chatInitialized', populatedChat);

    res.status(201).json({
      message: 'Chat initialized successfully',
      chat: populatedChat
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get chat by ID
const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    }).populate('participants', 'username profilePic');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update the sendMessage function to work with chat initialization
const sendMessageWithChat = async (req, res) => {
  try {
    const { receiverId, content, attachments = [] } = req.body;
    const senderId = req.user._id;

    // Find or create chat
    let chat = await Chat.findOne({
      participants: { 
        $all: [senderId, receiverId],
        $size: 2 
      }
    });

    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
        chatType: 'private',
        createdBy: senderId,
        lastActivity: new Date()
      });
      await chat.save();
    }

    // Create message with chat reference
    const message = new Message({
      chatId: chat._id,
      senderId,
      receiverId,
      content,
      attachments
    });

    await message.save();

    // Update chat's last activity
    chat.lastActivity = new Date();
    await chat.save();
    
    const populatedMessage = await Message.populate(message, {
      path: 'senderId',
      select: 'username profilePic'
    });

    res.status(201).json(populatedMessage);
    req.io.to(receiverId.toString()).emit('newMessage', populatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export the new methods
module.exports = {
  sendMessage,
  sendMessageWithChat,
  getConversation,
  getAllConversations,
  markAsRead,
  deleteMessage,
  initializeChat,
  getChatById
};