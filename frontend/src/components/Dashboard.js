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
                    <div className={`ai-chat-container ${!isAiChatVisible ? "hidden" : ""}`}>
                        <div className="section-header">
                            <h2>AI Chat</h2>
                            <button className="toggle-btn" onClick={toggleAiChat}>
                                {isAiChatVisible ? "Hide" : "Show"}
                            </button>
                        </div>
                        <AiChat />
                    </div>

                    <div className={`anon-groups-container ${!isAnonGroupsVisible ? "hidden" : ""}`}>
                        <div className="section-header">
                            <h2>Anonymous Groups</h2>
                            <button className="toggle-btn" onClick={toggleAnonGroups}>
                                {isAnonGroupsVisible ? "Hide" : "Show"}
                            </button>
                        </div>
                        <AnonymousGroups />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard; 