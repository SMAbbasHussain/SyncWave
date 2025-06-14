import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import ChatDropdownMenu from './ChatDropdownMenu';
import ConfirmationModal from './ConfirmationModal';
import '../styles/ChatScreen.css';

function PrivateChatTopBar({ activeChat }) {
    const [user, setUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showClearChatConfirm, setShowClearChatConfirm] = useState(false);
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/chat/${activeChat.chatId}/other-participant`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (activeChat?.chatId) {
            fetchUserData();
        }
    }, [activeChat?.chatId]);

    const handleVisitProfile = () => {
        // TODO: Implement visit profile functionality
        setIsDropdownOpen(false);
    };

    const handleMuteNotifications = () => {
        setIsMuted(!isMuted);
        // TODO: Implement mute notifications functionality
        setIsDropdownOpen(false);
    };

    const handleClearChat = () => {
        setShowClearChatConfirm(true);
        setIsDropdownOpen(false);
    };

    const handleBlockUser = () => {
        setShowBlockConfirm(true);
        setIsDropdownOpen(false);
    };

    const handleConfirmClearChat = async () => {
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/chat/${activeChat.chatId}/messages`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            // TODO: Update UI to reflect cleared chat
        } catch (error) {
            console.error('Error clearing chat:', error);
        }
        setShowClearChatConfirm(false);
    };

    const handleConfirmBlockUser = async () => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/users/block/${user._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            // TODO: Update UI to reflect blocked user
        } catch (error) {
            console.error('Error blocking user:', error);
        }
        setShowBlockConfirm(false);
    };

    if (!user) return null;

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
            <div style={{ position: 'relative' }}>
                <div className="hamburger-icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)} title="More options">
                    <div className="hamburger-line"></div>
                    <div className="hamburger-line middle"></div>
                    <div className="hamburger-line"></div>
                </div>

                <ChatDropdownMenu
                    isOpen={isDropdownOpen}
                    onClose={() => setIsDropdownOpen(false)}
                    type="private"
                    onVisitProfile={handleVisitProfile}
                    onMuteNotifications={handleMuteNotifications}
                    onClearChat={handleClearChat}
                    onBlockUser={handleBlockUser}
                    isMuted={isMuted}
                />
            </div>

            <ConfirmationModal
                isOpen={showClearChatConfirm}
                message="Are you sure you want to clear all messages in this chat?"
                onConfirm={handleConfirmClearChat}
                onClose={() => setShowClearChatConfirm(false)}
                confirmText="Clear Chat"
                cancelText="Cancel"
            />

            <ConfirmationModal
                isOpen={showBlockConfirm}
                message={`Are you sure to block ${user.username}? You will no longer receive messages from them.`}
                onConfirm={handleConfirmBlockUser}
                onClose={() => setShowBlockConfirm(false)}
                confirmText="Block User"
                cancelText="Cancel"
            />
        </div>
    );
}

export default PrivateChatTopBar;
