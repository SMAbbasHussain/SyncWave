import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaPaperPlane, FaRobot, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';
import '../styles/ChatScreen.css';
import PrivateChatTopBar from './PrivateChatTopBar';
import AiChatTopBar from './AiChatTopBar';
import GroupChatTopBar from './GroupChatTopBar';
import AnonymousGroupChatTopBar from './AnonymousGroupChatTopBar';
import io from 'socket.io-client';

// Utility function to sanitize HTML content
const sanitizeContent = (content) => {
    const div = document.createElement('div');
    div.textContent = content;
    // Also convert newlines to <br> tags for proper display
    return div.innerHTML.replace(/\n/g, '<br />');
};

// Utility function to normalize message structure
const normalizeMessage = (msg, chatType, currentUserId) => {
    const baseMessage = {
        id: msg._id || msg.id || `temp-${Date.now()}-${Math.random()}`,
        content: sanitizeContent(msg.content || ''),
        timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
        isError: msg.isError || false,
        isStreaming: msg.isStreaming || false,
        isTemp: msg.isTemp || false
    };

    if (chatType === 'ai') {
        return {
            ...baseMessage,
            sender: msg.role === 'user' || msg.sender === 'user' ? 'user' : 'ai'
        };
    } else {
        // Handle private/group messages where senderId might be an object
        const senderId = msg.senderId?._id || msg.senderId;
        return {
            ...baseMessage,
            senderId: senderId,
            sender: senderId === currentUserId ? 'user' : 'other'
        };
    }
};

// Memoized message component to prevent unnecessary re-renders
const MessageItem = React.memo(({ msg, currentUserId }) => {
    const displaySender = msg.sender || (msg.senderId === currentUserId ? 'user' : 'other');

    return (
        <div
            className={`message ${displaySender} ${msg.isError ? 'error' : ''}`}
            role="log"
            aria-label={`Message from ${displaySender}`}
        >
            <div className="message-content">
                <span dangerouslySetInnerHTML={{ __html: msg.content }} />
                {msg.isStreaming && (
                    <div className="typing-indicator" aria-label="AI is typing">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
            </div>
            <span className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </span>
        </div>
    );
});

MessageItem.displayName = 'MessageItem';

// Error Boundary Component
class ChatErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ChatScreen Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="chat-error-boundary">
                    <FaRobot className="error-icon" />
                    <p>Something went wrong with the chat. Please refresh the page.</p>
                    <button onClick={() => window.location.reload()}>Refresh</button>
                </div>
            );
        }

        return this.props.children;
    }
}

