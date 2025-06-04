import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes, FaUserCircle } from 'react-icons/fa';
import { IoChatbubbleEllipses } from 'react-icons/io5';
import '../styles/NewChatModal.css';

const NewChatModal = ({ isOpen, onClose, onStartChat, friends }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const searchInputRef = useRef(null);
    const modalRef = useRef(null);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Trap focus inside modal
            modalRef.current?.focus();
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

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

    const filteredFriends = friends.filter(friend =>
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStartChat = (friendId) => {
        onStartChat(friendId);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container" ref={modalRef} tabIndex="-1">
                <div className="modal-header">
                    <div className={`header-content ${isSearchActive ? 'search-active' : ''}`}>
                        <h2 className="header-title">Start New Chat</h2>
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

                <div className="modal-content">
                    <div className="friends-list">
                        {searchQuery.trim() === "" ? (
                            friends.map(friend => (
                                <div key={friend.id} className="friend-item">
                                    <div className="friend-info">
                                        <div className="friend-avatar">
                                            {friend.profilePic ? (
                                                <img src={friend.profilePic} alt={`${friend.username}'s avatar`} />
                                            ) : (
                                                <FaUserCircle className="avatar-icon" />
                                            )}
                                        </div>
                                        <span className="friend-username">{friend.username}</span>
                                    </div>
                                    <button
                                        className="start-chat-button"
                                        onClick={() => handleStartChat(friend.id)}
                                        title="Start Chat"
                                    >
                                        <IoChatbubbleEllipses className="chat-icon" />
                                    </button>
                                </div>
                            ))
                        ) : filteredFriends.length > 0 ? (
                            filteredFriends.map(friend => (
                                <div key={friend.id} className="friend-item">
                                    <div className="friend-info">
                                        <div className="friend-avatar">
                                            {friend.profilePicUrl ? (
                                                <img src={friend.profilePicUrl} alt={`${friend.username}'s avatar`} />
                                            ) : (
                                                <FaUserCircle className="avatar-icon" />
                                            )}
                                        </div>
                                        <span className="friend-username">{friend.username}</span>
                                    </div>
                                    <button
                                        className="start-chat-button"
                                        onClick={() => handleStartChat(friend.id)}
                                        title="Start Chat"
                                    >
                                        <IoChatbubbleEllipses className="chat-icon" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                No friends found matching "{searchQuery}"
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewChatModal; 