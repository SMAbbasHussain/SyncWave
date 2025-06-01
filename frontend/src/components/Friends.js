import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaUserPlus, FaUserFriends, FaPlus, FaUserMinus } from 'react-icons/fa';
import '../styles/Friends.css';
import * as friendService from '../services/friendService';

function Friends() {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
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

    const handleRemoveFriend = async (friendId) => {
        try {
            await friendService.removeFriend(friendId);
            setFriends(prevFriends => prevFriends.filter(friend => friend._id !== friendId));
        } catch (error) {
            console.error('Failed to remove friend:', error);
            setError('Failed to remove friend');
        }
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
                    friends.map(friend => (
                        <div key={friend._id} className="friend-item">
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
                                onClick={() => handleRemoveFriend(friend._id)}
                                title="Remove friend"
                            >
                                <FaUserMinus />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Search Results - Only show when searching */}
            {isSearchActive && searchQuery.trim() !== "" && (
                <div className="search-results">
                    {filteredFriends.length > 0 ? (
                        filteredFriends.map(friend => (
                            <div key={friend._id} className="friend-item search-result">
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
                                    onClick={() => handleRemoveFriend(friend._id)}
                                    title="Remove friend"
                                >
                                    <FaUserMinus />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            No friends found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Friends; 