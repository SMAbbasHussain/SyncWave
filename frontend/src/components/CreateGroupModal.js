import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaCheck, FaUser, FaSearch, FaTimes, FaImage } from 'react-icons/fa';
import '../styles/CreateGroupModal.css';

const CreateGroupModal = ({ isOpen, onClose, friends, onCreateGroup }) => {
    const [stage, setStage] = useState(1);
    const [groupTitle, setGroupTitle] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupImage, setGroupImage] = useState(null);
    const [selectedFriends, setSelectedFriends] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [filteredFriends, setFilteredFriends] = useState(friends || []);
    const searchInputRef = useRef(null);
    const modalRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (friends) {
            const filtered = friends.filter(friend =>
                friend.username.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredFriends(filtered);
        }
    }, [searchQuery, friends]);

    useEffect(() => {
        if (isOpen) {
            modalRef.current?.focus();
        }
    }, [isOpen]);

    const toggleSearch = () => {
        setIsSearchActive(!isSearchActive);
        if (!isSearchActive) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        } else {
            setSearchQuery('');
        }
    };

    const handleCloseSearch = (e) => {
        e.stopPropagation();
        setIsSearchActive(false);
        setSearchQuery('');
    };

    const handleFriendToggle = (friend, e) => {
        e.stopPropagation();
        setSelectedFriends(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(friend._id)) {
                newSelected.delete(friend._id);
            } else {
                newSelected.add(friend._id);
            }
            return newSelected;
        });
    };

    const handleContinue = () => {
        if (selectedFriends.size > 0) {
            setStage(2);
        }
    };

    const handleBack = () => {
        setStage(1);
    };

    const handleClose = () => {
        setStage(1);
        setGroupTitle('');
        setGroupDescription('');
        setGroupImage(null);
        setSelectedFriends(new Set());
        setSearchQuery('');
        setIsSearchActive(false);
        onClose();
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (stage === 2 && groupTitle.trim()) {
            try {
                let photoData = null;

                // If there's an image, convert it to base64
                if (groupImage) {
                    const reader = new FileReader();
                    photoData = await new Promise((resolve, reject) => {
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(groupImage);
                    });
                }

                // Create the group data in the format expected by the parent component
                const groupData = {
                    title: groupTitle.trim(),
                    description: groupDescription.trim(),
                    members: Array.from(selectedFriends),
                    photo: photoData
                };

                // Call the parent's onCreateGroup with the correct data format
                await onCreateGroup(groupData);
                handleClose();
            } catch (error) {
                console.error('Error processing group image:', error);
                // Still try to create the group without the image
                const groupData = {
                    title: groupTitle.trim(),
                    description: groupDescription.trim(),
                    members: Array.from(selectedFriends)
                };
                await onCreateGroup(groupData);
                handleClose();
            }
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setGroupImage(file);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && stage === 2 && isSaveEnabled) {
            handleCreateGroup(e);
        } else if (e.key === 'Escape') {
            handleClose();
        }
    };

    const isSaveEnabled = groupTitle.trim().length > 0;

    if (!isOpen) return null;

    return (
        <div className="create-group-modal-overlay" onClick={handleClose}>
            <div className="create-group-modal-container" onClick={e => e.stopPropagation()} ref={modalRef} tabIndex="-1" onKeyDown={handleKeyPress}>
                <div className="create-group-modal-header">
                    {stage === 1 ? (
                        <>
                            <div className={`header-content ${isSearchActive ? 'search-active' : ''}`}>
                                <h2 className="header-title">Create Group</h2>
                                <button
                                    className={`search-toggle ${isSearchActive ? 'active' : ''}`}
                                    onClick={toggleSearch}
                                    aria-label="Toggle search"
                                >
                                    <FaSearch />
                                    <span className="search-label">Search</span>
                                </button>
                            </div>
                            <div className={`search-container ${isSearchActive ? 'active' : ''}`}>
                                <div className="search-bar">
                                    <FaSearch className="search-icon search-icon-left" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search friends..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoComplete="off"
                                    />
                                    <button
                                        className="search-close-button"
                                        onClick={handleCloseSearch}
                                        aria-label="Close search"
                                    >
                                        <FaTimes className="search-icon" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="header-content">
                            <h2 className="header-title">Group Details</h2>
                        </div>
                    )}
                </div>

                <div className="create-group-modal-content">
                    {stage === 1 ? (
                        <>
                            <div className="create-group-friends-list">
                                {filteredFriends.map(friend => (
                                    <div
                                        key={friend._id}
                                        className="create-group-friend-item"
                                    >
                                        <div className="create-group-friend-info">
                                            <div className="create-group-friend-avatar">
                                                {friend.profilePic ? (
                                                    <img src={friend.profilePic} alt={friend.username} />
                                                ) : (
                                                    <FaUser className="avatar-icon" />
                                                )}
                                            </div>
                                            <span className="create-group-friend-username">{friend.username}</span>
                                        </div>
                                        <button
                                            className={`create-group-add-friend-button ${selectedFriends.has(friend._id) ? 'selected' : ''}`}
                                            onClick={(e) => handleFriendToggle(friend, e)}
                                            title={selectedFriends.has(friend._id) ? "Remove from group" : "Add to group"}
                                        >
                                            {selectedFriends.has(friend._id) ? <FaCheck /> : <FaPlus />}
                                        </button>
                                    </div>
                                ))}
                                {filteredFriends.length === 0 && (
                                    <div className="create-group-no-results">
                                        {searchQuery.trim() ? `No friends found matching "${searchQuery}"` : "No friends available"}
                                    </div>
                                )}
                            </div>
                            <button
                                className="create-group-continue-button"
                                onClick={handleContinue}
                                disabled={selectedFriends.size === 0}
                            >
                                Continue
                            </button>
                        </>
                    ) : (
                        <div className="create-group-details-form">
                            <div className="group-form-top">
                                <div className="group-image-upload" onClick={() => document.getElementById('group-image-input').click()}>
                                    {groupImage ? (
                                        <img src={URL.createObjectURL(groupImage)} alt="Group" className="group-image-preview" />
                                    ) : (
                                        <div className="group-image-placeholder">
                                            <FaImage className="group-image-icon" />
                                            <span>Add Group Image</span>
                                        </div>
                                    )}
                                    <input
                                        id="group-image-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setGroupImage(e.target.files[0])}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <div className="group-form-inputs">
                                    <div className="form-input-group">
                                        <label htmlFor="group-title">Group Title</label>
                                        <input
                                            id="group-title"
                                            type="text"
                                            placeholder="Enter group title"
                                            value={groupTitle}
                                            onChange={(e) => setGroupTitle(e.target.value)}
                                            className="group-title-input"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-input-group">
                                <label htmlFor="group-description">Description</label>
                                <textarea
                                    id="group-description"
                                    placeholder="Enter group description"
                                    value={groupDescription}
                                    onChange={(e) => setGroupDescription(e.target.value)}
                                    className="group-description-input"
                                />
                            </div>
                            <div className="group-form-buttons">
                                <button
                                    className="group-cancel-button"
                                    onClick={handleBack}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="group-save-button"
                                    onClick={handleCreateGroup}
                                    disabled={!groupTitle.trim()}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal; 