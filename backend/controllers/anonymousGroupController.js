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

// Change 'export' syntax to 'module.exports'
module.exports = {
    createGroup,
    getAllGroups,
    deleteGroup
};