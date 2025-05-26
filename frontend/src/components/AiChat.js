import React from 'react';
import { FaRobot } from 'react-icons/fa';
import '../styles/AiChat.css';

function AiChat({ onClick }) {
    return (
        <div className="ai-chat-button" onClick={onClick}>
            <div className="ai-chat-content">
                <FaRobot className="ai-icon" />
                <span className="ai-text">Chat with AI Assistant</span>
            </div>
        </div>
    );
}

export default AiChat; 