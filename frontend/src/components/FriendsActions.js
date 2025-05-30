import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes, FaPlus, FaCheck, FaTimes as FaReject } from 'react-icons/fa';
import '../styles/FriendsActions.css';

function FriendsActions({ panelType, onClose, friendsList }) {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [activeTab, setActiveTab] = useState('received');
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const searchInputRef = useRef(null);

    // Simulated friend requests data
    useEffect(() => {
        if (panelType === 'requests') {
            // Simulate received requests
            setReceivedRequests([
                { id: 1, username: 'john_doe', avatar: '/avatars/default.png', status: 'pending' },
                { id: 2, username: 'jane_smith', avatar: '/avatars/default.png', status: 'pending' },
            ]);
            // Simulate sent requests
            setSentRequests([
                { id: 3, username: 'alex_wilson', avatar: '/avatars/default.png', status: 'pending' },
                { id: 4, username: 'sarah_brown', avatar: '/avatars/default.png', status: 'rejected' },
            ]);
        }
    }, [panelType]);

    const toggleSearch = () => {
        setIsSearchActive(!isSearchActive);
        if (!isSearchActive) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        } else {
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim()) {
            // Simulate API call to search users
            // In real app, this would be an API call
            const results = [
                { id: 101, username: 'new_user1', avatar: '/avatars/default.png' },
                { id: 102, username: 'new_user2', avatar: '/avatars/default.png' },
            ].filter(user =>
                user.username.toLowerCase().includes(query.toLowerCase()) &&
                !friendsList.some(friend => friend.id === user.id)
            );
            setSearchResults(results.slice(0, 10));
        } else {
            setSearchResults([]);
        }
    };

    const handleAddFriend = (userId) => {
        // Simulate sending friend request
        console.log('Sending friend request to:', userId);
        // In real app, this would be an API call
        setSearchResults(prev =>
            prev.map(user =>
                user.id === userId
                    ? { ...user, requestSent: true }
                    : user
            )
        );
    };

    const handleRequestAction = (requestId, action) => {
        if (action === 'accept') {
            // Simulate accepting request
            console.log('Accepting request:', requestId);
            setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
        } else {
            // Simulate rejecting request
            console.log('Rejecting request:', requestId);
            setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
        }
    };

    const renderAddFriendPanel = () => (
        <div className="add-friend-panel">
            <div className="panel-header">
                <h3>Add Friend</h3>
                <button
                    className={`search-toggle ${isSearchActive ? 'active' : ''}`}
                    onClick={toggleSearch}
                >
                    <FaSearch />
                    <span>Search</span>
                </button>
            </div>

            {isSearchActive && (
                <div className="search-container">
                    <div className="search-bar">
                        <FaSearch className="search-icon search-icon-left" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        <button
                            className="search-close-button"
                            onClick={() => {
                                setIsSearchActive(false);
                                setSearchQuery('');
                                setSearchResults([]);
                            }}
                        >
                            <FaTimes className="search-icon" />
                        </button>
                    </div>
                </div>
            )}

            <div className="search-results">
                {searchResults.length > 0 ? (
                    searchResults.map(user => (
                        <div key={user.id} className="friend-item search-result">
                            <div className="friend-avatar">
                                <img src={user.avatar} alt={user.username} />
                            </div>
                            <div className="friend-info">
                                <span className="friend-username">{user.username}</span>
                            </div>
                            <button
                                className={`add-friend-button ${user.requestSent ? 'sent' : ''}`}
                                onClick={() => !user.requestSent && handleAddFriend(user.id)}
                                disabled={user.requestSent}
                            >
                                {user.requestSent ? <FaCheck /> : <FaPlus />}
                            </button>
                        </div>
                    ))
                ) : searchQuery ? (
                    <div className="no-results">No account found</div>
                ) : (
                    <div className="placeholder-text">
                        Search for users to add as friends
                    </div>
                )}
            </div>
        </div>
    );

    const renderRequestsPanel = () => (
        <div className="requests-panel">
            <div className="panel-header">
                <h3>Friend Requests</h3>
            </div>

            <div className="requests-tabs">
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

            <div className="requests-content">
                {activeTab === 'received' ? (
                    receivedRequests.length > 0 ? (
                        receivedRequests.map(request => (
                            <div key={request.id} className="friend-item request-item">
                                <div className="friend-avatar">
                                    <img src={request.avatar} alt={request.username} />
                                </div>
                                <div className="friend-info">
                                    <span className="friend-username">{request.username}</span>
                                </div>
                                <div className="request-actions">
                                    <button
                                        className="accept-button"
                                        onClick={() => handleRequestAction(request.id, 'accept')}
                                    >
                                        <FaCheck />
                                    </button>
                                    <button
                                        className="reject-button"
                                        onClick={() => handleRequestAction(request.id, 'reject')}
                                    >
                                        <FaReject />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="placeholder-text">No pending friend requests</div>
                    )
                ) : (
                    sentRequests.length > 0 ? (
                        sentRequests.map(request => (
                            <div key={request.id} className="friend-item request-item">
                                <div className="friend-avatar">
                                    <img src={request.avatar} alt={request.username} />
                                </div>
                                <div className="friend-info">
                                    <span className="friend-username">{request.username}</span>
                                    <span className={`request-status ${request.status}`}>
                                        {request.status === 'pending' ? 'Pending' : 'Rejected'}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="placeholder-text">No sent friend requests</div>
                    )
                )}
            </div>
        </div>
    );

    return (
        <div className="friends-actions-container">
            {panelType === 'add-friend' ? renderAddFriendPanel() : renderRequestsPanel()}
        </div>
    );
}

export default FriendsActions; 