const express = require('express');
const router = express.Router();
const { subscribe, getVapidPublicKey, unsubscribe } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have this

router.post('/subscribe', authMiddleware, subscribe);
router.get('/vapid-public-key', getVapidPublicKey);
router.post('/unsubscribe', authMiddleware, unsubscribe);

module.exports = router;