import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes, FaUserPlus, FaUserFriends, FaPlus, FaCheck, FaTimes as FaReject } from 'react-icons/fa';
import { FiUserPlus, FiUserCheck, FiUserX } from 'react-icons/fi';
import '../styles/FriendsAction.css';

function FriendsAction() {
    // State for active box and tabs
    const [activeBox, setActiveBox] = useState(null); // 'addFriend' or 'requests'
    const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);

    // State for friend requests
    const [receivedRequests, setReceivedRequests] = useState([
        { id: 1, username: 'john_doe', avatar: '/avatars/default.png', status: 'pending' },
        { id: 2, username: 'jane_smith', avatar: '/avatars/default.png', status: 'pending' },
    ]);
    const [sentRequests, setSentRequests] = useState([
        { id: 3, username: 'alex_wilson', avatar: '/avatars/default.png', status: 'pending' },
        { id: 4, username: 'sarah_brown', avatar: '/avatars/default.png', status: 'rejected' },
    ]);

    // State for search results
    const [searchResults, setSearchResults] = useState([]);
    const [searchStatus, setSearchStatus] = useState(''); // 'notFound' or ''

    // Toggle between Add Friend and Requests boxes
    const toggleBox = (box) => {
        setActiveBox(activeBox === box ? null : box);
        setIsSearchActive(false);
        setSearchQuery('');
        setSearchResults([]);
        setSearchStatus('');
    };

    // Handle search toggle
    const toggleSearch = (e) => {
        e.stopPropagation();
        setIsSearchActive(!isSearchActive);
        if (!isSearchActive) {
            // Focus the input after a short delay to ensure the search container is rendered
            setTimeout(() => {
                if (searchInputRef.current) {
                    searchInputRef.current.focus();
                }
            }, 100);
        } else {
            setSearchQuery('');
            setSearchResults([]);
            setSearchStatus('');
        }
    };

    // Handle close search
    const handleCloseSearch = (e) => {
        e.stopPropagation();
        setIsSearchActive(false);
        setSearchQuery('');
        setSearchResults([]);
        setSearchStatus('');
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim()) {
            // Simulate API call to search users
            // In real app, this would be an API call
            const mockResults = [
                { id: 1, username: 'john_doe', avatar: '/avatars/default.png' },
                { id: 2, username: 'jane_smith', avatar: '/avatars/default.png' },
            ].filter(user =>
                user.username.toLowerCase().includes(query.toLowerCase())
            );

            if (mockResults.length === 0) {
                setSearchStatus('notFound');
                setSearchResults([]);
            } else {
                setSearchStatus('');
                setSearchResults(mockResults);
            }
        } else {
            setSearchResults([]);
            setSearchStatus('');
        }
    };

    // Handle friend request actions
    const handleRequestAction = (requestId, action) => {
        if (action === 'accept') {
            // In real app, this would be an API call
            setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
        } else if (action === 'reject') {
            // In real app, this would be an API call
            setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
        }
    };

    // Handle sending friend request
    const handleSendRequest = (userId) => {
        // In real app, this would be an API call
        const newRequest = {
            id: Date.now(),
            username: searchResults.find(user => user.id === userId).username,
            avatar: '/avatars/default.png',
            status: 'pending'
        };
        setSentRequests(prev => [...prev, newRequest]);
        setSearchResults(prev => prev.filter(user => user.id !== userId));
    };

    // Render search results
    const renderSearchResult = (user) => (
        <div key={user.id} className="search-result-item">
            <div className="friend-avatar">
                <img src={user.avatar} alt={user.username} />
            </div>
            <div className="friend-info">
                <span className="friend-username">{user.username}</span>
            </div>
            <button
                className="add-friend-icon"
                onClick={() => handleSendRequest(user.id)}
                title="Send friend request"
            >
                <FiUserPlus />
            </button>
        </div>
    );

    // Render friend request item
    const renderRequestItem = (request, type) => (
        <div key={request.id} className="request-item">
            <div className="friend-avatar">
                <img src={request.avatar} alt={request.username} />
            </div>
            <div className="friend-info">
                <span className="friend-username">{request.username}</span>
                {type === 'sent' && (
                    <span className={`request-status ${request.status}`}>
                        {request.status === 'pending' ? 'Pending' : 'Rejected'}
                    </span>
                )}
            </div>
            {type === 'received' && (
                <div className="request-actions">
                    <button
                        className="accept-request"
                        onClick={() => handleRequestAction(request.id, 'accept')}
                        title="Accept request"
                    >
                        <FiUserCheck />
                    </button>
                    <button
                        className="reject-request"
                        onClick={() => handleRequestAction(request.id, 'reject')}
                        title="Reject request"
                    >
                        <FiUserX />
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="friends-action-container">
            {/* Action Buttons */}
            <div className="action-buttons">
                <button
                    className={`action-button ${activeBox === 'addFriend' ? 'active' : ''}`}
                    onClick={() => toggleBox('addFriend')}
                >
                    <FaUserPlus />
                    <span>Add Friend</span>
                </button>
                <button
                    className={`action-button ${activeBox === 'requests' ? 'active' : ''}`}
                    onClick={() => toggleBox('requests')}
                >
                    <FaUserFriends />
                    <span>Friend Requests</span>
                </button>
            </div>

            {/* Add Friend Box */}
            {activeBox === 'addFriend' && (
                <div className="action-box">
                    <div className="action-box-header">
                        <div className={`header-content ${isSearchActive ? 'search-active' : ''}`}>
                            <h3>Add Friend</h3>
                            <button
                                type="button"
                                className={`search-toggle ${isSearchActive ? 'active' : ''}`}
                                onClick={toggleSearch}
                                aria-label={isSearchActive ? 'Close search' : 'Open search'}
                            >
                                <FaSearch />
                                <span>Search</span>
                            </button>
                        </div>
                        <div className={`search-container ${isSearchActive ? 'active' : ''}`}>
                            <div className="search-bar">
                                <FaSearch className="search-icon" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search by username..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    autoFocus
                                />
                                <button
                                    className="search-close-button"
                                    onClick={handleCloseSearch}
                                    aria-label="Close search"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        </div>
                    </div>

                    {isSearchActive && searchQuery && (
                        <div className="search-results-container">
                            {searchStatus === 'notFound' ? (
                                <div className="no-results">User is not registered</div>
                            ) : (
                                searchResults.map(renderSearchResult)
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Friend Requests Box */}
            {activeBox === 'requests' && (
                <div className="action-box">
                    <div className="action-box-header">
                        <h3>Friend Requests</h3>
                    </div>

                    <div className="request-tabs">
                        <button
                            className={`tab-button ${activeTab === 'received' ? 'active' : ''}`}
                            onClick={() => setActiveTab('received')}
                        >
                            Received
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
                            onClick={() => setActiveTab('sent')}
                        >
                            Sent
                        </button>
                    </div>

                    <div className="requests-list">
                        {activeTab === 'received' ? (
                            receivedRequests.length > 0 ? (
                                receivedRequests.map(request => renderRequestItem(request, 'received'))
                            ) : (
                                <div className="no-results">No received requests</div>
                            )
                        ) : (
                            sentRequests.length > 0 ? (
                                sentRequests.map(request => renderRequestItem(request, 'sent'))
                            ) : (
                                <div className="no-results">No sent requests</div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default FriendsAction; 