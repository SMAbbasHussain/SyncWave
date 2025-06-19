const webpush = require('web-push');
const User = require('../models/User');

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

const subscribe = async (req, res) => {
    try {
        const subscription = req.body;
        if (!subscription || !subscription.endpoint) {
            console.error('[SUB DEBUG] FAILED: Invalid subscription object.');
            return res.status(400).json({ error: 'Invalid subscription object provided.' });
        }

        const userId = req.user._id;
        if (!userId) {
            console.error('[SUB DEBUG] FAILED: User ID is missing. Check auth middleware.');
            return res.status(401).json({ error: 'Authentication failed.' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { pushSubscriptions: subscription } },
            { new: true } // Return the updated document
        );

    
        if (!updatedUser) {
            console.error(`[SUB DEBUG] FAILED: User not found with ID: ${userId}`);
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if the subscription was actually added
        if (updatedUser.pushSubscriptions && updatedUser.pushSubscriptions.length > 0) {
            console.log(`[SUB DEBUG] 5. SUCCESS! User now has ${updatedUser.pushSubscriptions.length} subscriptions.`);
        } else {
            console.warn(`[SUB DEBUG] 5. FAILED! The pushSubscriptions array is still empty after the update operation.`);
        }

        res.status(201).json({ message: 'Subscription processed.' });

    } catch (error) {
        console.error('[SUB DEBUG] FAILED: An unexpected error occurred in the try/catch block.');
        console.error(error);
        res.status(500).json({ error: 'Failed to save subscription.' });
    }
};

const getVapidPublicKey = (req, res) => {
    res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

const unsubscribe = async (req, res) => {
    try {
        // The endpoint is a unique identifier for a subscription.
        const { endpoint } = req.body;
        const userId = req.user.userId;

        if (!endpoint) {
            return res.status(400).json({ error: 'Subscription endpoint is required.' });
        }

        // Use $pull to remove the matching subscription object from the array.
        // We match based on the unique 'endpoint' property.
        await User.findByIdAndUpdate(userId, {
            $pull: { pushSubscriptions: { endpoint: endpoint } }
        });

        console.log(`[UNSUB] Subscription with endpoint ${endpoint.substring(0,30)}... removed for user ${userId}`);
        res.status(200).json({ message: 'Unsubscribed successfully.' });
        
    } catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({ error: 'Failed to unsubscribe.' });
    }
};

module.exports = {
    subscribe,
    getVapidPublicKey,
    unsubscribe
};