import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaPaperPlane, FaRobot, FaExchangeAlt, FaCopy, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import '../styles/ChatScreen.css';
import PrivateChatTopBar from './PrivateChatTopBar';
import AiChatTopBar from './AiChatTopBar';
import GroupChatTopBar from './GroupChatTopBar';
import AnonymousGroupChatTopBar from './AnonymousGroupChatTopBar';
import io from 'socket.io-client';

// Utility function to sanitize HTML content and handle newlines
const sanitizeContent = (content) => {
    const div = document.createElement('div');
    div.textContent = content;
    return div.innerHTML.replace(/\n/g, '<br />');
};

// Utility function to normalize message structure from different sources
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
        const senderId = msg.senderId?._id || msg.senderId;
        return {
            ...baseMessage,
            senderId: senderId,
            profilePic: chatType === 'anonymousGroup' ? null : msg.senderId?.profilePic || null,
            sender: senderId === currentUserId ? 'user' : 'other'
        };
    }
};

// Memoized message component to prevent unnecessary re-renders
const MessageItem = React.memo(({ msg, currentUserId, onUnsendMessage }) => {
    const [showActions, setShowActions] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const messageRef = useRef(null);
    const popupRef = useRef(null);
    const displaySender = msg.sender || (msg.senderId === currentUserId ? 'user' : 'other');

    const handleMessageClick = (e) => {
        e.stopPropagation();
        setIsSelected(true);
        setShowActions(true);
    };

    const handleCopyMessage = (e) => {
        e.stopPropagation();
        const content = msg.content.replace(/<[^>]*>/g, ''); // Strip HTML tags
        navigator.clipboard.writeText(content);
        setShowActions(false);
        setIsSelected(false);
    };

    const handleUnsendMessage = (e) => {
        e.stopPropagation();
        if (onUnsendMessage) {
            onUnsendMessage(msg.id);
        }
        setShowActions(false);
        setIsSelected(false);
    };

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target) &&
                messageRef.current && !messageRef.current.contains(e.target)) {
                setShowActions(false);
                setIsSelected(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate popup position
    const getPopupPosition = () => {
        if (!messageRef.current) return { top: true, left: true };
        const rect = messageRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const spaceRight = window.innerWidth - rect.right;
        const spaceLeft = rect.left;

        return {
            top: spaceBelow >= 100 || spaceBelow > spaceAbove,
            left: spaceRight >= 120 || spaceRight > spaceLeft
        };
    };

    const position = getPopupPosition();

    return (
        <div
            ref={messageRef}
            className={`message ${displaySender} ${msg.isError ? 'error' : ''} ${msg.isTemp ? 'pending' : ''} ${isSelected ? 'selected' : ''}`}
            role="log"
            aria-label={`Message from ${displaySender}`}
            onClick={handleMessageClick}
        >
            {displaySender === 'other' && msg.profilePic && (
                <img src={msg.profilePic} alt="Profile" className="message-avatar" />
            )}
            {displaySender === 'user' && msg.profilePic && (
                <img src={msg.profilePic} alt="Profile" className="message-avatar" />
            )}
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

            {showActions && (
                <div
                    ref={popupRef}
                    className={`message-action-popup ${position.top ? 'bottom' : 'top'} ${position.left ? 'right' : 'left'}`}
                >
                    <div className="message-action-item" onClick={handleCopyMessage}>
                        <FaCopy />
                        <span>Copy</span>
                    </div>
                    {displaySender === 'user' && !msg.isTemp && (
                        <div className="message-action-item delete" onClick={handleUnsendMessage}>
                            <FaTrash />
                            <span>Unsend</span>
                        </div>
                    )}
                </div>
            )}
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
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error('ChatScreen Error:', error, errorInfo); }
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
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);
    const [conversationMode, setConversationMode] = useState('normal');

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const activeChatRef = useRef(activeChat);

    useEffect(() => {
        activeChatRef.current = activeChat;
    }, [activeChat]);

    const currentUserId = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user'))._id;
        } catch (e) { return null; }
    }, []);

    const getAuthToken = useCallback(() => localStorage.getItem('token'), []);

    const addMessage = useCallback((newMessage) => {
        setMessages(prev => {
            const normalized = normalizeMessage(newMessage, activeChatRef.current.type, currentUserId);
            if (prev.some(msg => msg.id === normalized.id)) return prev;
            return [...prev, normalized];
        });
    }, [currentUserId]);

    const addAnonymousMessage = useCallback((content) => {
        const tempMessage = {
            content,
            isTemp: true,
            createdAt: new Date().toISOString()
        };

        // Reuse your existing `addMessage` logic
        addMessage(tempMessage);
    }, [addMessage]);


    const updateMessage = useCallback((id, updates) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === id) {
                const updatedContent = typeof updates.content === 'function' ? updates.content(msg.content) : updates.content;
                return { ...msg, ...updates, ...(updatedContent !== undefined && { content: sanitizeContent(updatedContent) }) };
            }
            return msg;
        }));
    }, []);

    const removeMessage = useCallback((id) => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);

    const fetchConversation = useCallback(async (chatInfo) => {
        if (!chatInfo || chatInfo.type === 'none') {
            setMessages([]);
            return;
        }
        const token = getAuthToken();
        if (!token) return;

        setIsFetching(true);
        setError(null);
        try {
            let endpoint = '';
            if (chatInfo.type === 'private') endpoint = `${process.env.REACT_APP_API_URL}/api/chat/messages/conversations/${chatInfo.pid}`;
            else if (chatInfo.type === 'group') endpoint = `${process.env.REACT_APP_API_URL}/api/group-messages/${chatInfo.chatId}`;
            else if (chatInfo.type === 'ai') endpoint = `${process.env.REACT_APP_API_URL}/api/ai/conversation`;

            if (!endpoint) return;

            const response = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
            const fetchedMessages = Array.isArray(response.data) ? response.data : response.data.messages || [];
            setMessages(fetchedMessages.map(msg => normalizeMessage(msg, chatInfo.type, currentUserId)));
        } catch (err) {
            console.error('Failed to fetch conversation:', err);
            setError('Failed to load conversation.');
        } finally {
            setIsFetching(false);
        }
    }, [getAuthToken, currentUserId]);

    useEffect(() => {
        const token = getAuthToken();
        if (!token) return;

        socketRef.current = io(process.env.REACT_APP_API_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true
        });

        socketRef.current.on('connect', () => console.log('Socket.IO: Connected'));
        socketRef.current.on('connect_error', (err) => console.error('Socket.IO: Connection Error:', err.message));
        socketRef.current.on('disconnect', (reason) => console.log('Socket.IO: Disconnected:', reason));

        socketRef.current.on('newMessage', (newMsg) => {
            const currentChat = activeChatRef.current;
            const isForCurrentChat = currentChat.type === 'private' && newMsg.chatId === currentChat.chatId


            // Only add the message if it's not from the current user (since we already handled it optimistically)
            if (isForCurrentChat && newMsg.senderId !== currentUserId) {
                addMessage(newMsg);
            }
        });
        socketRef.current.on('newGroupMessage', (newMsg) => {
            const currentChat = activeChatRef.current;
            const isForCurrentChat = currentChat.type === 'group' && newMsg.groupId === currentChat.chatId


            // Only add the message if it's not from the current user (since we already handled it optimistically)
            if (isForCurrentChat && newMsg.senderId !== currentUserId) {
                addMessage(newMsg);
            }
        });
        socketRef.current.on('newAnonymousGroupMessage', (newMsg) => {
            const currentChat = activeChatRef.current;

            if (!currentChat) return;

            const { groupId, senderId, content } = newMsg;

            // Add message only if it belongs to the current chat and is not from the current user
            if (groupId === currentChat.chatId && senderId !== currentUserId) {
                addAnonymousMessage(content);
            }
        });



        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [getAuthToken, addMessage, currentUserId]);

    useEffect(() => {
        fetchConversation(activeChat);
    }, [activeChat, fetchConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const content = message.trim();
        setMessage('');

        if (activeChat.type === 'ai') {
            const messageToSend = message.trim();
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
                    content: formatAIResponse(response.data.choices[0].message.content),
                    sender: 'ai',
                    timestamp: new Date().toISOString()
                };
                addMessage(aiResponse);

            } else {
                // Streaming mode with proper formatting
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
                let formattedContent = '';

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
                                    // Format the content as it streams in
                                    formattedContent += data.content;
                                    updateMessage(aiResponseId, {
                                        content: formatAIResponse(formattedContent)
                                    });
                                }
                            } catch (e) {
                                console.error('Error parsing stream data:', e);
                            }
                        }
                    }
                } finally {
                    updateMessage(aiResponseId, {
                        isStreaming: false,
                        content: formatAIResponse(formattedContent) // Final formatting pass
                    });
                }
            }
        }
        else {
            setIsLoading(true);
            setError(null);

            const tempId = `temp-${Date.now()}-${Math.random()}`;

            // Add optimistic message
            addMessage({
                id: tempId,
                content: content,
                senderId: currentUserId,
                timestamp: new Date().toISOString(),
                isTemp: true,
            });

            try {
                const endpoint = activeChat.type === 'private' ? '/api/chat/messages' : '/api/group-messages/';
                const payload = activeChat.type === 'private' ? {
                    receiverId: activeChat.pid,
                    content
                } : {
                    groupId: activeChat.chatId,
                    content
                };

                if (activeChat.type === 'anonymousGroup') {
                    // Handle anonymous group message sending separately
                    const response = await axios.post(
                        `${process.env.REACT_APP_API_URL}/api/anonymous-groups/message`, payload,
                        { headers: { 'Authorization': `Bearer ${getAuthToken()}` } }
                    );

                    const tempId = `temp-${Date.now()}-${Math.random()}`;

                    // Add optimistic message
                    addMessage({
                        id: tempId,
                        content: content,
                        senderId: currentUserId,
                        timestamp: new Date().toISOString(),
                        isTemp: true,
                    });

                } else {
                    // Handle regular message sending
                    const response = await axios.post(
                        `${process.env.REACT_APP_API_URL}${endpoint}`,
                        payload,
                        { headers: { 'Authorization': `Bearer ${getAuthToken()}` } }
                    );
                }


                // Instead of updating the message here, we'll let the socket.io event handle it
                // The server will broadcast the message back to all clients including the sender
                // But we've modified the socket.io handler to ignore messages from the current user

                // Just remove the temporary message - the real one will come via socket.io
                removeMessage(tempId);

            } catch (err) {
                console.error('Error sending message:', err);
                const errorMessage = error.response?.data?.error || error.response?.data?.message || 'An unexpected error occurred. Please try again.';
                alert(errorMessage);
                removeMessage(tempId);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const formatAIResponse = (text) => {
        if (!text) return text;

        // Replace double newlines with paragraphs
        let formatted = text.replace(/\n\n/g, '\n');

        // Replace single newlines with line breaks
        formatted = formatted.replace(/\n/g, '\n');

        // Handle markdown-style lists
        formatted = formatted.replace(/\*\s(.*?)(<br\/>|$)/g, '\n');

        // Handle code blocks (if present)
        formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        return formatted;
    };

    const toggleConversationMode = useCallback(() => setConversationMode(prev => (prev === 'normal' ? 'stream' : 'normal')), []);

    const renderTopBar = useCallback(() => {
        switch (activeChat.type) {
            case 'private': return <PrivateChatTopBar activeChat={activeChat} />;
            case 'ai': return (
                <div className="chat-screen-top-bar-content">
                    <AiChatTopBar />
                    <button className="mode-toggle" onClick={toggleConversationMode} title={`Switch to ${conversationMode === 'normal' ? 'streaming' : 'normal'} mode`}>
                        <FaExchangeAlt />
                        <span>{conversationMode === 'normal' ? 'Stream' : 'Normal'}</span>
                    </button>
                </div>
            );
            case 'group': return <GroupChatTopBar groupId={activeChat.chatId} />;
            case 'anonymousGroup': return <AnonymousGroupChatTopBar groupId={activeChat.chatId} />;
            default: return null;
        }
    }, [activeChat, conversationMode, toggleConversationMode]);

    const clearError = useCallback(() => setError(null), []);

    const handleUnsendMessage = useCallback(async (messageId) => {
        if (!messageId || !activeChat) return;

        try {
            const endpoint = activeChat.type === 'private'
                ? `${process.env.REACT_APP_API_URL}/api/chat/messages/${messageId}`
                : `${process.env.REACT_APP_API_URL}/api/group-messages/${messageId}`;

            await axios.delete(endpoint, {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });

            removeMessage(messageId);
        } catch (err) {
            console.error('Error unsending message:', err);
            setError('Failed to unsend message. Please try again.');
        }
    }, [activeChat, getAuthToken, removeMessage]);

    if (activeChat.type === 'none') {
        return (
            <div className="chat-screen-placeholder">
                <img src="/network.png" alt="No chat selected" className="network-illustration" />
            </div>
        );
    }

    return (
        <ChatErrorBoundary>
            <div className={`chat-screen-container ${activeChat.type}-chat-background`}>
                <div className="chat-screen-content">
                    <div className="chat-screen-top-bar">{renderTopBar()}</div>
                    <div className={`chat-screen-messages`} role="log" aria-live="polite">
                        <div className="messages-wrapper">
                            {isFetching && messages.length === 0 ? (
                                <div className="loading-message"><div className="loading-spinner"></div><p>Loading conversation...</p></div>
                            ) : messages.length === 0 ? (
                                <div className="welcome-message"><div><FaRobot className="empty-chat-icon" /><p>Start a conversation!</p></div></div>
                            ) : (
                                messages.map(msg => (
                                    <MessageItem
                                        key={msg.id}
                                        msg={msg}
                                        currentUserId={currentUserId}
                                        onUnsendMessage={handleUnsendMessage}
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
                                <button onClick={clearError} aria-label="Close error message" className="error-close">×</button>
                            </div>
                        )}
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={isLoading ? "Sending..." : activeChat.type === 'ai' ? "Ask AI anything..." : "Type a message..."}
                                className="message-input-field"
                                disabled={isLoading || isFetching}
                                maxLength={4000}
                                aria-label="Type your message"
                            />
                            <button type="submit" className="send-message-button" disabled={!message.trim() || isLoading}>
                                {isLoading ? <div className="loading-spinner small"></div> : <FaPaperPlane className="send-icon" />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </ChatErrorBoundary>
    );
}

export default ChatScreen;