const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');
const mongoose = require("mongoose");

// Send a message (now requires chat initialization)
// const sendMessage = async (req, res) => {
//   try {
//     const { receiverId, content, attachments = [] } = req.body;
//     const senderId = req.user.userId;

//     // Validate content
//     if (!content || content.trim().length === 0) {
//       return res.status(400).json({ error: 'Message content is required' });
//     }

//     // Find or create chat between users
//     let chat = await Chat.findOne({
//       participants: { 
//         $all: [senderId, receiverId],
//         $size: 2 
//       }
//     });


//     if (!chat) {
//       // Verify receiver exists
//       const receiver = await User.findById(receiverId);
//       if (!receiver) {
//         return res.status(404).json({ error: 'Receiver not found' });
//       }

//       // Create new chat
//       chat = new Chat({
//         participants: [senderId, receiverId],
//         createdBy: senderId,
//         lastActivity: new Date()
//       });
      
//       await chat.save();
//     }

//     // Create message with required chatId
//     const message = new Message({
//       chatId: chat._id,
//       senderId,
//       receiverId,
//       content: content.trim(),
//       attachments
//     });

//     await message.save();

//     // Update chat's last activity
//     chat.lastActivity = new Date();
//     await chat.save();
    
//     // Populate sender info for response
//     const populatedMessage = await Message.populate(message, {
//       path: 'senderId',
//       select: 'username profilePic'
//     });

//     res.status(201).json(populatedMessage);
    
//     // Emit to receiver via socket
//     if (req.io) {
//       req.io.to(receiverId.toString()).emit('newMessage', populatedMessage);
//     }
//   } catch (error) {
//     console.error('Send message error:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, attachments = [] } = req.body;
    const senderId = req.user.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Find or create chat between users
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId], $size: 2 }
    });

    if (!chat) {
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        return res.status(404).json({ error: 'Receiver not found' });
      }
      chat = new Chat({
        participants: [senderId, receiverId],
        createdBy: senderId,
      });
    }
    chat.lastActivity = new Date();
    await chat.save();
    
    const message = new Message({
      chatId: chat._id,
      senderId,
      receiverId,
      content: content.trim(),
      attachments
    });
    await message.save();

    const populatedMessage = await message.populate({
      path: 'senderId',
      select: 'username profilePic'
    });
    
    // <<< FIX: Emit the message to all participants in the chat
    if (req.io) {
      chat.participants.forEach(participantId => {
        // Send to each participant's personal room
        req.io.to(participantId.toString()).emit('newMessage', populatedMessage);
      });
    }

    res.status(201).json(populatedMessage);

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
};