function ChatScreen({ activeChat }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);
    const [conversationMode, setConversationMode] = useState('normal');

    // Refs
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const isMounted = useRef(true);
    const socketRef = useRef(null);
    const retryTimeoutRef = useRef(null);

    // Get current user ID with validation
    const currentUserId = useMemo(() => {
        const userString = localStorage.getItem('user');
        if (!userString) {
            console.warn('No user found in localStorage');
            return null;
        }

        try {
            const user = JSON.parse(userString);
            const userId = user._id;
            if (!userId) {
                console.warn('No _id found in user object');
            }
            return userId;
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            return null;
        }
    }, []);

    // Get auth token with validation
    const getAuthToken = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication required. Please log in again.');
        }
        return token;
    }, []);

    // Message state management helpers
    const addMessage = useCallback((newMessage) => {
        if (!isMounted.current) return;

        setMessages(prev => {
            const normalized = normalizeMessage(newMessage, activeChat.type, currentUserId);
            // Prevent duplicate messages
            const exists = prev.some(msg => msg.id === normalized.id);
            if (exists) return prev;

            return [...prev, normalized];
        });
    }, [activeChat.type, currentUserId]);

    const updateMessage = useCallback((id, updates) => {
        if (!isMounted.current) return;

        setMessages(prev => prev.map(msg => {
            if (msg.id === id) {
                const updatedContent = typeof updates.content === 'function'
                    ? updates.content(msg.content)
                    : updates.content;

                return {
                    ...msg,
                    ...updates,
                    ...(updatedContent !== undefined && { content: sanitizeContent(updatedContent) })
                };
            }
            return msg;
        }));
    }, []);

    const removeMessage = useCallback((id) => {
        if (!isMounted.current) return;
        setMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);

    // Consolidated fetch conversation function
    const fetchConversation = useCallback(async (chatInfo) => {
        if (!chatInfo || chatInfo.type === 'none') {
            setMessages([]);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        setIsFetching(true);
        setError(null);

        try {
            let response;
            let normalizedMessages = [];
            console.log(chatInfo);

            if (chatInfo.type === 'ai') {
                response = await axios.get(`${process.env.REACT_APP_API_URL}/api/ai/conversation`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                });

                if (response.data.messages) {
                    normalizedMessages = response.data.messages.map(msg =>
                        normalizeMessage(msg, 'ai', currentUserId)
                    );
                }
            } else {
                // Handle private, group, and anonymous group chats
                const endpoint = chatInfo.type === 'group' || chatInfo.type === 'anonymousGroup'
                    ? `${process.env.REACT_APP_API_URL}/api/chat/messages/group/${chatInfo.chatId}`
                    : `${process.env.REACT_APP_API_URL}/api/chat/messages/conversations/${chatInfo.pid}`;

                response = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { page: 1, limit: 50 },
                    timeout: 10000
                });

                if (response.data) {
                    const messageData = Array.isArray(response.data) ? response.data : response.data.messages || [];
                    normalizedMessages = messageData.map(msg =>
                        normalizeMessage(msg, chatInfo.type, currentUserId)
                    );
                }
            }

            if (isMounted.current) {
                setMessages(normalizedMessages);
            }
        } catch (err) {
            console.error('Failed to fetch conversation:', err);
            if (isMounted.current) {
                if (err.code === 'ECONNABORTED') {
                    setError('Connection timeout. Please check your internet connection.');
                } else if (err.response?.status === 401) {
                    setError('Authentication expired. Please log in again.');
                } else {
                    setError('Failed to load conversation. Please try again.');
                }
            }
        } finally {
            if (isMounted.current) {
                setIsFetching(false);
            }
        }
    }, [getAuthToken, currentUserId]);

    // Socket setup with proper cleanup
    const setupSocket = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token || activeChat.type === 'none' || activeChat.type === 'ai') {
            return;
        }

        // Cleanup existing connection
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        console.log('Attempting to connect to Socket.IO...'); // Debug log


        try {
            socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
                auth: { token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                withCredentials: true,
                forceNew: true
            });

            socketRef.current.on('connect', () => {
                console.log('Socket.IO connected successfully!');
                setError(null);
            });

            socketRef.current.on('disconnect', (reason) => {
                console.log('Socket.IO disconnected:', reason);
                if (reason === 'io server disconnect') {
                    // Try to reconnect after a delay
                    setTimeout(setupSocket, 1000);
                }
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('Socket.IO connection error:', err.message);
                setError('Reconnecting...');
                setTimeout(setupSocket, 1000);
            });

            socketRef.current.on('newMessage', (newMsg) => {
                if (!isMounted.current) return;

                const shouldAddMessage =
                    (activeChat.type === 'private' && newMsg.senderId === activeChat.pid) ||
                    (activeChat.type === 'group' && newMsg.chatId === activeChat.chatId) ||
                    (activeChat.type === 'anonymousGroup' && newMsg.chatId === activeChat.chatId);

                if (shouldAddMessage) {
                    addMessage({
                        _id: newMsg._id,
                        content: newMsg.content,
                        senderId: newMsg.senderId,
                        createdAt: newMsg.createdAt,
                        isError: false
                    });
                }
            });

            socketRef.current.on('messagesRead', (data) => {
                // Handle read receipts if needed
                console.log('Messages read:', data);
            });

        } catch (error) {
            console.error('Socket setup error:', error);
            setError('Failed to establish real-time connection.');
        }
    }, [getAuthToken, activeChat, addMessage]);

    // Main effect for chat changes
    useEffect(() => {
        isMounted.current = true;

        setupSocket();
        fetchConversation(activeChat);
        

        return () => {
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [activeChat]);

    // Handle scroll events with debouncing
    const handleScroll = useCallback(() => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        setIsScrolling(true);

        scrollTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
                setIsScrolling(false);
            }
        }, 2000);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;

            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        const scrollToBottom = () => {
            if (messagesEndRef.current && !isScrolling) {
                messagesEndRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start'
                });
            }
        };

        const timer = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timer);
    }, [messages, isScrolling]);

    // Retry mechanism
    const retryOperation = useCallback((operation, maxRetries = 3) => {
        let retryCount = 0;

        const attemptOperation = async () => {
            try {
                await operation();
            } catch (error) {
                retryCount++;
                if (retryCount < maxRetries) {
                    console.log(`Retrying operation (${retryCount}/${maxRetries})`);
                    retryTimeoutRef.current = setTimeout(attemptOperation, 1000 * retryCount);
                } else {
                    throw error;
                }
            }
        };

        return attemptOperation();
    }, []);

    // Handle sending messages
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const messageToSend = message.trim();
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const tempTimestamp = new Date().toISOString();

        // Add temporary message
        const tempMessage = {
            id: tempId,
            content: messageToSend,
            senderId: currentUserId,
            timestamp: tempTimestamp,
            isTemp: true,
            sender: 'user'
        };

        addMessage(tempMessage);
        setMessage('');
        setIsLoading(true);
        setError(null);

        try {
            // Handle private/group messages
            if (activeChat.type === 'private') {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chat/messages`, {
                    receiverId: activeChat.pid,
                    content: messageToSend,
                    attachments: []
                }, {
                    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
                    timeout: 10000
                });

                // Replace temporary message with server-confirmed message
                updateMessage(tempId, {
                    id: response.data._id,
                    timestamp: response.data.createdAt,
                    isTemp: false
                });

                return;
            }

            // Handle group messages
            if (activeChat.type === 'group' || activeChat.type === 'anonymousGroup') {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/chat/messages/group`, {
                    chatId: activeChat.chatId,
                    content: messageToSend,
                    attachments: []
                }, {
                    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
                    timeout: 10000
                });

                updateMessage(tempId, {
                    id: response.data._id,
                    timestamp: response.data.createdAt,
                    isTemp: false
                });

                return;
            }

            // Handle AI messages
            if (activeChat.type === 'ai') {
                // Remove temporary message for AI chat
                removeMessage(tempId);

                const apiMessages = [
                    ...messages
                        .filter(msg => !msg.isTemp)
                        .map(msg => ({
                            role: msg.sender === 'user' ? 'user' : 'assistant',
                            content: msg.content.replace(/<[^>]*>/g, '') // Strip HTML for API
                        })),
                    {
                        role: 'user',
                        content: messageToSend
                    }
                ];

                // Add user message
                addMessage({
                    id: `user-${Date.now()}`,
                    content: messageToSend,
                    sender: 'user',
                    timestamp: new Date().toISOString()
                });

                if (conversationMode === 'normal') {
                    const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/complete`, {
                        messages: apiMessages
                    }, {
                        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
                        timeout: 30000
                    });

                    const aiResponse = {
                        id: `ai-${Date.now()}`,
                        content: response.data.choices[0].message.content,
                        sender: 'ai',
                        timestamp: new Date().toISOString()
                    };
                    addMessage(aiResponse);

                } else {
                    // Streaming mode
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/ai/complete/stream`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`
                        },
                        body: JSON.stringify({ messages: apiMessages })
                    });

                    if (!response.ok) {
                        throw new Error(`Stream request failed: ${response.status}`);
                    }

                    const aiResponseId = `ai-${Date.now()}`;
                    const aiResponse = {
                        id: aiResponseId,
                        content: '',
                        sender: 'ai',
                        timestamp: new Date().toISOString(),
                        isStreaming: true
                    };
                    addMessage(aiResponse);

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';

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
                                        updateMessage(aiResponseId, {
                                            content: (prevContent) => prevContent + data.content
                                        });
                                    }
                                } catch (e) {
                                    console.error('Error parsing stream data:', e);
                                }
                            }
                        }
                    } finally {
                        updateMessage(aiResponseId, { isStreaming: false });
                    }
                }
            }
        } catch (err) {
            console.error('Error sending message:', err);

            // Remove temporary message on error
            if (activeChat.type !== 'ai') {
                removeMessage(tempId);
            }

            let errorMessage = 'Failed to send message. Please try again.';
            if (err.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout. Please check your connection.';
            } else if (err.response?.status === 401) {
                errorMessage = 'Authentication expired. Please log in again.';
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            }

            setError(errorMessage);

            if (activeChat.type === 'ai') {
                const errorResponse = {
                    id: `error-${Date.now()}`,
                    content: 'Sorry, there was an error processing your request. Please try again.',
                    sender: 'ai',
                    timestamp: new Date().toISOString(),
                    isError: true
                };
                addMessage(errorResponse);
            }
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
                            aria-label={`Current mode: ${conversationMode}. Click to switch.`}
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
    }, [activeChat.type, activeChat.chatId, activeChat, conversationMode, toggleConversationMode]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    if (activeChat.type === 'none') {
        return (
            <div className="chat-screen-placeholder">
                <img
                    src="/network.png"
                    alt="No chat selected"
                    className="network-illustration"
                />
                <p>Select a chat to start messaging</p>
            </div>
        );
    }

    const chatContainerClass = `chat-screen-container ${activeChat.type !== 'none' ? activeChat.type + '-chat-background' : ''}`;

    return (
        <ChatErrorBoundary>
            <div className={chatContainerClass}>
                <div className="chat-screen-content">
                    <div className="chat-screen-top-bar">
                        {renderTopBar()}
                    </div>

                    <div
                        className={`chat-screen-messages ${isScrolling ? 'scrolling' : ''} ${isFetching ? 'loading' : ''}`}
                        ref={chatContainerRef}
                        onScroll={handleScroll}
                        role="log"
                        aria-live="polite"
                        aria-label="Chat messages"
                    >
                        <div className="messages-wrapper">
                            {isFetching && messages.length === 0 ? (
                                <div className="loading-message" aria-label="Loading messages">
                                    <div className="loading-spinner"></div>
                                    <p>Loading conversation...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="welcome-message">
                                    <div>
                                        <FaRobot className="empty-chat-icon" />
                                        <p>Start a conversation!</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <MessageItem
                                        key={msg.id}
                                        msg={msg}
                                        currentUserId={currentUserId}
                                    />
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="chat-screen-input">
                        {error && (
                            <div className="chat-error" role="alert">
                                <span>{error}</span>
                                <button
                                    onClick={clearError}
                                    aria-label="Close error message"
                                    className="error-close"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        <form
                            onSubmit={handleSendMessage}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}
                        >
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={
                                    isLoading ? "Sending..." :
                                        activeChat.type === 'ai' ? "Ask AI anything..." :
                                            "Type a message..."
                                }
                                className="message-input-field"
                                disabled={isLoading}
                                maxLength={4000}
                                aria-label="Type your message"
                            />

                            <button
                                type="submit"
                                className="send-message-button"
                                disabled={!message.trim() || isLoading}
                                aria-label={isLoading ? "Sending message..." : "Send message"}
                            >
                                {isLoading ? (
                                    <div className="loading-spinner small"></div>
                                ) : (
                                    <FaPaperPlane className="send-icon" />
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </ChatErrorBoundary>
    );
}

export default ChatScreen;