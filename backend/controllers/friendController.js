const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const mongoose = require('mongoose');
const webpush = require('web-push');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Send a friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.userId;

    // Validate receiver ID
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }
    
    // Prevent self-friend request
    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    // Fetch both users to check their status and lists
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver || !sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // --- NEW: BLOCK CHECKS ---
    // Check if the sender has blocked the receiver
    if (sender.blockedUsers.includes(receiverId)) {
      return res.status(403).json({ message: 'You have blocked this user. Unblock them to send a friend request.' });
    }
    // Check if the receiver has blocked the sender
    if (receiver.blockedUsers.includes(senderId)) {
      // Use a generic message for privacy; don't reveal that the user was blocked.
      return res.status(403).json({ message: 'This user is not accepting friend requests.' });
    }
    // --- END NEW BLOCK CHECKS ---

    // Check if friendship already exists
    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({ message: 'You are already friends with this user.' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'A friend request already exists between you and this user.' });
    }

    // Create new friend request
    const friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId
    });

    await friendRequest.save();
     // --- 3. NOTIFICATION LOGIC ---
    if (req.io) {
      // A. Foreground (Toast) Notification
      const toastPayload = {
        type: 'friend_request_received',
        title: 'New Friend Request',
        body: `${sender.username} sent you a friend request.`,
        sender: { _id: sender._id, username: sender.username, profilePic: sender.profilePic }
      };
      req.io.to(receiverId.toString()).emit('notification', toastPayload);

      // B. Background (Push) Notification
      if (receiver.pushSubscriptions && receiver.pushSubscriptions.length > 0) {
        const pushPayload = JSON.stringify({
          title: 'New Friend Request',
          body: `${sender.username} sent you a friend request.`,
          icon: sender.profilePic || '/logo192.png',
          data: { url: '/homepage?nav=friends' } // Direct user to the friends tab
        });
        receiver.pushSubscriptions.forEach(sub => {
          webpush.sendNotification(sub, pushPayload).catch(error => console.error('Push error:', error.statusCode));
        });
      }
    }
    // --- END NOTIFICATION LOGIC ---
    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept a friend request
exports.acceptFriendRequest = async (req, res) => {
  // <<< START: CONDITIONAL TRANSACTION LOGIC >>>
  const isProduction = process.env.NODE_ENV === 'production';
  const session = isProduction ? await mongoose.startSession() : null;
  if (isProduction) {
    session.startTransaction();
  }
  // <<< END: CONDITIONAL TRANSACTION LOGIC >>>

  try {
    const { requestId } = req.params;
    const userId = req.userId; // This is the receiver

    const friendRequest = await FriendRequest.findById(requestId).session(session);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Verify the request is for the current user
    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    // Check if request is pending
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This friend request is no longer pending.' });
    }

    // --- NEW: BLOCK CHECKS ---
    const receiver = await User.findById(userId).session(session);
    const sender = await User.findById(friendRequest.sender).session(session);

    if (!sender || !receiver) {
      throw new Error('Could not find one or both users for the transaction.');
    }
    
    // Check if the receiver (current user) has blocked the sender
    if (receiver.blockedUsers.includes(sender._id)) {
      return res.status(403).json({ message: 'You have blocked this user. Unblock them to accept the request.' });
    }
    // Check if the sender has blocked the receiver
    if (sender.blockedUsers.includes(receiver._id)) {
      return res.status(403).json({ message: 'Cannot accept this request as the sender has blocked you.' });
    }
    // --- END NEW BLOCK CHECKS ---

    // Add each user to the other's friends array
    await User.findByIdAndUpdate(sender._id, { $addToSet: { friends: receiver._id } }, { session });
    await User.findByIdAndUpdate(receiver._id, { $addToSet: { friends: sender._id } }, { session });

    // Delete the friend request after accepting
    await FriendRequest.findByIdAndDelete(requestId, { session });
    
    // Commit the transaction
    await session.commitTransaction();

     // --- 4. NOTIFICATION LOGIC (AFTER a successful commit) ---
    if (req.io) {
        const originalSenderId = friendRequest.sender;

        // A. Foreground (Toast) Notification
        const toastPayload = {
            type: 'friend_request_accepted',
            title: 'Friend Request Accepted',
            body: `${receiver.username} accepted your friend request.`,
            sender: { _id: receiver._id, username: receiver.username, profilePic: receiver.profilePic }
        };
        req.io.to(originalSenderId.toString()).emit('notification', toastPayload);

        // B. Background (Push) Notification
        // We need to fetch the original sender again to get their subscriptions
        const originalSender = await User.findById(originalSenderId).select('pushSubscriptions');
        if (originalSender && originalSender.pushSubscriptions && originalSender.pushSubscriptions.length > 0) {
            const pushPayload = JSON.stringify({
                title: 'Friend Request Accepted!',
                body: `You are now friends with ${receiver.username}.`,
                icon: receiver.profilePic || '/logo192.png',
                data: { url: `/profile/${receiver._id}` } // Link to the new friend's profile
            });
            originalSender.pushSubscriptions.forEach(sub => {
                webpush.sendNotification(sub, pushPayload).catch(error => console.error('Push error:', error.statusCode));
            });
        }
    }
    // --- END NOTIFICATION LOGIC ---


    res.json({ message: 'Friend request accepted successfully.' });
  } catch (error) {
      console.error(error);

    // Abort transaction on error
    await session.abortTransaction();
    res.status(500).json({ message: 'An error occurred while accepting the request. Please try again.' });
  } finally {
    // End session
    session.endSession();
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

    // Delete the friend request after declining
    await FriendRequest.findByIdAndDelete(requestId);

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

    // Delete the friend request after cancelling
    await FriendRequest.findByIdAndDelete(requestId);
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

    // Remove each user from the other's friends array
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all friends of a user
exports.getFriends = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate('friends', 'username profilePic');
    res.json(user.friends);
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