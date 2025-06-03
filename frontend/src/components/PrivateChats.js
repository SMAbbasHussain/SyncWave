import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaUserCircle } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import NewChatModal from './NewChatModal';
import '../styles/PrivateChats.css';

function PrivateChats({ onChatSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchInputRef = useRef(null);
  const [chats, setChats] = useState([
    { id: 1, name: 'John Doe', status: 'online', profilePicUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 2, name: 'Alice Smith', status: 'offline', profilePicUrl: '' },
    { id: 3, name: 'Robert Johnson', status: 'online', profilePicUrl: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { id: 4, name: 'Emily Brown', status: 'offline', profilePicUrl: null },
    { id: 5, name: 'Michael Wilson', status: 'online', profilePicUrl: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: 6, name: 'Sarah Davis', status: 'offline' },
    { id: 7, name: 'David Anderson', status: 'online', profilePicUrl: 'https://randomuser.me/api/portraits/men/4.jpg' },
    { id: 8, name: 'Jessica Taylor', status: 'offline', profilePicUrl: '' },
    { id: 9, name: 'Christopher Martinez', status: 'online', profilePicUrl: 'https://randomuser.me/api/portraits/men/5.jpg' },
    { id: 10, name: 'Amanda Thompson', status: 'offline' }
  ]);

  // Mock friends list - in a real app, this would come from an API
  const [friends] = useState([
    { id: 101, username: 'John Doe', profilePicUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 102, username: 'Alice Smith', profilePicUrl: '' },
    { id: 103, username: 'Robert Johnson', profilePicUrl: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { id: 104, username: 'Emily Brown', profilePicUrl: null },
    { id: 105, username: 'Michael Wilson', profilePicUrl: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: 106, username: 'Sarah Davis', profilePicUrl: '' },
    { id: 107, username: 'David Anderson', profilePicUrl: 'https://randomuser.me/api/portraits/men/4.jpg' },
    { id: 108, username: 'Jessica Taylor', profilePicUrl: '' },
    { id: 109, username: 'Christopher Martinez', profilePicUrl: 'https://randomuser.me/api/portraits/men/5.jpg' },
    { id: 110, username: 'Amanda Thompson', profilePicUrl: '' }
  ]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatClick = (chatId) => {
    setSelectedChatId(chatId);
    if (onChatSelect) {
      onChatSelect('private', chatId);
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
    }
  };

  const handleCloseSearch = (e) => {
    e.stopPropagation();
    setIsSearchActive(false);
    setSearchQuery('');
  };

  const handleStartNewChat = (friendId) => {
    // In a real app, this would create a new chat with the selected friend
    // For now, we'll just simulate it by adding a new chat
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      const newChat = {
        id: Date.now(), // Use timestamp as temporary ID
        name: friend.username,
        status: 'offline',
        profilePicUrl: friend.profilePicUrl
      };
      setChats(prevChats => [newChat, ...prevChats]);
      handleChatClick(newChat.id);
    }
  };

  return (
    <>
      <div className="private-chats-header">
        <div className={`header-content ${isSearchActive ? 'search-active' : ''}`}>
          <h2 className="header-title">Private Chats</h2>
          <div className="header-actions">
            <button
              className="action-btn create-btn"
              title="Start New Chat"
              onClick={() => setIsModalOpen(true)}
            >
              <FiPlus className="action-icon" />
            </button>
            <button
              className={`search-toggle ${isSearchActive ? 'active' : ''}`}
              onClick={toggleSearch}
              aria-label="Toggle search"
            >
              <FaSearch />
              <span className="search-label">Search</span>
            </button>
          </div>
        </div>
        <div className={`search-container ${isSearchActive ? 'active' : ''}`}>
          <div className="search-bar">
            <FaSearch className="search-icon search-icon-left" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search chats..."
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
      <div className="chat-list">
        {searchQuery.trim() === "" ? (
          chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChatId === chat.id ? 'active' : ''}`}
              onClick={() => handleChatClick(chat.id)}
            >
              <div className="avatar">
                {chat.profilePicUrl ? (
                  <img src={chat.profilePicUrl} alt={`${chat.name}'s avatar`} className="avatar-img" />
                ) : (
                  <FaUserCircle className="avatar-icon" />
                )}
                <div className={`status-indicator ${chat.status}`} />
              </div>
              <div className="chat-info">
                <h3 className="chat-name">
                  {chat.name}
                </h3>
              </div>
            </div>
          ))
        ) : filteredChats.length > 0 ? (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChatId === chat.id ? 'active' : ''}`}
              onClick={() => handleChatClick(chat.id)}
            >
              <div className="avatar">
                {chat.profilePicUrl ? (
                  <img src={chat.profilePicUrl} alt={`${chat.name}'s avatar`} className="avatar-img" />
                ) : (
                  <FaUserCircle className="avatar-icon" />
                )}
                <div className={`status-indicator ${chat.status}`} />
              </div>
              <div className="chat-info">
                <h3 className="chat-name">
                  {chat.name}
                </h3>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No chats found matching "{searchQuery}"
          </div>
        )}
      </div>

      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartChat={handleStartNewChat}
        friends={friends}
      />
    </>
  );
}

export default PrivateChats;