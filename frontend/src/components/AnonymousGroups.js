import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import { IoFilterOutline } from 'react-icons/io5';
import CreateAnonymousGroupModal from './CreateAnonymousGroupModal';
import '../styles/AnonymousGroups.css';

const AnonymousGroups = ({ onChatSelect, onToggle, isVisible }) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.anon-category-container')) {
                setShowCategoryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [groups, setGroups] = useState([
        { id: 1, name: "Whisper Circle #1", members: 15, category: "Confessions & Secrets" },
        { id: 2, name: "Tech Hub Connect", members: 8, category: "Random Chats" },
        { id: 3, name: "Movie Buffs Anonymous", members: 12, category: "Dark Humor & Memes" },
        { id: 4, name: "Study Squad Alpha", members: 20, category: "Adulting Struggles" },
        { id: 5, name: "Music Makers Unite", members: 10, category: "Voice Without Face" },
        { id: 6, name: "Fitness Warriors", members: 25, category: "Emotional Support" },
        { id: 7, name: "Code Masters", members: 18, category: "Deep Conversations" },
        { id: 8, name: "Book Club Secret", members: 14, category: "Story Sharing" },
        { id: 9, name: "Gaming League X", members: 30, category: "Random Chats" },
        { id: 10, name: "Health & Wellness Circle", members: 22, category: "Emotional Support" },
        { id: 11, name: "Travel Tales", members: 16, category: "Story Sharing" },
        { id: 12, name: "Business Innovators", members: 19, category: "Adulting Struggles" },
        { id: 13, name: "Family Connect", members: 13, category: "Deep Conversations" },
        { id: 14, name: "Sports Talk Anonymous", members: 28, category: "Random Chats" },
        { id: 15, name: "Movie Critics Circle", members: 17, category: "Dark Humor & Memes" }
    ]);

    const categories = [
        "Confessions & Secrets",
        "Emotional Support",
        "Random Chats",
        "Deep Conversations",
        "Taboo Topics",
        "Unpopular Opinions",
        "Dark Humor & Memes",
        "Story Sharing",
        "Voice Without Face",
        "Adulting Struggles",
        "Other"
    ];

    const handleRefresh = () => {
        const shuffled = [...groups].sort(() => Math.random() - 0.5);
        setGroups(shuffled);
    };

    const toggleContainer = () => {
        if (onToggle) {
            onToggle(!isVisible);
        }
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setShowCategoryDropdown(false);
    };

    const handleAnonymousGroupClick = (groupId) => {
        setSelectedGroupId(groupId);
        if (onChatSelect) {
            onChatSelect('anonymousGroup', groupId);
        }
    };

    const handleCreateGroup = async (groupData) => {
        try {
            // TODO: Replace with actual API call
            console.log('Creating anonymous group with data:', groupData);
            // Mock implementation - in real app, this would be an API call
            const newGroup = {
                id: Date.now(),
                name: groupData.title,
                members: 1,
                category: groupData.category
            };
            setGroups(prevGroups => [...prevGroups, newGroup]);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Error creating anonymous group:', error);
        }
    };

    const filteredGroups = selectedCategory
        ? groups.filter(group => group.category === selectedCategory)
        : groups;

    return (
        <div className="anon-groups-wrapper">
            <div className="anon-groups-toggle-button" onClick={toggleContainer}>
                <div className="anon-groups-button-content">
                    <span className="anon-groups-text">Anonymous Groups</span>
                    {isVisible ? <FiEyeOff className="anon-groups-icon" /> : <FiEye className="anon-groups-icon" />}
                </div>
            </div>

            {isVisible && (
                <div className="anon-groups-container visible">
                    <div className="anon-groups-header">
                        <h2>Anonymous Groups</h2>
                        <div className="anon-groups-actions">
                            <div className="anon-category-container">
                                <button
                                    className="anon-action-btn category-btn"
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    title="Filter by Category"
                                >
                                    <IoFilterOutline className="action-icon" />
                                </button>
                                {showCategoryDropdown && (
                                    <div className="anon-category-dropdown">
                                        <div
                                            className="category-option"
                                            onClick={() => handleCategorySelect('')}
                                        >
                                            All Categories
                                        </div>
                                        {categories.map(category => (
                                            <div
                                                key={category}
                                                className="category-option"
                                                onClick={() => handleCategorySelect(category)}
                                            >
                                                {category}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                className="anon-action-btn create-btn"
                                title="Create New Group"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                <FiPlus className="action-icon" />
                            </button>
                        </div>
                    </div>

                    <div className={`anon-groups-list ${showCategoryDropdown ? 'dropdown-visible' : ''}`}>
                        {filteredGroups.map(group => (
                            <div
                                key={group.id}
                                className={`anon-group-item ${selectedGroupId === group.id ? 'active' : ''}`}
                                onClick={() => handleAnonymousGroupClick(group.id)}
                            >
                                <div className="anon-group-info">
                                    <span className="anon-group-name">{group.name}</span>
                                    <span className="anon-group-members">{group.members} members</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <CreateAnonymousGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreateGroup={handleCreateGroup}
            />
        </div>
    );
};

export default AnonymousGroups; 