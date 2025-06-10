import React, { useState, useEffect } from "react";
import PrivateChats from "./PrivateChats";
import AiChat from "./AiChat";
import Groups from "./Groups";
import AnonymousGroups from "./AnonymousGroups";
import Profile from "./Profile";
import ChatScreen from "./ChatScreen";
import Friends from "./Friends";
import FriendsAction from "./FriendsAction";
import "../styles/Dashboard.css";
import axios from "axios";

function Dashboard({ activeNavItem = 'home' }) {
    const [activeChat, setActiveChat] = useState({ type: 'none' }); // { type: 'none' | 'private' | 'ai' | 'group' | 'anonymousGroup', chatId: '...' }
    const [showAnonymousGroups, setShowAnonymousGroups] = useState(false);

    // Reset active chat when switching views
    useEffect(() => {
        if (activeNavItem === 'home' && ['group', 'anonymousGroup'].includes(activeChat.type)) {
            setActiveChat({ type: 'none' });
            setShowAnonymousGroups(false); // Reset anonymous groups visibility when switching views
        } else if (activeNavItem === 'groups' && ['private', 'ai'].includes(activeChat.type)) {
            setActiveChat({ type: 'none' });
        }
    }, [activeNavItem]);

    // Function to handle chat selection
    const handleChatSelect = (chatType, chatId, pid) => {
        setActiveChat({ type: chatType, chatId: chatId, pid: pid });
    };


    // Function to handle anonymous groups toggle
    const handleAnonymousGroupsToggle = (isVisible) => {
        setShowAnonymousGroups(isVisible);
        // Reset active chat when toggling to prevent background issues
        if (isVisible) {
            setActiveChat({ type: 'none' });
        }
    };

    // Home View Component
    const HomeView = () => (
        <div className="dashboard-content">
            {/* Wrapper for left-side content in Home View */}
            <div className="left-sidebar-content">
                <div className="chat-section">
                    <div className="private-chats-container">
                        <PrivateChats onChatSelect={(chatId, pid) => handleChatSelect('private', chatId, pid)} />
                    </div>
                    <AiChat onChatSelect={() => handleChatSelect('ai')} />
                </div>
            </div>
            {/* Render ChatScreen in the remaining space */}
            <ChatScreen activeChat={activeChat} />
        </div>
    );

    // Groups View Component
    const GroupsView = () => (
        <div className="dashboard-content">
            {/* Wrapper for left-side content in Groups View */}
            <div className="left-sidebar-content">
                <div className="groups-view">
                    <div className="top-section">
                        {!showAnonymousGroups ? (
                            <Groups onChatSelect={(groupId) => handleChatSelect('group', groupId)} />
                        ) : (
                            <div className="groups-container-placeholder" style={{ height: 'calc(80vh - 120px)' }}></div>
                        )}
                    </div>
                    <AnonymousGroups
                        onChatSelect={(groupId) => handleChatSelect('anonymousGroup', groupId)}
                        onToggle={handleAnonymousGroupsToggle}
                        isVisible={showAnonymousGroups}
                    />
                </div>
            </div>
            {/* Render ChatScreen in the remaining space */}
            <ChatScreen activeChat={activeChat} />
        </div>
    );

    // Render the appropriate view based on activeNavItem
    const renderContent = () => {
        switch (activeNavItem) {
            case 'home':
                return <HomeView />;
            case 'groups':
                return <GroupsView />;
            case 'friends':
                return (
                    <div className="friends-dashboard-layout">
                        <div className="friends-left-section">
                            <Friends />
                        </div>
                        <div className="friends-right-section">
                            <FriendsAction />
                        </div>
                    </div>
                );
            case 'theme':
                return <div className="dashboard-content"><h2>Theme Settings Coming Soon</h2></div>;
            case 'settings':
                return <div className="dashboard-content"><h2>Settings Coming Soon</h2></div>;
            default:
                return <HomeView />;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-top-bar">
                <div className="wave-container">
                    <div className="wave-bg">
                        <div className="wave-line wave-line-1"></div>
                        <div className="wave-line wave-line-2"></div>
                        <div className="wave-line wave-line-3"></div>
                    </div>
                </div>
                <div className="dashboard-top-bar-content">
                    <div className="dashboard-logo">
                        <span>SYNCWAVE</span>
                    </div>
                    <Profile />
                </div>
            </div>
            {renderContent()}
        </div>
    );
}

export default Dashboard; 