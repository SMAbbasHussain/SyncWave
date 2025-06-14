import React, { useState, useEffect } from 'react';
import { FaUsers } from 'react-icons/fa';
import axios from 'axios';
import ChatDropdownMenu from './ChatDropdownMenu';
import ConfirmationModal from './ConfirmationModal';
import '../styles/ChatScreen.css';

function GroupChatTopBar({ groupId }) {
    const [group, setGroup] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showClearChatConfirm, setShowClearChatConfirm] = useState(false);
    const [showLeaveGroupConfirm, setShowLeaveGroupConfirm] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/groups/${groupId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                setGroup(response.data);
            } catch (error) {
                console.error('Error fetching group data:', error);
            }
        };

        if (groupId) {
            fetchGroupData();
        }
    }, [groupId]);

    const handleViewGroupInfo = () => {
        // TODO: Implement view group info functionality
        setIsDropdownOpen(false);
    };

    const handleMuteNotifications = () => {
        // TODO: Implement mute notifications functionality
        setIsMuted(!isMuted);
        setIsDropdownOpen(false);
    };

    const handleClearChat = () => {
        setShowClearChatConfirm(true);
        setIsDropdownOpen(false);
    };

    const handleLeaveGroup = () => {
        setShowLeaveGroupConfirm(true);
        setIsDropdownOpen(false);
    };

    const handleConfirmClearChat = async () => {
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/groups/${groupId}/messages`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            // TODO: Update UI to reflect cleared chat
        } catch (error) {
            console.error('Error clearing group chat:', error);
        }
        setShowClearChatConfirm(false);
    };

    const handleConfirmLeaveGroup = async () => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/groups/${groupId}/leave`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            // TODO: Update UI to reflect leaving group
        } catch (error) {
            console.error('Error leaving group:', error);
        }
        setShowLeaveGroupConfirm(false);
    };

    if (!group) return null;

    return (
        <div className="chat-screen-top-bar-content">
            <div className="chat-info">
                {group.photo ? (
                    <img src={group.photo} alt={`${group.name}'s avatar`} className="chat-avatar" />
                ) : (
                    <div className="chat-avatar-icon-container">
                        <FaUsers className="chat-avatar-icon" />
                    </div>
                )}
                <div className="user-status-info">
                    <span className="chat-partner-name">{group.name}</span>
                    {/* Group chat doesn't typically show online status per member in the header */}
                    {/* <div className="user-status-row">
                        <div className={`status-indicator ${groupInfo.status}`} />
                        <span className="user-status-text">{groupInfo.status}</span>
                    </div> */}
                </div>
            </div>
            {/* Use custom hamburger icon */}
            <div style={{ position: 'relative' }}>
                <div className="hamburger-icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)} title="Group options">
                    <div className="hamburger-line"></div>
                    <div className="hamburger-line middle"></div>
                    <div className="hamburger-line"></div>
                </div>

                <ChatDropdownMenu
                    isOpen={isDropdownOpen}
                    onClose={() => setIsDropdownOpen(false)}
                    type="group"
                    onViewGroupInfo={handleViewGroupInfo}
                    onMuteNotifications={handleMuteNotifications}
                    onClearChat={handleClearChat}
                    onLeaveGroup={handleLeaveGroup}
                    isMuted={isMuted}
                />
            </div>

            <ConfirmationModal
                isOpen={showClearChatConfirm}
                message="Are you sure you want to clear all messages in this group chat?"
                onConfirm={handleConfirmClearChat}
                onClose={() => setShowClearChatConfirm(false)}
                confirmText="Clear Chat"
                cancelText="Cancel"
            />

            <ConfirmationModal
                isOpen={showLeaveGroupConfirm}
                message={`Are you sure you want to leave "${group.name}"? You will no longer receive messages.`}
                onConfirm={handleConfirmLeaveGroup}
                onClose={() => setShowLeaveGroupConfirm(false)}
                confirmText="Leave Group"
                cancelText="Cancel"
            />
        </div>
    );
}

export default GroupChatTopBar; 