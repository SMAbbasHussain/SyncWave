import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaCheck, FaUser, FaSearch } from 'react-icons/fa';
import '../styles/CreateGroupModal.css';

const CreateGroupModal = ({ isOpen, onClose, friends, onCreateGroup }) => {
    const [groupTitle, setGroupTitle] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [selectedFriends, setSelectedFriends] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFriends, setFilteredFriends] = useState(friends || []);
    const searchInputRef = useRef(null);

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
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleFriendToggle = (friendId, e) => {
        e.stopPropagation();
        setSelectedFriends(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(friendId)) {
                newSelected.delete(friendId);
            } else {
                newSelected.add(friendId);
            }
            return newSelected;
        });
    };

    const handleCreateGroup = (e) => {
        e.preventDefault();
        if (groupTitle.trim() && selectedFriends.size > 0) {
            onCreateGroup({
                title: groupTitle.trim(),
                description: groupDescription.trim(),
                members: Array.from(selectedFriends)
            });
            handleClose();
        }
    };

    const handleClose = () => {
        setGroupTitle('');
        setGroupDescription('');
        setSelectedFriends(new Set());
        setSearchQuery('');
        onClose();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && isSaveEnabled) {
            handleCreateGroup(e);
        } else if (e.key === 'Escape') {
            handleClose();
        }
    };

    const isSaveEnabled = groupTitle.trim() && selectedFriends.size > 0;

    if (!isOpen) return null;

    return (
        <div className="create-group-modal-overlay" onClick={handleClose}>
            <div className="create-group-modal-container" onClick={e => e.stopPropagation()}>
                <div className="create-group-modal-header">
                    <h2 className="create-group-header-title">Create Group</h2>
                </div>

                <div className="create-group-modal-content">
                    {/* Left Section - Group Info */}
                    <div className="create-group-info-section">
                        <div className="create-group-profile">
                            <div className="create-group-profile-image">
                                <FaUser />
                            </div>
                        </div>

                        <form onSubmit={handleCreateGroup} onKeyDown={handleKeyPress}>
                            <div className="create-group-input-group">
                                <label htmlFor="groupTitle">Group Title</label>
                                <input
                                    id="groupTitle"
                                    type="text"
                                    value={groupTitle}
                                    onChange={(e) => setGroupTitle(e.target.value)}
                                    placeholder="Enter group title"
                                    maxLength={50}
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            <div className="create-group-input-group">
                                <label htmlFor="groupDescription">Group Description</label>
                                <textarea
                                    id="groupDescription"
                                    value={groupDescription}
                                    onChange={(e) => setGroupDescription(e.target.value)}
                                    placeholder="Enter group description"
                                    maxLength={200}
                                    autoComplete="off"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Right Section - Friends List */}
                    <div className="create-group-friends-section">
                        <h3 className="create-group-section-title">Add users to Group</h3>
                        <div className="create-group-friends-search">
                            <FaSearch />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search friends..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                        <div className="create-group-friends-list">
                            {filteredFriends.map(friend => (
                                <div
                                    key={friend.id}
                                    className="create-group-friend-item"
                                    onClick={(e) => handleFriendToggle(friend.id, e)}
                                >
                                    <div className="create-group-friend-info">
                                        <div className="create-group-friend-avatar">
                                            {friend.avatar ? (
                                                <img src={friend.avatar} alt={friend.username} />
                                            ) : (
                                                <FaUser />
                                            )}
                                        </div>
                                        <span className="create-group-friend-username">{friend.username}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className={`create-group-add-friend-button ${selectedFriends.has(friend.id) ? 'selected' : ''}`}
                                        onClick={(e) => handleFriendToggle(friend.id, e)}
                                        aria-label={selectedFriends.has(friend.id) ? 'Remove from group' : 'Add to group'}
                                    >
                                        {selectedFriends.has(friend.id) ? <FaCheck /> : <FaPlus />}
                                    </button>
                                </div>
                            ))}
                            {filteredFriends.length === 0 && (
                                <div className="create-group-no-results">
                                    {searchQuery ? 'No friends found matching your search' : 'No friends available'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="create-group-modal-footer">
                    <button
                        type="button"
                        className="create-group-modal-button create-group-cancel-button"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="create-group-modal-button create-group-save-button"
                        onClick={handleCreateGroup}
                        disabled={!isSaveEnabled}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal; 