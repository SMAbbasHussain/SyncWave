import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaUserCircle } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import NewChatModal from './NewChatModal';
import '../styles/PrivateChats.css';
import { getFriends } from '../services/friendService';
import axios from 'axios';

function PrivateChats({ onChatSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchInputRef = useRef(null);
const [chats, setChats] = useState([]); // initially empty


  const [friends, setFriends] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


  useEffect(() => {
    async function fetchFriends() {
      try {
        const data = await getFriends();
        setFriends(data);
      } catch (error) {
        // Optionally handle error
      }
    }
    fetchFriends();
  }, []);

  useEffect(() => {
  async function fetchChats() {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_URL}/api/chat/messages/allconversations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const conversations = response.data.conversations;

      // Format conversations into the shape expected by your UI
      const formattedChats = conversations.map(conv => ({
        id: conv.chatId,
        name: conv.user?.username || 'Unknown User', // Fallback if username is missing
        profilePicUrl: conv.user?.profilePic || '', // Fallback if profilePic is missing
        status: 'offline' // You can later add real-time status with sockets
      }));

      setChats(formattedChats);
    } catch (error) {
      console.error('Error fetching chats:', error.response?.data || error.message);
    }
  }

  fetchChats();
}, []);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

 const handleChatClick = async (chatId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/api/chat/${chatId}/other-participant`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const participantId = response.data._id;
    setSelectedChatId(chatId);
    if (onChatSelect) {
      onChatSelect(chatId, participantId);  // pass participantId here
    }
  } catch (error) {
    console.error('Error fetching participant:', error);
    // You might want to still call onChatSelect with chatId and null pid or handle error differently
    if (onChatSelect) {
      onChatSelect(chatId, null);
    }
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

  const handleStartNewChat = async (participantId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/api/chat/initialize`,
      { participantId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { chat } = response.data;
    console.log(chat)

    // Get the other participant (not the current user)
    const userId = JSON.parse(atob(token.split('.')[1])).userId; // Decode userId from token
    const friend = chat.participants.find(p => p._id !== userId);

    if (friend) {
      const newChat = {
        id: chat._id,
        name: friend.username,
        status: 'offline', // You can set online status separately via socket
        profilePicUrl: friend.profilePic || '', // Use empty string if not available
      };

      setChats(prevChats => [newChat, ...prevChats]);
      handleChatClick(chat._id);
    }

  } catch (error) {
    console.error('Error starting new chat:', error.response?.data || error.message);
    alert(error.response?.data?.error || 'Failed to start chat.');
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