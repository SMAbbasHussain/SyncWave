import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPaperPlane, FaRobot, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';
import '../styles/ChatScreen.css';
import PrivateChatTopBar from './PrivateChatTopBar';
import AiChatTopBar from './AiChatTopBar';
import GroupChatTopBar from './GroupChatTopBar';
import AnonymousGroupChatTopBar from './AnonymousGroupChatTopBar';

// Memoized message component to prevent unnecessary re-renders
const MessageItem = React.memo(({ msg }) => {
    return (
        <div className={`message ${msg.sender} ${msg.isError ? 'error' : ''}`}>
            <div className="message-content">
                {msg.content}
                {msg.isStreaming && (
                    <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
            </div>
            <span className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
    );
});

function ChatScreen({ activeChat }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [conversationMode, setConversationMode] = useState('normal');
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const aiGlowDotRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const isMounted = useRef(true);

    // Message state management helpers
    const addMessage = useCallback((newMessage) => {
        setMessages(prev => [...prev, newMessage]);
    }, []);

    const updateMessage = useCallback((id, updates) => {
        setMessages(prev => prev.map(msg =>
            msg.id === id ? { ...msg, ...updates } : msg
        ));
    }, []);

    // Fetch conversation history when AI chat is active
    useEffect(() => {
        isMounted.current = true;

        const fetchConversation = async () => {
            if (activeChat.type !== 'ai') {
                setMessages([]);
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/ai/conversation`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (isMounted.current && response.data.messages) {
                    setMessages(response.data.messages.map(msg => ({
                        id: Date.now() + Math.random(),
                        content: msg.content,
                        sender: msg.role === 'user' ? 'user' : 'ai',
                        timestamp: msg.timestamp,
                        isStreaming: false
                    })));
                }
            } catch (err) {
                console.error('Failed to fetch conversation:', err);
            }
        };

        fetchConversation();

        return () => {
            isMounted.current = false;
        };
    }, [activeChat.type]);

    // Handle scroll events with debouncing
    const handleScroll = useCallback((e) => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        setIsScrolling(true);
        scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
        }, 2000);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            isMounted.current = false;
        };
    }, []);

    // Smooth scroll to bottom
    useEffect(() => {
        const scrollToBottom = () => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start'
                });
            }
        };

        const timer = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    // AI glow effect
    const handleMouseMove = useCallback((e) => {
        if (chatContainerRef.current && activeChat.type === 'ai' && aiGlowDotRef.current) {
            const rect = chatContainerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            aiGlowDotRef.current.style.left = `${x}px`;
            aiGlowDotRef.current.style.top = `${y}px`;
        }
    }, [activeChat.type]);

    // Process streaming buffer
    const processStreamBuffer = useCallback((buffer, aiResponseId) => {
        const lines = buffer.split('\n');
        let newContent = '';

        for (const line of lines) {
            if (line.startsWith('data:') && !line.includes('[DONE]')) {
                try {
                    const data = JSON.parse(line.substring(5));
                    if (data.choices[0].delta.content) {
                        newContent += data.choices[0].delta.content;
                    }
                } catch (e) {
                    console.error('Error parsing stream data:', e);
                }
            }
        }

        if (newContent && isMounted.current) {
            updateMessage(aiResponseId, { content: prev => prev + newContent });
        }
    }, [updateMessage]);

    // Handle sending messages
    // In your handleSendMessage function, update the streaming part:
const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const newMessage = {
        id: Date.now(),
        content: message.trim(),
        sender: 'user',
        timestamp: new Date().toISOString()
    };

    addMessage(newMessage);
    setMessage('');
    setIsLoading(true);
    setError(null);

    if (activeChat.type !== 'ai') {
        setTimeout(() => {
            const receivedMessage = {
                id: Date.now() + 1,
                content: "This is a sample response from the other user/group.",
                sender: 'other',
                timestamp: new Date().toISOString()
            };
            addMessage(receivedMessage);
            setIsLoading(false);
        }, 1000);
        return;
    }

    try {
        const apiMessages = [
            ...messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            {
                role: 'user',
                content: message.trim()
            }
        ];

        if (conversationMode === 'normal') {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/complete`, {
                messages: apiMessages
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const aiResponse = {
                id: Date.now() + 1,
                content: response.data.choices[0].message.content,
                sender: 'ai',
                timestamp: new Date().toISOString()
            };
            addMessage(aiResponse);
            
            // Explicitly save the AI response to the database
            await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/conversation/save`, {
                role: 'assistant',
                content: aiResponse.content
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } else {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/ai/complete/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    messages: apiMessages
                })
            });

            if (!response.ok) throw new Error('Stream request failed');

            const aiResponse = {
                id: Date.now() + 1,
                content: '',
                sender: 'ai',
                timestamp: new Date().toISOString(),
                isStreaming: true
            };
            addMessage(aiResponse);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullResponse = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                let boundary;
                while ((boundary = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.substring(0, boundary).trim();
                    buffer = buffer.substring(boundary + 1);

                    if (!line.startsWith('data:')) continue;
                    if (line.includes('[DONE]')) break;

                    try {
                        const data = JSON.parse(line.substring(5).trim());
                        if (data.content) {
                            fullResponse += data.content;
                            updateMessage(aiResponse.id, { 
                                content: prev => prev + data.content,
                                isStreaming: true
                            });
                        }
                    } catch (e) {
                        console.error('Error parsing stream data:', e);
                    }
                }
            }

            // Save the complete response after streaming finishes
            updateMessage(aiResponse.id, { isStreaming: false });
            await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/conversation/save`, {
                role: 'assistant',
                content: fullResponse
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        }
    } catch (err) {
        console.error('Error sending message:', err);
        setError(err.response?.data?.error || 'Failed to get AI response');

        const errorMessage = {
            id: Date.now() + 1,
            content: 'Sorry, there was an error processing your request. Please try again.',
            sender: 'ai',
            timestamp: new Date().toISOString(),
            isError: true
        };
        addMessage(errorMessage);
    } finally {
        if (isMounted.current) {
            setIsLoading(false);
        }
    }
};

    const toggleConversationMode = useCallback(() => {
        setConversationMode(prev => prev === 'normal' ? 'stream' : 'normal');
    }, []);

    const renderTopBar = useCallback(() => {
        switch (activeChat.type) {
            case 'private':
                return <PrivateChatTopBar userId={activeChat.chatId} />;
            case 'ai':
                return (
                    <div className="ai-chat-top-bar-wrapper">
                        <AiChatTopBar />
                        <button
                            className="mode-toggle"
                            onClick={toggleConversationMode}
                            title={`Switch to ${conversationMode === 'normal' ? 'streaming' : 'normal'} mode`}
                        >
                            <FaExchangeAlt />
                            <span>{conversationMode === 'normal' ? 'Stream' : 'Normal'}</span>
                        </button>
                    </div>
                );
            case 'group':
                return <GroupChatTopBar groupId={activeChat.chatId} />;
            case 'anonymousGroup':
                return <AnonymousGroupChatTopBar groupId={activeChat.chatId} />;
            default:
                return null;
        }
    }, [activeChat.type, activeChat.chatId, conversationMode, toggleConversationMode]);

    if (activeChat.type === 'none') {
        return (
            <div className="chat-screen-placeholder">
                <img src="/Network.png" alt="Network" />
            </div>
        );
    }

    const chatContainerClass = `chat-screen-container ${activeChat.type !== 'none' ? activeChat.type + '-chat-background' : ''}`;

    return (
        <div className={chatContainerClass} ref={chatContainerRef} onMouseMove={handleMouseMove}>
            {activeChat.type === 'ai' && (
                <>
                    <div className="ai-chat-glow-container">
                        <div className="ai-chat-glow-dot" ref={aiGlowDotRef}></div>
                    </div>
                    <div className="ai-chat-robot-bg">
                        <img src="/robo.png" alt="AI Robot" />
                    </div>
                </>
            )}
            <div className="chat-screen-top-bar">
                {renderTopBar()}
            </div>
            <div
                className={`chat-screen-messages ${isScrolling ? 'scrolling' : ''}`}
                onScroll={handleScroll}
            >
                <div className="messages-wrapper">
                    {messages.length === 0 && activeChat.type !== 'ai' ? (
                        <div className="welcome-message">
                            <p>Start of chat history...</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <MessageItem key={msg.id} msg={msg} />
                        ))
                    )}
                    {isLoading && activeChat.type === 'ai' && messages[messages.length - 1]?.sender !== 'ai' && (
                        <div className="message ai loading-indicator">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
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
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="send-message-button"
                    disabled={!message.trim() || isLoading}
                >
                    <FaPaperPlane className="send-icon" />
                </button>
            </form>
            {error && (
                <div className="ai-chat-error">
                    {error}
                </div>
            )}
        </div>
    );
}

export default ChatScreen;