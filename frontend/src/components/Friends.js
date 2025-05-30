import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaUserPlus, FaUserFriends } from 'react-icons/fa';
import FriendsActions from './FriendsActions';
import '../styles/Friends.css';

function Friends() {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [allFriends, setAllFriends] = useState([]); // Store all friends
    const [displayedFriends, setDisplayedFriends] = useState([]); // Friends currently displayed
    const [visibleFriendsCount, setVisibleFriendsCount] = useState(10); // Number of friends to show at once (5x2 grid)
    const [activePanel, setActivePanel] = useState(null); // 'add-friend' or 'requests' or null
    const searchInputRef = useRef(null);
    const rotationIntervalRef = useRef(null);

    useEffect(() => {
        // Simulated friends data
        const fetchedFriends = [
            { id: 1, username: 'john_doe', avatar: '/avatars/default.png', status: 'online' },
            { id: 2, username: 'jane_smith', avatar: '/avatars/default.png', status: 'offline' },
            { id: 3, username: 'alex_wilson', avatar: '/avatars/default.png', status: 'online' },
            { id: 4, username: 'sarah_brown', avatar: '/avatars/default.png', status: 'offline' },
            { id: 5, username: 'mike_johnson', avatar: '/avatars/default.png', status: 'online' },
            { id: 6, username: 'sarah_parker', avatar: '/avatars/default.png', status: 'online' },
            { id: 7, username: 'david_jones', avatar: '/avatars/default.png', status: 'offline' },
            { id: 8, username: 'emily_watson', avatar: '/avatars/default.png', status: 'online' },
            { id: 9, username: 'chris_green', avatar: '/avatars/default.png', status: 'online' },
            { id: 10, username: 'patricia_white', avatar: '/avatars/default.png', status: 'offline' },
            { id: 11, username: 'michael_black', avatar: '/avatars/default.png', status: 'online' },
            { id: 12, username: 'olivia_grey', avatar: '/avatars/default.png', status: 'offline' },
            { id: 13, username: 'james_blue', avatar: '/avatars/default.png', status: 'online' },
            { id: 14, username: 'sophia_red', avatar: '/avatars/default.png', status: 'offline' },
            { id: 15, username: 'daniel_yellow', avatar: '/avatars/default.png', status: 'online' },
            { id: 16, username: 'ava_purple', avatar: '/avatars/default.png', status: 'offline' },
            { id: 17, username: 'ethan_orange', avatar: '/avatars/default.png', status: 'online' },
            { id: 18, username: 'mia_pink', avatar: '/avatars/default.png', status: 'offline' },
            { id: 19, username: 'jacob_brown', avatar: '/avatars/default.png', status: 'online' },
            { id: 20, username: 'isabella_teal', avatar: '/avatars/default.png', status: 'offline' },
            { id: 21, username: 'william_cyan', avatar: '/avatars/default.png', status: 'online' },
            { id: 22, username: 'sophie_magenta', avatar: '/avatars/default.png', status: 'offline' },
            { id: 23, username: 'alexander_lime', avatar: '/avatars/default.png', status: 'online' },
            { id: 24, username: 'chloe_violet', avatar: '/avatars/default.png', status: 'offline' },
            { id: 25, username: 'benjamin_gold', avatar: '/avatars/default.png', status: 'online' },
            { id: 26, username: 'lily_silver', avatar: '/avatars/default.png', status: 'offline' },
        ];
        setAllFriends(fetchedFriends);
        setDisplayedFriends(fetchedFriends.slice(0, visibleFriendsCount));

    }, []);

    // Start rotation animation when friends data is loaded and search is not active
    useEffect(() => {
        if (allFriends.length > visibleFriendsCount && !isSearchActive && !searchQuery) {
            startRotationAnimation();
        } else {
            stopRotationAnimation();
            // If search is active, handle displaying search results (capped at 10) or 'not found' message
            if (isSearchActive && searchQuery) {
                handleSearchChange({ target: { value: searchQuery } }); // Re-filter if search is active
            } else if (!isSearchActive && allFriends.length > 0) {
                setDisplayedFriends(allFriends.slice(0, visibleFriendsCount)); // Show initial set if not searching
            } else if (!isSearchActive && allFriends.length === 0) {
                setDisplayedFriends([]);
            }
        }

        return () => { // Cleanup on effect re-run or component unmount
            stopRotationAnimation();
        };
    }, [allFriends, visibleFriendsCount, isSearchActive, searchQuery]); // Depend on allFriends, count, and search state

    const startRotationAnimation = () => {
        if (rotationIntervalRef.current) return; // Prevent multiple intervals

        rotationIntervalRef.current = setInterval(() => {
            setDisplayedFriends(prevDisplayedFriends => {
                // Find the index of the first currently displayed friend in the full list
                const firstDisplayedIndex = allFriends.findIndex(friend => friend.id === prevDisplayedFriends[0]?.id);
                // Calculate the starting index for the next set of displayed friends
                const nextStartIndex = (firstDisplayedIndex + visibleFriendsCount) % allFriends.length;
                // Get the next set of friends, wrapping around if necessary
                const rotatedFriends = [];
                for (let i = 0; i < visibleFriendsCount; i++) {
                    rotatedFriends.push(allFriends[(nextStartIndex + i) % allFriends.length]);
                }
                return rotatedFriends;
            });
        }, 7000); // Rotate every 7 seconds
    };

    const stopRotationAnimation = () => {
        if (rotationIntervalRef.current) {
            clearInterval(rotationIntervalRef.current);
            rotationIntervalRef.current = null;
        }
    };

    const toggleSearch = () => {
        setIsSearchActive(!isSearchActive);
        if (!isSearchActive) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        } else {
            setSearchQuery('');
            // When closing search, show the initial set of friends
            setDisplayedFriends(allFriends.slice(0, visibleFriendsCount));
        }
    };

    const handleCloseSearch = (e) => {
        e.stopPropagation();
        setIsSearchActive(false);
        setSearchQuery('');
        // When closing search, show the initial set of friends
        setDisplayedFriends(allFriends.slice(0, visibleFriendsCount));
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim()) {
            // Filter from the complete list of friends
            const filteredResults = allFriends.filter(friend =>
                friend.username.toLowerCase().includes(query.toLowerCase())
            );
            // Limit results to a maximum of 10
            setDisplayedFriends(filteredResults.slice(0, 10));
        } else {
            // If search is empty, show the initial set of friends
            setDisplayedFriends(allFriends.slice(0, visibleFriendsCount));
        }
    };

    const togglePanel = (panel) => {
        setActivePanel(activePanel === panel ? null : panel);
        // Reset search when closing panels
        if (activePanel === panel) {
            setIsSearchActive(false);
            setSearchQuery('');
        }
    };

    // Render friend item
    const renderFriendItem = (friend, isSearchResult = false) => (
        <div key={friend.id} className={`friend-item ${isSearchResult ? 'search-result' : ''}`}>
            <div className="friend-avatar">
                <img src={friend.avatar} alt={friend.username} />
                <span className={`status-indicator ${friend.status}`}></span>
            </div>
            <div className="friend-info">
                <span className="friend-username">{friend.username}</span>
            </div>
        </div>
    );

    return (
        <div className="friends-container">
            {/* Top Bar with Search */}
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

            {/* Main Content Area */}
            <div className="friends-content">
                {/* Left Section - Friends List */}
                <div className="friends-list-section">
                    {displayedFriends.length > 0 ? (
                        <div className="friends-list">
                            {displayedFriends.map(friend => renderFriendItem(friend))}
                        </div>
                    ) : searchQuery ? (
                        <div className="no-results">User not found in Friends List</div>
                    ) : (
                        <div className="placeholder-text">No friends yet.</div>
                    )}
                </div>

                {/* Right Section - Action Buttons and Panels */}
                <div className="friends-actions-section">
                    {/* Action Buttons Row */}
                    <div className="friends-action-buttons">
                        <button
                            className={`action-button add-friend ${activePanel === 'add-friend' ? 'active' : ''}`}
                            onClick={() => togglePanel('add-friend')}
                        >
                            <FaUserPlus />
                            <span>Add Friend +</span>
                        </button>
                        <button
                            className={`action-button friend-requests ${activePanel === 'requests' ? 'active' : ''}`}
                            onClick={() => togglePanel('requests')}
                        >
                            <FaUserFriends />
                            <span>Friend Requests</span>
                        </button>
                    </div>

                    {/* Action Panels */}
                    {activePanel && (
                        <div className="friends-action-panel">
                            <FriendsActions
                                panelType={activePanel}
                                onClose={() => setActivePanel(null)}
                                friendsList={allFriends}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Friends; 