import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes, FaUserPlus, FaUserFriends, FaPlus, FaCheck, FaTimes as FaReject } from 'react-icons/fa';
import { FiUserPlus, FiUserCheck, FiUserX } from 'react-icons/fi';
import '../styles/FriendsAction.css';
import * as friendService from '../services/friendService';
import ConfirmationModal from './ConfirmationModal';

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
    const [showRejectConfirm, setShowRejectConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [requestToHandle, setRequestToHandle] = useState(null);
    const [fadingRequests, setFadingRequests] = useState(new Set());
    const [sendRequestError, setSendRequestError] = useState("");

    // Load friend requests when component mounts or tab changes
    useEffect(() => {
        if (activeBox === 'requests') {
            loadFriendRequests();
        }
    }, [activeBox, activeTab]);

    useEffect(() => {
        if (sendRequestError) {
            const timer = setTimeout(() => {
                setSendRequestError("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [sendRequestError]);

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
        setActiveBox(box);
        setSearchQuery("");
        setSearchResults([]);
        setSearchStatus("");
        setSendRequestError(""); // Clear error when changing boxes
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
            setSendRequestError(""); // Clear error when search query is empty
        }
    };

    const startFadeOut = (requestId) => {
        setFadingRequests(prev => new Set([...prev, requestId]));
        // Remove the item after animation completes
        setTimeout(() => {
            setFadingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }, 3000);
    };

    // Handle friend request actions
    const handleRequestAction = async (requestId, action) => {
        try {
            if (action === 'accept') {
                await friendService.acceptFriendRequest(requestId);
                startFadeOut(requestId);
                // Remove from received requests after animation
                setTimeout(() => {
                    setReceivedRequests(prev => prev.filter(req => req._id !== requestId));
                }, 3000);
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
            const newRequest = { _id: Date.now().toString(), receiver: user, status: 'pending' };
            setSentRequests(prev => [...prev, newRequest]);
            setSearchResults(prev => prev.filter(user => user._id !== userId));
            setSendRequestError("");
        } catch (error) {
            console.error("Failed to send friend request:", error);
            if (error.response && error.response.data) {
                setSendRequestError(error.response.data.message);
            } else {
                setSendRequestError("An error occurred. Please try again.");
            }
        }
    };

    const handleRejectClick = (requestId, username) => {
        setRequestToHandle({ id: requestId, username, type: 'reject' });
        setShowRejectConfirm(true);
    };

    const handleCancelClick = (requestId, username) => {
        setRequestToHandle({ id: requestId, username, type: 'cancel' });
        setShowCancelConfirm(true);
    };

    const handleConfirmReject = async () => {
        if (requestToHandle?.id) {
            try {
                await friendService.declineFriendRequest(requestToHandle.id);
                startFadeOut(requestToHandle.id);
                // Remove from received requests after animation
                setTimeout(() => {
                    setReceivedRequests(prev => prev.filter(req => req._id !== requestToHandle.id));
                }, 3000);
            } catch (error) {
                console.error('Failed to reject friend request:', error);
            }
        }
        setShowRejectConfirm(false);
        setRequestToHandle(null);
    };

    const handleConfirmCancel = async () => {
        if (requestToHandle?.id) {
            try {
                await friendService.cancelFriendRequest(requestToHandle.id);
                startFadeOut(requestToHandle.id);
                // Remove from sent requests after animation
                setTimeout(() => {
                    setSentRequests(prev => prev.filter(req => req._id !== requestToHandle.id));
                }, 3000);
            } catch (error) {
                console.error('Failed to cancel friend request:', error);
            }
        }
        setShowCancelConfirm(false);
        setRequestToHandle(null);
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
        <div
            key={request._id}
            className={`request-item ${fadingRequests.has(request._id) ? 'fade-out' : ''}`}
        >
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
                        onClick={() => handleRejectClick(request._id, request.sender.username)}
                        title="Reject request"
                    >
                        <FiUserX />
                    </button>
                </div>
            ) : (
                request.status === 'pending' && (
                    <button
                        className="reject-request"
                        onClick={() => handleCancelClick(request._id, request.receiver.username)}
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
                            {sendRequestError && (
                                <div className="friend-request-error">
                                    {sendRequestError}
                                </div>
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

            <ConfirmationModal
                isOpen={showRejectConfirm}
                message={`Are you sure you want to reject this friend request?`}
                onConfirm={handleConfirmReject}
                onClose={() => {
                    setShowRejectConfirm(false);
                    setRequestToHandle(null);
                }}
                confirmText="Reject"
                cancelText="Cancel"
            />

            <ConfirmationModal
                isOpen={showCancelConfirm}
                message={`Are you sure you want to cancel this friend request?`}
                onConfirm={handleConfirmCancel}
                onClose={() => {
                    setShowCancelConfirm(false);
                    setRequestToHandle(null);
                }}
                confirmText="Cancel Request"
                cancelText="Keep Request"
            />
        </div>
    );
}

export default FriendsAction; 