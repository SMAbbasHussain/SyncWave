import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import '../styles/ChatScreen.css'; // Use ChatScreen.css for shared styles

function PrivateChatTopBar({ userId }) {
    // TODO: Fetch user data based on userId
    const user = {
        name: 'Selected User',
        status: 'online', // or 'offline'
        profilePicUrl: '' // Placeholder
    };

    return (
        <div className="chat-screen-top-bar-content">
            <div className="chat-info">
                {user.profilePicUrl ? (
                    <img src={user.profilePicUrl} alt={`${user.name}'s avatar`} className="chat-avatar" />
                ) : (
                    <div className="chat-avatar-icon-container">
                        <FaUserCircle className="chat-avatar-icon" />
                    </div>
                )}
                <div className="user-status-info">
                    <span className="chat-partner-name">{user.name}</span>
                    <div className="user-status-row">
                        <div className={`status-indicator ${user.status}`} />
                        <span className="user-status-text">{user.status}</span>
                    </div>
                </div>
            </div>
            <div className="hamburger-icon" title="More options">
                <div className="hamburger-line"></div>
                <div className="hamburger-line middle"></div>
                <div className="hamburger-line"></div>
            </div>
        </div>
    );
}

export default PrivateChatTopBar; 