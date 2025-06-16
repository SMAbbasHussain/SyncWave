import React, { useState, useEffect } from 'react';
import { FaUsers } from 'react-icons/fa';
import axios from 'axios';
import ChatDropdownMenu from './ChatDropdownMenu';
import ConfirmationModal from './ConfirmationModal';
import AnonymousGroupInfoModal from './AnonymousGroupInfoModal';
import '../styles/ChatScreen.css';

function AnonymousGroupChatTopBar({ groupId }) {
    const [group, setGroup] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showClearChatConfirm, setShowClearChatConfirm] = useState(false);
    const [showLeaveGroupConfirm, setShowLeaveGroupConfirm] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showGroupInfoModal, setShowGroupInfoModal] = useState(false);

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/anonymous-groups/${groupId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                setGroup(response.data);
            } catch (error) {
                console.error('Error fetching anonymous group data:', error);
            }
        };

        if (groupId) {
            fetchGroupData();
        }
    }, [groupId]);

    const handleViewGroupInfo = () => {
        setShowGroupInfoModal(true);
        setIsDropdownOpen(false);
    };

    const handleMuteNotifications = () => {
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
                `${process.env.REACT_APP_API_URL}/api/anonymous-groups/${groupId}/messages`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setShowClearChatConfirm(false);
        } catch (error) {
            console.error('Error clearing chat:', error);
        }
    };

    const handleConfirmLeaveGroup = async () => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/anonymous-groups/${groupId}/leave`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setShowLeaveGroupConfirm(false);
        } catch (error) {
            console.error('Error leaving group:', error);
        }
    };

    if (!group) return null;

    return (
        <div className="chat-screen-top-bar-content">
            <div className="chat-info">
                <div className="chat-avatar-icon-container anonymous">
                    <FaUsers className="chat-avatar-icon" />
                </div>
                <div className="user-status-info">
                    <span className="chat-partner-name">{group.name}</span>
                    <div className="user-status-row">
                        <span className="group-category">{group.category || 'Anonymous Chat'}</span>
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
                    type="anonymous"
                    onViewGroupInfo={handleViewGroupInfo}
                    onMuteNotifications={handleMuteNotifications}
                    onClearChat={handleClearChat}
                    onLeaveGroup={handleLeaveGroup}
                    isMuted={isMuted}
                />
            </div>

            {group && showGroupInfoModal && (
                <AnonymousGroupInfoModal
                    group={group}
                    onClose={() => setShowGroupInfoModal(false)}
                    isMuted={isMuted}
                    onMuteToggle={handleMuteNotifications}
                />
            )}

            <ConfirmationModal
                isOpen={showClearChatConfirm}
                message="Are you sure you want to clear all messages in this chat?"
                onConfirm={handleConfirmClearChat}
                onClose={() => setShowClearChatConfirm(false)}
                confirmText="Clear"
                cancelText="Cancel"
            />

            <ConfirmationModal
                isOpen={showLeaveGroupConfirm}
                message={`Are you sure you want to leave "${group.name}"? You will no longer receive messages.`}
                onConfirm={handleConfirmLeaveGroup}
                onClose={() => setShowLeaveGroupConfirm(false)}
                confirmText="Leave Chat"
                cancelText="Cancel"
            />
        </div>
    );
}

export default AnonymousGroupChatTopBar; 