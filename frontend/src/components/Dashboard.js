import React, { useState, useEffect } from "react";
// import AiChat from "./AiChat";
import PrivateChats from "./PrivateChats";
import AiChat from "./AiChat";
import Groups from "./Groups";
import AnonymousGroups from "./AnonymousGroups";
// import AiChatBox from "./AiChatBox";
import Profile from "./Profile";
import "../styles/Dashboard.css";

function Dashboard({ activeNavItem = 'home' }) {
    const [isAiChatVisible, setIsAiChatVisible] = useState(true);
    const [isAnonGroupsVisible, setIsAnonGroupsVisible] = useState(true);

    const toggleAiChat = () => {
        setIsAiChatVisible(!isAiChatVisible);
    };

    const toggleAnonGroups = () => {
        setIsAnonGroupsVisible(!isAnonGroupsVisible);
    };

    // Home View Component
    const HomeView = () => (
        <div className="dashboard-content">
            <div className="home-view">
                <div className="chat-section">
                    <div className="private-chats-container">
                        <PrivateChats />
                    </div>
                    <div className="ai-chat-container">
                        <AiChat onClick={toggleAiChat} />
                    </div>
                </div>

            </div>
        </div>
    );

    // Groups View Component
    const GroupsView = () => (
        <div className="dashboard-content">
            <div className="groups-view">
                <div className="top-section">
                    <Groups />
                </div>
                <div className="bottom-section">
                    <AnonymousGroups />
                </div>
            </div>
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
                <div className="dashboard-logo">
                    <span >SYNCWAVE</span>
                </div>
                <Profile />
            </div>
            {renderContent()}
        </div>
    );
}

export default Dashboard; 