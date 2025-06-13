import React, { useState, useEffect } from 'react';
import { FaUsers, FaEye } from 'react-icons/fa';
import '../styles/ChatScreen.css';

function AnonymousGroupChatTopBar({ groupId }) {
   const [groupInfo, setGroupInfo] = useState({
        name: '',
        memberCount: 0,
        category: '',
        photo:''
    });

    useEffect(() => {
        const fetchGroupInfo = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/anonymous-groups/${groupId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // if you're using token-based auth
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch group info');
                }

                const data = await response.json();
                setGroupInfo({
                    name: data.name || `Anonymous Group ${groupId}`,
                    memberCount: data.memberCount || 0,
                    category: data.category || 'General',
                    photo: data.photo
                });
            } catch (error) {
                console.error('Error fetching group info:', error);
            }
        };

        if (groupId) {
            fetchGroupInfo();
        }
    }, [groupId]);


    return (
        <div className="chat-screen-top-bar-content">
            <div className="chat-info">
                {groupInfo.photo ? (
                                    <img src={groupInfo.photo} alt={`${groupInfo.name}'s avatar`} className="chat-avatar" />
                                ) : (
                                    <div className="chat-avatar-icon-container">
                                        <FaUsers className="chat-avatar-icon" />
                                    </div>
                                )}
                <div className="user-status-info">
                    <span className="chat-partner-name">{groupInfo.name}</span>
                    <div className="anonymous-group-info">
                        {/*<span className="user-status-text">{groupInfo.memberCount} members</span>*/}
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