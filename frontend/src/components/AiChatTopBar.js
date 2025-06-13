import React from 'react';
import { FaRobot } from 'react-icons/fa';

function AiChatTopBar() {
    // This component will display AI chat info
    return (
        <div className="chat-screen-top-bar-content">
            <div className="ai-chatbox-profile">
                <div className="ai-chatbox-avatar">
                    <FaRobot />
                </div>
                <span className="ai-chatbox-name">AI Assistant</span>
            </div>
            {/* Placeholder for AI chat options if any */}
        </div>
    );
}

export default AiChatTopBar; 