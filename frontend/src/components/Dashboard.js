import React, { useState } from "react";
import AiChat from "./AiChat";
import PrivateChats from "./PrivateChats";
import Profile from "./Profile";
import AnonymousGroups from "./AnonymousGroups";
import "../styles/Dashboard.css";

function Dashboard() {
    const [isAiChatVisible, setIsAiChatVisible] = useState(true);
    const [isAnonGroupsVisible, setIsAnonGroupsVisible] = useState(true);

    const toggleAiChat = () => {
        setIsAiChatVisible(!isAiChatVisible);
    };

    const toggleAnonGroups = () => {
        setIsAnonGroupsVisible(!isAnonGroupsVisible);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <div className="top-section">
                    <PrivateChats />
                    <Profile />
                </div>
                <div className="bottom-section">
                    <AiChat />
                    <AnonymousGroups />
                </div>
            </div>
        </div>
    );
}

export default Dashboard; 