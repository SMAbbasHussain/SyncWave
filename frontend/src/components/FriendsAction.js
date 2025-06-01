import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes, FaUserPlus, FaUserFriends, FaPlus, FaCheck, FaTimes as FaReject } from 'react-icons/fa';
import { FiUserPlus, FiUserCheck, FiUserX } from 'react-icons/fi';
import '../styles/FriendsAction.css';
import * as friendService from '../services/friendService';

function FriendsAction() {
    // State for active box and tabs
    const [activeBox, setActiveBox] = useState(null); // 'addFriend' or 'requests'
    const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);

    // State for friend requests
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchStatus, setSearchStatus] = useState(''); // 'notFound' or ''
    const [isLoading, setIsLoading] = useState(false);

    // Load friend requests when component mounts or tab changes
    useEffect(() => {
        if (activeBox === 'requests') {
            loadFriendRequests();
        }
    }, [activeBox, activeTab]);

    // Load friend requests
    const loadFriendRequests = async () => {
        try {
            setIsLoading(true);
            if (activeTab === 'received') {
                const requests = await friendService.getIncomingRequests();
                setReceivedRequests(requests);
            } else {
                const requests = await friendService.getOutgoingRequests();
                setSentRequests(requests);
            }
        } catch (error) {
            console.error('Failed to load friend requests:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim()) {
            try {
                const results = await friendService.searchUsers(query);
                if (results.length === 0) {
                    setSearchStatus('notFound');
                    setSearchResults([]);
                } else {
                    setSearchStatus('');
                    setSearchResults(results);
                }
            } catch (error) {
                console.error('Failed to search users:', error);
                setSearchStatus('error');
                setSearchResults([]);
            }
        } else {
            setSearchResults([]);
            setSearchStatus('');
        }
    };

    // Handle friend request actions
    const handleRequestAction = async (requestId, action) => {
        try {
            if (action === 'accept') {
                await friendService.acceptFriendRequest(requestId);
                setReceivedRequests(prev => prev.filter(req => req._id !== requestId));
            } else if (action === 'reject') {
                await friendService.declineFriendRequest(requestId);
                setReceivedRequests(prev => prev.filter(req => req._id !== requestId));
            } else if (action === 'cancel') {
                await friendService.cancelFriendRequest(requestId);
                setSentRequests(prev => prev.filter(req => req._id !== requestId));
            }
        } catch (error) {
            console.error('Failed to process friend request:', error);
        }
    };

    // Handle sending friend request
    const handleSendRequest = async (userId) => {
        try {
            await friendService.sendFriendRequest(userId);
            const user = searchResults.find(user => user._id === userId);
            const newRequest = {
                _id: Date.now().toString(), // Temporary ID
                receiver: user,
                status: 'pending'
            };
            setSentRequests(prev => [...prev, newRequest]);
            setSearchResults(prev => prev.filter(user => user._id !== userId));
        } catch (error) {
            console.error('Failed to send friend request:', error);
        }
    };

    // Render search results
    const renderSearchResult = (user) => (
        <div key={user._id} className="search-result-item">
            <div className="friend-avatar">
                <img src={user.profilePic || '/PFP.png'} alt={user.username} />
            </div>
            <div className="friend-info">
                <span className="friend-username">{user.username}</span>
            </div>
            <button
                className="add-friend-icon"
                onClick={() => handleSendRequest(user._id)}
                title="Send friend request"
            >
                <FiUserPlus />
            </button>
        </div>
    );

    // Render friend request item
    const renderRequestItem = (request, type) => (
        <div key={request._id} className="request-item">
            <div className="friend-avatar">
                <img 
                    src={type === 'received' ? request.sender.profilePic : request.receiver.profilePic || '/PFP.png'} 
                    alt={type === 'received' ? request.sender.username : request.receiver.username} 
                />
            </div>
            <div className="friend-info">
                <span className="friend-username">
                    {type === 'received' ? request.sender.username : request.receiver.username}
                </span>
                {type === 'sent' && (
                    <span className={`request-status ${request.status}`}>
                        {request.status === 'pending' ? 'Pending' : 'Rejected'}
                    </span>
                )}
            </div>
            {type === 'received' ? (
                <div className="request-actions">
                    <button
                        className="accept-request"
                        onClick={() => handleRequestAction(request._id, 'accept')}
                        title="Accept request"
                    >
                        <FiUserCheck />
                    </button>
                    <button
                        className="reject-request"
                        onClick={() => handleRequestAction(request._id, 'reject')}
                        title="Reject request"
                    >
                        <FiUserX />
                    </button>
                </div>
            ) : (
                request.status === 'pending' && (
                    <button
                        className="reject-request"
                        onClick={() => handleRequestAction(request._id, 'cancel')}
                        title="Cancel request"
                    >
                        <FiUserX />
                    </button>
                )
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
                        {isLoading ? (
                            <div className="no-results">Loading...</div>
                        ) : activeTab === 'received' ? (
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