// Get conversation between two users (updated for chat-based system)
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    const currentUserId = req.user.userId;

    // Find the chat between these users
    const chat = await Chat.findOne({
      participants: { 
        $all: [currentUserId, userId],
        $size: 2 
      }
    });

    if (!chat) {
      return res.json([]); // No conversation exists
    }

    // Get messages for this chat
    const messages = await Message.find({
      chatId: chat._id,
      isDeleted: false,
      deletedFor: { $ne: currentUserId }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('senderId', 'username profilePic')
      .populate('receiverId', 'username profilePic');

    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all conversations for current user (updated to use Chat schema methods)
const getAllConversations = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    // Use the static method from Chat schema
    const chats = await Chat.findUserChats(currentUserId, { 
      page: parseInt(page), 
      limit: parseInt(limit) 
    }).populate('participants', 'username profilePic');

    const conversations = await Promise.all(
      chats.map(async (chat) => {
        // Find the other participant
        const otherParticipant = chat.participants.find(
          p => p._id.toString() !== currentUserId.toString()
        );

        // Get last message for this chat
        const lastMessage = await Message.findOne({
          chatId: chat._id,
          isDeleted: false,
          deletedFor: { $ne: currentUserId }
        })
          .sort({ createdAt: -1 })
          .populate('senderId', 'username profilePic');

        // Count unread messages
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          receiverId: currentUserId,
          isRead: false,
          isDeleted: false,
          deletedFor: { $ne: currentUserId }
        });

        // Ensure otherParticipant exists before assigning
        if (!otherParticipant) {
          console.warn(`No other participant found for chat ${chat._id}`);
          return null; // Skip this chat if no valid other participant
        }

        return {
          chatId: chat._id,
          user: {
            _id: otherParticipant._id,
            username: otherParticipant.username || 'Unknown User',
            profilePic: otherParticipant.profilePic || ''
          },
          lastMessage,
          unreadCount,
          lastActivity: chat.lastActivity,
          settings: chat.settings,
          isActive: chat.isActive
        };
      })
    );

    // Filter out null entries and conversations without messages, then sort
    const validConversations = conversations
      .filter(conv => conv && conv.lastMessage)
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    res.json({
      conversations: validConversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: chats.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all conversations error:', error);
    res.status(500).json({ error: error.message });
  }
};
// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user.userId;
    console.log(senderId)
    console.log(receiverId)
    const result = await Message.updateMany(
      {
        senderId,
        receiverId,
        isRead: false,
        isDeleted: false
      },
      { 
        isRead: true,
        readAt: new Date() 
      }
    );

    // Emit socket event for read receipt
    if (req.io) {
      req.io.to(senderId.toString()).emit('messagesRead', {
        receiverId,
        timestamp: new Date(),
        count: result.modifiedCount
      });
    }

    res.json({ 
      message: 'Messages marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a message (soft delete)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is authorized (sender or receiver can delete for themselves)
    const isAuthorized = message.senderId.equals(userId) || message.receiverId.equals(userId);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    // Check if already deleted for this user
    if (message.isDeletedFor(userId)) {
      return res.status(400).json({ error: 'Message already deleted' });
    }

    // Soft delete for this user
    message.deletedFor.push(userId);
    
    // If both users have deleted it, mark as fully deleted
    if (message.deletedFor.length >= 2) {
      message.isDeleted = true;
    }
    
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Initialize chat between two users
const initializeChat = async (req, res) => {
  
  try {
    const { participantId } = req.body;
    const currentUserId = req.user.userId;

    // Validate input
    if (!participantId) {
      return res.status(400).json({ error: 'Participant ID is required' });
    }

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
      participants: [
        new mongoose.Types.ObjectId(currentUserId),
        new mongoose.Types.ObjectId(participantId)
      ],
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
    if (req.io) {
      req.io.to(currentUserId.toString()).emit('chatInitialized', populatedChat);
      req.io.to(participantId.toString()).emit('chatInitialized', populatedChat);
    }

    res.status(201).json({
      message: 'Chat initialized successfully',
      chat: populatedChat
    });

  } catch (error) {
    console.error('Initialize chat error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getOtherParticipant = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = req.user.userId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: 'Invalid chat ID' });
    }

    const chat = await Chat.findById(chatId).populate('participants', 'username profilePic status');
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Ensure the user is a participant
    const isUserParticipant = chat.participants.some(
      p => p._id.toString() === currentUserId
    );

    if (!isUserParticipant) {
      return res.status(403).json({ error: 'Access denied. Not a participant in this chat.' });
    }

    // Find the other participant
    const other = chat.participants.find(
      p => p._id.toString() !== currentUserId
    );

    if (!other) {
      return res.status(404).json({ error: 'Other participant not found' });
    }

    res.status(200).json({
      _id: other._id,
      username: other.username,
      profilePic: other.profilePic || '',
      status: other.status || 'offline'
    });

  } catch (error) {
    console.error('Error in getOtherParticipant:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get chat by ID (updated to use schema methods)
const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findOne({
      _id: chatId,
      isActive: true
    }).populate('participants', 'username profilePic');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Use schema method to check if user is participant
    if (!chat.isParticipant(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get other participant using schema method
    const otherParticipant = chat.getOtherParticipant(userId);
    const otherParticipantData = chat.participants.find(p => 
      p._id.toString() === otherParticipant.toString()
    );

    res.json({
      chatId: chat._id,
      otherParticipant: otherParticipantData,
      settings: chat.settings,
      lastActivity: chat.lastActivity,
      createdAt: chat.createdAt,
      isActive: chat.isActive
    });
  } catch (error) {
    console.error('Get chat by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add reaction to message
const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user has access to this message
    const hasAccess = message.senderId.equals(userId) || message.receiverId.equals(userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    message.addReaction(userId, emoji);
    await message.save();

    res.json({ message: 'Reaction added', reactions: message.reactions });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove reaction from message
const removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.removeReaction(userId, emoji);
    await message.save();

    res.json({ message: 'Reaction removed', reactions: message.reactions });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get messages for a specific chat (updated to use schema methods)
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.userId;

    // Verify user has access to this chat using schema method
    const chat = await Chat.findOne({
      _id: chatId,
      isActive: true
    });

    if (!chat || !chat.isParticipant(userId)) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    // Get messages for this chat
    const messages = await Message.find({
      chatId,
      isDeleted: false,
      deletedFor: { $ne: userId }
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('senderId', 'username profilePic')
      .populate('receiverId', 'username profilePic');

    res.json({
      messages: messages.reverse(),
      chatSettings: chat.settings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update chat activity timestamp (updated to use schema methods)
const updateChatActivity = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findOne({
      _id: chatId,
      isActive: true
    });

    if (!chat || !chat.isParticipant(userId)) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    chat.lastActivity = new Date();
    await chat.save();

    res.json({ 
      message: 'Chat activity updated', 
      lastActivity: chat.lastActivity 
    });
  } catch (error) {
    console.error('Update chat activity error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update chat settings
const updateChatSettings = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { muteNotifications, disappearingMessages } = req.body;
    const userId = req.user.userId;

    const chat = await Chat.findOne({
      _id: chatId,
      isActive: true
    });

    if (!chat || !chat.isParticipant(userId)) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    // Update settings
    if (muteNotifications !== undefined) {
      chat.settings.muteNotifications = muteNotifications;
    }

    if (disappearingMessages) {
      if (disappearingMessages.enabled !== undefined) {
        chat.settings.disappearingMessages.enabled = disappearingMessages.enabled;
      }
      if (disappearingMessages.duration !== undefined) {
        chat.settings.disappearingMessages.duration = disappearingMessages.duration;
      }
    }

    await chat.save();

    res.json({
      message: 'Chat settings updated',
      settings: chat.settings
    });
  } catch (error) {
    console.error('Update chat settings error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Deactivate chat (soft delete)
const deactivateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findOne({
      _id: chatId,
      isActive: true
    });

    if (!chat || !chat.isParticipant(userId)) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    chat.isActive = false;
    await chat.save();

    res.json({ message: 'Chat deactivated successfully' });
  } catch (error) {
    console.error('Deactivate chat error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getAllConversations,
  markAsRead,
  deleteMessage,
  initializeChat,
  getChatById,
  addReaction,
  removeReaction,
  getChatMessages,
  updateChatActivity,
  updateChatSettings,
  deactivateChat,
  getOtherParticipant,
};