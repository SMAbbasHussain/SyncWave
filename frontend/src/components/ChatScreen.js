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
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
    );
});

function ChatScreen({ activeChat}) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [conversationMode, setConversationMode] = useState('normal');
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const isMounted = useRef(true);


   

    // Message state management helpers
    const addMessage = useCallback((newMessage) => {
        setMessages(prev => [...prev, newMessage]);
    }, []);

    // Fixed updateMessage function
    const updateMessage = useCallback((id, updates) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === id) {
                const updatedMsg = { ...msg };

                // Handle each update property individually
                Object.keys(updates).forEach(key => {
                    if (key === 'content' && typeof updates[key] === 'function') {
                        // If content is a function, apply it to current content
                        updatedMsg[key] = updates[key](msg[key] || '');
                    } else {
                        // Otherwise, just set the value
                        updatedMsg[key] = updates[key];
                    }
                });

                return updatedMsg;
            }
            return msg;
        }));
    }, []);

    // Fetch conversation history when AI chat is active
    useEffect(() => {
        isMounted.current = true;

        const fetchConversation = async () => {
            if (activeChat.type !== 'ai') {
                 try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/chat/messages/conversations/${activeChat.pid}`, // or .participantId if it's called that
            {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    page: 1,
                    limit: 50
                }
            }
        );

        setMessages(response.data); 
        return;// assuming `setMessages` updates the message state
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return;
    }
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

    // Scroll to bottom when new messages arrive
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

    // Handle sending messages
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
        const messageToSend = message.trim();
        setMessage('');
        setIsLoading(true);
        setError(null);

        if (activeChat.type !== 'ai') {
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chat/messages`, {
            receiverId: activeChat.pid, // assuming activeChat has the userId of the other user
            content: messageToSend,
            attachments: [] // or whatever you're handling
        }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const savedMessage = {
            id: response.data._id,
            content: response.data.content,
            sender: 'user',
            timestamp: response.data.createdAt || new Date().toISOString()
        };

    } catch (err) {
        console.error('Error sending private message:', err);
        setError('Failed to send private message.');
    } finally {
        setIsLoading(false);
    }

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
                    content: messageToSend
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

            } else {
                // STREAMING MODE - Fixed implementation
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

                try {
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
                                    // Update the message content by appending new content
                                    updateMessage(aiResponse.id, {
                                        content: (prevContent) => prevContent + data.content
                                    });
                                }
                            } catch (e) {
                                console.error('Error parsing stream data:', e);
                            }
                        }
                    }
                } finally {
                    // Always clean up the streaming state and save the message
                    updateMessage(aiResponse.id, { isStreaming: false });
                }
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
                return <PrivateChatTopBar activeChat={activeChat} />;
            case 'ai':
                return (
                    <div className="chat-screen-top-bar-content">
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
                <img
                    src="/network.png"
                    alt="No chat selected"
                    className="network-illustration"
                />
            </div>
        );
    }

    const chatContainerClass = `chat-screen-container ${activeChat.type !== 'none' ? activeChat.type + '-chat-background' : ''}`;
    

   



    return (
        <div className={chatContainerClass}>
            <div className="chat-screen-content">
                <div className="chat-screen-top-bar">
                    {renderTopBar()}
                </div>

                <div
                    className={`chat-screen-messages ${isScrolling ? 'scrolling' : ''}`}
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                >
                    <div className="messages-wrapper">
                        {messages.length === 0 ? (
                            <div className="welcome-message">
                                <div>
                                    <FaRobot className="empty-chat-icon" />
                                    <p>Start a conversation!</p>
                                </div>
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

                <div className="chat-screen-input">
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
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
            </div>
        </div>
    );
}


export default ChatScreen;