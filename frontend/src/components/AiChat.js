import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa';
import '../styles/AiChat.css';

function AiChat({ onChatSelect }) {
    const [isChatVisible, setIsChatVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const chatBoxRef = useRef(null);
    const chatButtonRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleButtonMouseMove = (e) => {
        if (chatButtonRef.current) {
            const rect = chatButtonRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            chatButtonRef.current.style.setProperty('--mouse-x', `${x}%`);
            chatButtonRef.current.style.setProperty('--mouse-y', `${y}%`);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Add user message
        const newMessage = {
            type: 'user',
            content: message,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        setMessage('');

        // TODO: Implement AI response logic here
        // For now, just add a mock AI response
        setTimeout(() => {
            const aiResponse = {
                type: 'ai',
                content: 'This is a mock AI response. AI integration coming soon!',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1000);
    };

    const toggleChat = () => {
        setIsChatVisible(!isChatVisible);
    };

    return (
        <div className="ai-chat-wrapper">
            <div
                className="ai-chat-button"
                onClick={onChatSelect}
                onMouseMove={handleButtonMouseMove}
                ref={chatButtonRef}
            >
                <div className="ai-chat-content">
                    <span className="ai-text">Chat with AI Assistant</span>
                    <FaRobot className="ai-icon" />
                </div>
            </div>
        </div>
    );
}

export default AiChat; 