import React, { useState } from "react";
// import AiChat from "./AiChat";
// import PrivateChats from "./PrivateChats";
// import Profile from "./Profile";
// import AnonymousGroups from "./AnonymousGroups";
// import AiChatBox from "./AiChatBox";
import TopBar from "./TopBar";
import "../styles/Dashboard.css";

function Dashboard() {
    // const [isAiChatVisible, setIsAiChatVisible] = useState(true);
    // const [isAnonGroupsVisible, setIsAnonGroupsVisible] = useState(true);
    // const [isAiChatBoxVisible, setIsAiChatBoxVisible] = useState(false);

    // const toggleAiChat = () => {
    //     setIsAiChatBoxVisible(!isAiChatBoxVisible);
    // };

    // const toggleAnonGroups = () => {
    //     setIsAnonGroupsVisible(!isAnonGroupsVisible);
    // };

    return (
        <div className="dashboard-container">
            <TopBar />
            <div className="dashboard-content">
                <div className="dashboard-placeholder">
                    <h1>Dashboard</h1>
                    <p>Components temporarily removed for redesign</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard; 