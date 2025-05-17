const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// Conversation persistence endpoints
router.get('/conversation', authMiddleware, aiController.getConversation);
router.post('/conversation/save', authMiddleware, aiController.saveMessage);

// AI completion endpoints
router.post('/complete', authMiddleware, aiController.chatCompletion);
router.post('/complete/stream', authMiddleware, aiController.streamCompletion);

module.exports = router;