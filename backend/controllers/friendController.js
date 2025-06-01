const FriendRequest = require('../models/FriendRequest');
const Friendship = require('../models/Friendship');
const User = require('../models/User');
const mongoose = require('mongoose');

// Send a friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.userId;

    // Validate receiver ID
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-friend request
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      users: { $all: [senderId, receiverId] }
    });
    if (existingFriendship) {
      return res.status(400).json({ message: 'Friendship already exists' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    // Create new friend request
    const friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId
    });

    await friendRequest.save();
    res.status(201).json(friendRequest);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Accept a friend request
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Verify the request is for the current user
    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    // Check if request is pending
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request is not pending' });
    }

    // Create friendship
    const friendship = new Friendship({
      users: [friendRequest.sender, friendRequest.receiver]
    });

    // Save request update first
    friendRequest.status = 'accepted';
    await friendRequest.save();

    try {
      // Try to save friendship
      await friendship.save();
    } catch (error) {
      // Roll back friendRequest status if friendship save fails
      friendRequest.status = 'pending';
      await friendRequest.save();
      throw new Error(error.message);
    }

    res.json({ message: 'Friend request accepted', friendship });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Decline a friend request
exports.declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Verify the request is for the current user
    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to decline this request' });
    }

    // Check if request is pending
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request is not pending' });
    }

    friendRequest.status = 'declined';
    await friendRequest.save();

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel a sent friend request
exports.cancelFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Verify the request was sent by the current user
    if (friendRequest.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this request' });
    }

    // Check if request is pending
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request is not pending' });
    }

    await friendRequest.deleteOne(); // ✅ Use this instead of remove()
    res.json({ message: 'Friend request cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a friend
exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.userId;

    // Validate friend ID
    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(400).json({ message: 'Invalid friend ID' });
    }

    const friendship = await Friendship.findOne({
      users: { $all: [userId, friendId] }
    });

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship not found' });
    }

    await friendship.deleteOne(); 
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all friends of a user
exports.getFriends = async (req, res) => {
  try {
    const userId = req.userId;

    const friendships = await Friendship.find({ users: userId })
      .populate('users', 'username profilePic');

    const friends = friendships.map(friendship => {
      const friend = friendship.users.find(user => user._id.toString() !== userId.toString());
      return friend;
    });

    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all incoming friend requests
exports.getIncomingRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await FriendRequest.find({
      receiver: userId,
      status: 'pending'
    }).populate('sender', 'username profilePic');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all outgoing friend requests
exports.getOutgoingRequests = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await FriendRequest.find({
      sender: userId,
      status: 'pending'
    }).populate('receiver', 'username profilePic');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 