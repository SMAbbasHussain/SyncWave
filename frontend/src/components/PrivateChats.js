import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import '../styles/PrivateChats.css';

function PrivateChats() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([
    { id: 1, name: 'John Doe', status: 'online', lastMessage: 'Hey, how are you?' },
    { id: 2, name: 'Alice Smith', status: 'offline', lastMessage: 'See you tomorrow!' },
    { id: 3, name: 'Robert Johnson', status: 'online', lastMessage: 'Thanks for the help!' },
    { id: 4, name: 'Emily Brown', status: 'offline', lastMessage: 'Did you see the meeting notes?' },
    { id: 5, name: 'Michael Wilson', status: 'online', lastMessage: 'The project is ready' },
    { id: 6, name: 'Sarah Davis', status: 'offline', lastMessage: "Let me know when you're free" },
    { id: 7, name: 'David Anderson', status: 'online', lastMessage: 'Great work!' },
    { id: 8, name: 'Jessica Taylor', status: 'offline', lastMessage: "Can we discuss this later?" },
    { id: 9, name: 'Christopher Martinez', status: 'online', lastMessage: "I'll send the files" },
    { id: 10, name: 'Amanda Thompson', status: 'offline', lastMessage: 'Have a good day!' }
  ]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatClick = (chatId) => {
    setActiveChat(chatId);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const shouldScrollName = (name) => {
    return name.length > 12;
  };

  return (
    <div className="private-chats-container">
      <div className="private-chats-header">
        <h2>Private Chats</h2>
        <div className="private-chats-actions">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="chat-list">
        {filteredChats.map(chat => (
          <div
            key={chat.id}
            className={`chat-item ${activeChat === chat.id ? 'active' : ''}`}
            onClick={() => handleChatClick(chat.id)}
          >
            <div className="avatar">
              {getInitials(chat.name)}
              <div className={`status-indicator ${chat.status}`} />
            </div>
            <div className="chat-info">
              <h3 className={`chat-name ${shouldScrollName(chat.name) ? 'scroll' : ''}`}>
                {chat.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrivateChats;