const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const auth = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(auth);

// Friend request routes
router.post('/requests', friendController.sendFriendRequest);
router.post('/requests/:requestId/accept', friendController.acceptFriendRequest);
router.post('/requests/:requestId/decline', friendController.declineFriendRequest);
router.delete('/requests/:requestId', friendController.cancelFriendRequest);

// Friend management routes
router.delete('/:friendId', friendController.removeFriend);
router.get('/', friendController.getFriends);
router.get('/requests/incoming', friendController.getIncomingRequests);
router.get('/requests/outgoing', friendController.getOutgoingRequests);

module.exports = router; 