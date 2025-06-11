// models/AnonymousGroup.js

import mongoose from 'mongoose';

const anonymousGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Group name is required.'],
        trim: true,
        maxlength: [100, 'Group name cannot exceed 100 characters.']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Group description cannot exceed 500 characters.']
    },
    category: {
        type: String,
        required: [true, 'Group category is required.'],
        enum: [
            "Confessions & Secrets", "Emotional Support", "Random Chats", 
            "Deep Conversations", "Taboo Topics", "Unpopular Opinions", 
            "Dark Humor & Memes", "Story Sharing", "Voice Without Face", 
            "Adulting Struggles", "Other"
        ]
    },
    photo: {
        type: String, // Base64 data URI
        default: null
    },
    activeMembersCount: {
        type: Number,
        default: 0,
        min: 0
    },
    /**
     * NEW FIELD: Determines if the group should be automatically deleted
     * when the last member leaves.
     */
    isTemporary: {
        type: Boolean,
        default: true // Default to true for anonymous groups
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true
});

// Create an index on activeMembersCount to quickly find empty groups if needed.
anonymousGroupSchema.index({ activeMembersCount: 1, isTemporary: 1 });

const AnonymousGroup = mongoose.model('AnonymousGroup', anonymousGroupSchema);

export default AnonymousGroup;