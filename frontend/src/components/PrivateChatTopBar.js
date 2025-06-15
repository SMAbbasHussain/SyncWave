import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import ChatDropdownMenu from './ChatDropdownMenu';
import ConfirmationModal from './ConfirmationModal';
import PrivateProfileModal from './PrivateProfileModal';
import '../styles/ChatScreen.css';

// Add onBlockSuccess to the component's props
function PrivateChatTopBar({ activeChat, onBlockSuccess }) {
    const [user, setUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showClearChatConfirm, setShowClearChatConfirm] = useState(false);
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            // A check to ensure we don't try to fetch data if the user object is already in activeChat
            if (activeChat.otherParticipant) {
                setUser(activeChat.otherParticipant);
                return;
            }

            // Fallback to fetch if not provided
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
    }, [activeChat]);

    const handleVisitProfile = () => {
        setShowProfileModal(true);
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

    // --- UPDATED FUNCTION ---
    const handleConfirmBlockUser = async () => {
        // Ensure user data is available before proceeding
        if (!user?._id) {
            alert('Cannot block user: User information is missing.');
            setShowBlockConfirm(false);
            return;
        }

        try {
            // Make the API call to the block user endpoint
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/users/block/${user._id}`,
                {}, // Body is empty as per the controller
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            // On success, call the callback from the parent component
            // This allows the parent to remove the chat from the list and close the window
            if (onBlockSuccess) {
                onBlockSuccess(user._id, activeChat.chatId);
            }

        } catch (error) {
            console.error('Error blocking user:', error);
            // Display a specific error from the backend, or a generic one
            const errorMessage = error.response?.data?.error || 'An unexpected error occurred. Please try again.';
            alert(errorMessage); // Using alert for simplicity, a toast notification is better UX
        } finally {
            // Always close the confirmation modal
            setShowBlockConfirm(false);
        }
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
                isOpen={showBlockConfirm}
                message={`Are you sure to block ${user.username}? You'll not be able to communicate with them.`}
                onConfirm={handleConfirmBlockUser}
                onClose={() => setShowBlockConfirm(false)}
                confirmText="Block User"
                cancelText="Cancel"
            />

            {showProfileModal && user && (
                <PrivateProfileModal
                    user={user}
                    chatId={activeChat.chatId}
                    isMuted={isMuted}
                    onMuteToggle={() => setIsMuted((m) => !m)}
                    onClose={() => setShowProfileModal(false)}
                />
            )}
        </div>
    );
}

export default PrivateChatTopBar;