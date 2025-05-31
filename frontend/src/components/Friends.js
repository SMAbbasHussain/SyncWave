import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaUserPlus, FaUserFriends, FaPlus } from 'react-icons/fa';
import '../styles/Friends.css';

function Friends() {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [friends] = useState([
        { id: 1, username: 'John Doe', status: 'online', avatar: '/avatars/default.png' },
        { id: 2, username: 'Alice Smith', status: 'offline', avatar: '/avatars/default.png' },
        { id: 3, username: 'Robert Johnson', status: 'online', avatar: '/avatars/default.png' },
        // ... other friends
    ]);
    const searchInputRef = useRef(null);

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
                {friends.map(friend => (
                    <div key={friend.id} className="friend-item">
                        <div className="friend-avatar">
                            <img src={friend.avatar} alt={friend.username} />
                            <div className={`status-indicator ${friend.status}`} />
                        </div>
                        <div className="friend-info">
                            <span className="friend-username">{friend.username}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search Results - Only show when searching */}
            {isSearchActive && searchQuery.trim() !== "" && (
                <div className="search-results">
                    {filteredFriends.length > 0 ? (
                        filteredFriends.map(friend => (
                            <div key={friend.id} className="friend-item search-result">
                                <div className="friend-avatar">
                                    <img src={friend.avatar} alt={friend.username} />
                                    <div className={`status-indicator ${friend.status}`} />
                                </div>
                                <div className="friend-info">
                                    <span className="friend-username">{friend.username}</span>
                                </div>
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