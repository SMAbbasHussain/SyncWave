import React, { useState, useEffect } from "react";
import PrivateChats from "./PrivateChats";
import AiChat from "./AiChat";
import Groups from "./Groups";
import AnonymousGroups from "./AnonymousGroups";
import Profile from "./Profile";
import ChatScreen from "./ChatScreen";
import "../styles/Dashboard.css";

function Dashboard({ activeNavItem = 'home' }) {
    // State to manage the currently active chat
    const [activeChat, setActiveChat] = useState({ type: 'none' }); // { type: 'none' | 'private' | 'ai' | 'group' | 'anonymousGroup', chatId: '...' }

    // Reset active chat when switching views
    useEffect(() => {
        if (activeNavItem === 'home' && ['group', 'anonymousGroup'].includes(activeChat.type)) {
            setActiveChat({ type: 'none' });
        } else if (activeNavItem === 'groups' && ['private', 'ai'].includes(activeChat.type)) {
            setActiveChat({ type: 'none' });
        }
    }, [activeNavItem]);

    // Function to handle chat selection
    const handleChatSelect = (chatType, chatId) => {
        setActiveChat({ type: chatType, chatId: chatId });
    };

    // Home View Component
    const HomeView = () => (
        <div className="dashboard-content">
            {/* Wrapper for left-side content in Home View */}
            <div className="left-sidebar-content">
                <div className="chat-section">
                    <div className="private-chats-container">
                        <PrivateChats onChatSelect={(userId) => handleChatSelect('private', userId)} />
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
                        <Groups onChatSelect={(groupId) => handleChatSelect('group', groupId)} />
                    </div>
                    <AnonymousGroups onChatSelect={(groupId) => handleChatSelect('anonymousGroup', groupId)} />
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
                return <div className="dashboard-content"><h2>Friends View Coming Soon</h2></div>;
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
                {/* Animated Wave Background Layer */}
                <div className="wave-bg">
                    <div className="wave-line wave-line-1"></div>
                    <div className="wave-line wave-line-2"></div>
                    <div className="wave-line wave-line-3"></div>
                </div>
                <div className="dashboard-logo">
                    <span>SYNCWAVE</span>
                </div>
                <Profile />
            </div>
            {renderContent()}

        </div>
    );
}

export default Dashboard; 