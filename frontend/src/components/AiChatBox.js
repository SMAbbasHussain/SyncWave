import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane } from 'react-icons/fa';
import '../styles/AiChatBox.css';

const AiChatBox = ({ isVisible, onClose }) => {
    const [message, setMessage] = useState('');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const messagesEndRef = useRef(null);
    const chatBoxRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, []); // Scroll when component mounts

    const handleMouseMove = (e) => {
        if (chatBoxRef.current) {
            const rect = chatBoxRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            chatBoxRef.current.style.setProperty('--mouse-x', `${x}%`);
            chatBoxRef.current.style.setProperty('--mouse-y', `${y}%`);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // TODO: Implement message sending logic
        setMessage('');
    };

    if (!isVisible) return null;

    return (
        <div
            className="ai-chatbox-container"
            ref={chatBoxRef}
            onMouseMove={handleMouseMove}
        >
            <div className="ai-chatbox-header">
                <div className="ai-chatbox-profile">
                    <div className="ai-chatbox-avatar">
                        <FaRobot />
                    </div>
                    <span className="ai-chatbox-name">AI Chat</span>
                </div>
                <button className="ai-chatbox-close" onClick={onClose}>×</button>
            </div>

            <div className="ai-chatbox-messages">
                {/* Messages will be added here */}
                <div ref={messagesEndRef} />
            </div>

            <form className="ai-chatbox-input-container" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="ai-chatbox-input"
                />
                <button type="submit" className="ai-chatbox-send">
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
};

export default AiChatBox;
