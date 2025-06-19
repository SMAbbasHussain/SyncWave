// controllers/anonymousGroupController.js

// Change 'import' to 'const ... = require(...)'
const AnonymousGroup = require('../models/AnonymousGroup');

/**
 * @desc    Create a new anonymous group
 * @route   POST /api/anonymous-groups
 * @access  Public (or Private if you add auth middleware)
 */
const createGroup = async (req, res) => {
    try {
        const { name, description, category, photo } = req.body;

        if (!name || !category) {
            return res.status(400).json({ message: 'Group name and category are required.' });
        }

        const group = new AnonymousGroup({
            name,
            description,
            category,
            photo,
            isTemporary: false,
        });

        const createdGroup = await group.save();
        res.status(201).json(createdGroup);

    } catch (error) {
        console.error('Error creating group:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error while creating group.' });
    }
};

/**
 * @desc    Get all active anonymous groups
 * @route   GET /api/anonymous-groups
 * @access  Public
 */
const getAllGroups = async (req, res) => {
    try {
        const groups = await AnonymousGroup.find().sort({ createdAt: -1 });
        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Server error while fetching groups.' });
    }
};

/**
 * @desc    Delete an anonymous group by its ID
 * @route   DELETE /api/anonymous-groups/:id
 * @access  Private/Admin (You should protect this route)
 */
const deleteGroup = async (req, res) => {
    try {
        const group = await AnonymousGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        await group.deleteOne();
        res.status(200).json({ message: 'Group successfully deleted.' });

    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({ message: 'Server error while deleting group.' });
    }
};

const sendGroupMessage = async (req, res) => {
    try {

        const { content, groupId } = req.body;
        const currentUserId = req.user._id;
        const messagePayload = {
            content,
            groupId,
            senderId: currentUserId,
            timestamp: new Date()
        };

        // Emit to all connected clients
        if (req.io) {
            req.io.emit('newAnonymousGroupMessage', messagePayload);
        }

        // Optional: Add logic here to store the message in DB, etc.

        res.status(201).json({ message: 'Message sent successfully', data: messagePayload });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getGroupById = async (req, res) => {
    try {
        const group = await AnonymousGroup.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        res.status(200).json(group);
    } catch (error) {
        console.error('Error fetching group:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid group ID.' });
        }
        res.status(500).json({ message: 'Server error while fetching group.' });
    }
};

const leaveGroup = async (req, res) => {
    try {
        const groupId = req.params.id;

        // Atomically decrement the activeMembersCount and get the updated group
        // Using $inc is safer than a read-then-write to prevent race conditions.
        const updatedGroup = await AnonymousGroup.findByIdAndUpdate(
            groupId,
            { $inc: { activeMembersCount: -1 } },
            { new: true } // This option returns the document after the update
        );

        // If the group doesn't exist after trying to update, it was likely an invalid ID
        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found.' });
        }

        // Check if the group is empty and marked as temporary
        if (updatedGroup.activeMembersCount <= 0 && updatedGroup.isTemporary) {
            // The last member has left, so delete the group
            await updatedGroup.deleteOne();
            return res.status(200).json({
                message: 'Successfully left group. The group has been deleted as it was empty.',
                groupDeleted: true
            });
        }

        // If we reach here, the user left but the group still has members
        res.status(200).json({
            message: 'Successfully left the group.',
            groupDeleted: false
        });

    } catch (error) {
        console.error('Error leaving group:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid group ID.' });
        }
        res.status(500).json({ message: 'Server error while leaving group.' });
    }
};


// Change 'export' syntax to 'module.exports'
module.exports = {
    createGroup,
    getAllGroups,
    deleteGroup,
    sendGroupMessage,
    getGroupById,
    leaveGroup
};