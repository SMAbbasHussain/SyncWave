import React, { useState, useEffect } from 'react';
import { FaUsers } from 'react-icons/fa';
import '../styles/ChatScreen.css';

function GroupChatTopBar({ groupId }) {
    const [groupInfo, setGroupInfo] = useState({
        name: '',
        memberCount: 0,
        groupPicUrl: ''
    });

    useEffect(() => {
        // TODO: Replace with actual API call to fetch group info
        // This is a mock implementation
        const mockGroups = {
            1: { name: "Group Name ni mila?", memberCount: 15, groupPicUrl: "https://via.placeholder.com/40/abcdef" },
            2: { name: "itna dehan kabhi..", memberCount: 8, groupPicUrl: '' },
            3: { name: "PARHAI Pr dete na", memberCount: 12, groupPicUrl: "https://via.placeholder.com/40/123456" },
            // Add more mock groups as needed
        };

        const group = mockGroups[groupId] || {
            name: `Group ${groupId}`,
            memberCount: 0,
            groupPicUrl: ''
        };

        setGroupInfo(group);
    }, [groupId]);

    return (
        <div className="chat-screen-top-bar-content">
            <div className="chat-info">
                {groupInfo.groupPicUrl ? (
                    <img src={groupInfo.groupPicUrl} alt={`${groupInfo.name}'s avatar`} className="chat-avatar" />
                ) : (
                    <div className="chat-avatar-icon-container">
                        <FaUsers className="chat-avatar-icon" />
                    </div>
                )}
                <div className="user-status-info">
                    <span className="chat-partner-name">{groupInfo.name}</span>
                    {/* Group chat doesn't typically show online status per member in the header */}
                    {/* <div className="user-status-row">
                        <div className={`status-indicator ${groupInfo.status}`} />
                        <span className="user-status-text">{groupInfo.status}</span>
                    </div> */}
                </div>
            </div>
            {/* Use custom hamburger icon */}
            <div className="hamburger-icon" title="Group options">
                <div className="hamburger-line"></div>
                <div className="hamburger-line middle"></div>
                <div className="hamburger-line"></div>
            </div>
        </div>
    );
}

export default GroupChatTopBar; 