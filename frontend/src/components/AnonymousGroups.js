import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEye, FiEyeOff } from 'react-icons/fi';
import { IoFilterOutline } from 'react-icons/io5';
import CreateAnonymousGroupModal from './CreateAnonymousGroupModal';
import '../styles/AnonymousGroups.css';
import axios from 'axios';
import { FaUsers } from 'react-icons/fa';

const AnonymousGroups = ({ onChatSelect, onToggle, isVisible }) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.anon-category-container')) {
                setShowCategoryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/anonymous-groups`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setGroups(response.data);
            } catch (err) {
                console.error('Error fetching groups:', err);
            } finally {
            }
        };

        fetchGroups();
    }, []);



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
            onChatSelect(groupId);
        }
    };

    const handleCreateGroup = async (groupData) => {
        try {

            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/anonymous-groups`,
                {
                    name: groupData.title,
                    description: groupData.description,
                    photo: groupData.photo,
                    category: groupData.category
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data) {
                const newGroup = response.data;
                setGroups(prevGroups => [...prevGroups, newGroup]);
                setIsCreateModalOpen(false);
            } else {
                throw new Error('No data received from server');
            }

        } catch (err) {
            console.error('Error creating anonymous group:', err);
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
                                className={`anon-group-item ${selectedGroupId === group._id ? 'active' : ''}`}
                                onClick={() => handleAnonymousGroupClick(group._id)}
                            ><div className="group-pic">
                                    {group.photo ? (
                                        <img src={group.photo} alt={`${group.name}'s picture`} className="group-pic-img" />
                                    ) : (
                                        <FaUsers className="group-pic-icon" />
                                    )}
                                </div>
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