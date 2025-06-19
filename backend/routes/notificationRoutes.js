const express = require('express');
const router = express.Router();
const { subscribe, getVapidPublicKey } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have this

router.post('/subscribe', authMiddleware, subscribe);
router.get('/vapid-public-key', getVapidPublicKey);

module.exports = router;