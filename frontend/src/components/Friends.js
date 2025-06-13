import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaUserPlus, FaUserFriends, FaPlus, FaUserMinus } from 'react-icons/fa';
import '../styles/Friends.css';
import * as friendService from '../services/friendService';
import ConfirmationModal from './ConfirmationModal';

function Friends() {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [friendToRemove, setFriendToRemove] = useState(null);
    const [fadingFriends, setFadingFriends] = useState(new Set());
    const searchInputRef = useRef(null);

    // Fetch friends list when component mounts
    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const friendsList = await friendService.getFriends();
            setFriends(friendsList);
        } catch (error) {
            console.error('Failed to load friends:', error);
            setError('Failed to load friends list');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFriendClick = (friendId, username) => {
        setFriendToRemove({ id: friendId, username });
        setShowConfirmModal(true);
    };

    const startFadeOut = (friendId) => {
        setFadingFriends(prev => new Set([...prev, friendId]));
        // Remove the item after animation completes
        setTimeout(() => {
            setFadingFriends(prev => {
                const newSet = new Set(prev);
                newSet.delete(friendId);
                return newSet;
            });
        }, 3000);
    };

    const handleConfirmRemove = async () => {
        if (friendToRemove) {
            try {
                await friendService.removeFriend(friendToRemove.id);
                startFadeOut(friendToRemove.id);
                // Remove from friends list after animation
                setTimeout(() => {
                    setFriends(prev => prev.filter(friend => friend._id !== friendToRemove.id));
                }, 3000);
            } catch (error) {
                console.error('Failed to remove friend:', error);
                setError('Failed to remove friend');
            }
        }
        setShowConfirmModal(false);
        setFriendToRemove(null);
    };

    const filteredFriends = friends.filter(friend =>
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const renderFriendItem = (friend) => (
        <div
            key={friend._id}
            className={`friend-item ${fadingFriends.has(friend._id) ? 'fade-out' : ''}`}
        >
            <div className="friend-avatar">
                <img
                    src={friend.profilePic || '/PFP2.png'}
                    alt={friend.username}
                />
                <div className={`status-indicator ${friend.status || 'offline'}`} />
            </div>
            <div className="friend-info">
                <span className="friend-username">{friend.username}</span>
            </div>
            <button
                className="remove-friend-button"
                onClick={() => handleRemoveFriendClick(friend._id, friend.username)}
                title="Remove friend"
            >
                <FaUserMinus />
            </button>
        </div>
    );

    if (error) {
        return (
            <div className="friends-container">
                <div className="error-message">
                    {error}
                    <button onClick={loadFriends} className="retry-button">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="friends-container">
            <div className="friends-top-bar">
                <div className="friends-header">
                    <div className={`header-content ${isSearchActive ? 'search-active' : ''}`}>
                        <h2>Friends List</h2>
                    </div>
                    <button
                        className={`search-toggle ${isSearchActive ? 'active' : ''}`}
                        onClick={toggleSearch}
                        aria-label="Toggle search"
                    >
                        <FaSearch />
                        <span className="search-label">Search</span>
                    </button>

                    <div className={`search-container ${isSearchActive ? 'active' : ''}`}>
                        <div className="search-bar">
                            <FaSearch className="search-icon search-icon-left" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search friends..."
                                value={searchQuery}
                                onChange={handleSearchChange}
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
                </div>
            </div>

            <div className="friends-list">
                {isLoading ? (
                    <div className="loading-message">Loading friends...</div>
                ) : friends.length === 0 ? (
                    <div className="no-friends-message">
                        No friends yet. Add some friends to start chatting!
                    </div>
                ) : (
                    friends.map(renderFriendItem)
                )}
            </div>

            {/* Search Results - Only show when searching */}
            {isSearchActive && searchQuery.trim() !== "" && (
                <div className="search-results">
                    {filteredFriends.length > 0 ? (
                        filteredFriends.map(renderFriendItem)
                    ) : (
                        <div className="no-results">
                            No friends found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            )}

            <ConfirmationModal
                isOpen={showConfirmModal}
                message={`Are you sure you want to remove ${friendToRemove?.username} from your friends?`}
                onConfirm={handleConfirmRemove}
                onClose={() => {
                    setShowConfirmModal(false);
                    setFriendToRemove(null);
                }}
                confirmText="Remove"
                cancelText="Cancel"
            />
        </div>
    );
}

export default Friends; 