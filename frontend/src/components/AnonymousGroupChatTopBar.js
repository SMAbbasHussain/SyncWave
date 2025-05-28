import React, { useState, useEffect } from 'react';
import { FaUsers, FaEye } from 'react-icons/fa';
import '../styles/ChatScreen.css';

function AnonymousGroupChatTopBar({ groupId }) {
    const [groupInfo, setGroupInfo] = useState({
        name: '',
        memberCount: 0,
        category: ''
    });

    useEffect(() => {
        // TODO: Replace with actual API call to fetch anonymous group info
        // This is a mock implementation
        const mockGroups = {
            1: { name: "Whisper Circle #1", memberCount: 15, category: "Gaming" },
            2: { name: "Tech Hub Connect", memberCount: 8, category: "Technology & Programming" },
            3: { name: "Movie Buffs Anonymous", memberCount: 12, category: "Entertainment & Movies" },
            // Add more mock groups as needed
        };

        const group = mockGroups[groupId] || {
            name: `Anonymous Group ${groupId}`,
            memberCount: 0,
            category: 'General'
        };

        setGroupInfo(group);
    }, [groupId]);

    return (
        <div className="chat-screen-top-bar-content">
            <div className="chat-info">
                <div className="chat-avatar-icon-container anonymous">
                    <FaEye className="chat-avatar-icon" />
                </div>
                <div className="user-status-info">
                    <span className="chat-partner-name">{groupInfo.name}</span>
                    <div className="anonymous-group-info">
                        <span className="user-status-text">{groupInfo.memberCount} members</span>
                        <span className="group-category">{groupInfo.category}</span>
                    </div>
                </div>
            </div>
            <div className="hamburger-icon" title="Anonymous group options">
                <div className="hamburger-line"></div>
                <div className="hamburger-line middle"></div>
                <div className="hamburger-line"></div>
            </div>
        </div>
    );
}

export default AnonymousGroupChatTopBar; 