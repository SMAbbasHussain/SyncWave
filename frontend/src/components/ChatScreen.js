import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';
import '../styles/ChatScreen.css';
import PrivateChatTopBar from './PrivateChatTopBar';
import AiChatTopBar from './AiChatTopBar';
import GroupChatTopBar from './GroupChatTopBar';
import AnonymousGroupChatTopBar from './AnonymousGroupChatTopBar';

function ChatScreen({ activeChat }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const aiGlowDotRef = useRef(null);

    // Reset chat when switching views
    useEffect(() => {
        setMessages([]);
        setMessage('');
    }, [activeChat.type]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Handle mouse move for AI glow effect
    const handleMouseMove = (e) => {
        if (chatContainerRef.current && activeChat.type === 'ai' && aiGlowDotRef.current) {
            const rect = chatContainerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            aiGlowDotRef.current.style.left = `${x}px`;
            aiGlowDotRef.current.style.top = `${y}px`;
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const newMessage = {
            id: Date.now(),
            content: message.trim(),
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newMessage]);
        setMessage('');

        // TODO: Implement actual message sending logic here
        // This will be replaced with real API calls

        // Add a sample received message after a delay
        if (messages.filter(msg => msg.sender !== 'user').length === 0) { // Add sample only if no received messages yet
            setTimeout(() => {
                const receivedMessage = {
                    id: Date.now() + 1,
                    content: activeChat.type === 'ai' ? "Hello! I am your AI Assistant. How can I help you today?" : "This is a sample response from the other user/group.",
                    sender: activeChat.type === 'ai' ? 'ai' : 'other',
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, receivedMessage]);
            }, 1000);
        }
    };

    // Render different top bars based on activeChat type
    const renderTopBar = () => {
        switch (activeChat.type) {
            case 'private':
                return <PrivateChatTopBar userId={activeChat.chatId} />;
            case 'ai':
                return <AiChatTopBar />;
            case 'group':
                return <GroupChatTopBar groupId={activeChat.chatId} />;
            case 'anonymousGroup':
                return <AnonymousGroupChatTopBar groupId={activeChat.chatId} />;
            default:
                return null;
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    if (activeChat.type === 'none') {
        return <div className="chat-screen-placeholder">Select a chat to start messaging</div>;
    }

    // Add a class based on the active chat type
    const chatContainerClass = `chat-screen-container ${activeChat.type !== 'none' ? activeChat.type + '-chat-background' : ''}`;

    return (
        <div className={chatContainerClass} ref={chatContainerRef} onMouseMove={handleMouseMove}>
            {activeChat.type === 'ai' && <div className="ai-chat-glow-container"><div className="ai-chat-glow-dot" ref={aiGlowDotRef}></div></div>}
            <div className="chat-screen-top-bar">
                {renderTopBar()}
            </div>
            <div className="chat-screen-messages">
                <div className="messages-wrapper">
                    {messages.length === 0 ? (
                        <div className="welcome-message">
                            <p>Start of chat history...</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                {msg.content}
                                <span className="message-timestamp">{formatTimestamp(msg.timestamp)}</span>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <form className="chat-screen-input" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input-field"
                />
                <button type="submit" className="send-message-button" disabled={!message.trim()}>
                    <FaPaperPlane className="send-icon" />
                </button>
            </form>
        </div>
    );
}

export default ChatScreen; 