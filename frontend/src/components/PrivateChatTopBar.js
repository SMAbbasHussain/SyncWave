import React, { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import '../styles/ChatScreen.css';
import axios from 'axios';

function PrivateChatTopBar({ activeChat }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchParticipant = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/chat/${activeChat.chatId}/other-participant`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching participant:', error);
            }
        };

        if (activeChat && activeChat.type === 'private') {
            fetchParticipant();
        } else {
            setUser(null);
        }
    }, [activeChat]);

    if (!user) {
        return (
            <div className="chat-screen-top-bar-content">
                <div className="chat-info loading">
                    <FaUserCircle className="chat-avatar-icon" />
                    <span>Loading user info...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-screen-top-bar-content">
            <div className="chat-info">
                {user.profilePic ? (
                    <img
                        src={user.profilePic}
                        alt={`${user.username}'s avatar`}
                        className="chat-avatar"
                    />
                ) : (
                    <div className="chat-avatar-icon-container">
                        <FaUserCircle className="chat-avatar-icon" />
                    </div>
                )}
                <div className="user-status-info">
                    <span className="chat-partner-name">{user.username}</span>
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
