import React, { useState, useEffect } from 'react';
import { FaUsers } from 'react-icons/fa';
import '../styles/ChatScreen.css';
import axios from 'axios';

function GroupChatTopBar({ groupId }) {
    const [group, setGroup] = useState({});

     useEffect(() => {
            const fetchGroup = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(
                        `${process.env.REACT_APP_API_URL}/api/groups/${groupId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );
                    setGroup(response.data);
                } catch (error) {
                    console.error('Error fetching Group:', error);
                }
            };
    fetchGroup();
           
        }, [groupId]);


  

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
            <div className="hamburger-icon" title="Group options">
                <div className="hamburger-line"></div>
                <div className="hamburger-line middle"></div>
                <div className="hamburger-line"></div>
            </div>
        </div>
    );
}

export default GroupChatTopBar; 