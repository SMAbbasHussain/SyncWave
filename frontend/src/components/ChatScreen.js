import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaPaperPlane, FaRobot, FaExchangeAlt } from 'react-icons/fa';
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
            else if (chatInfo.type === 'group' || chatInfo.type === 'anonymousGroup') endpoint = `${process.env.REACT_APP_API_URL}/api/chat/messages/group/${chatInfo.chatId}`;
            else if (chatInfo.type === 'ai') endpoint = `${process.env.REACT_APP_API_URL}/api/ai/conversation`;
            
            if (!endpoint) return;

            const response = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } });
            const fetchedMessages = Array.isArray(response.data) ? response.data : response.data.messages || [];
            const normalized = fetchedMessages.map(msg => normalizeMessage(msg, chatInfo.type, currentUserId));
            setMessages(normalized);
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
            const isForCurrentChat = (currentChat.type === 'private' || currentChat.type === 'group' || currentChat.type === 'anonymousGroup') && newMsg.chatId === currentChat.chatId;
            if (isForCurrentChat) {
                addMessage(newMsg);
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [getAuthToken, addMessage]);

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
        setIsLoading(true);
        setError(null);
        
        // --- BRANCH FOR AI CHAT vs. REAL-TIME CHAT ---

        if (activeChat.type === 'ai') {
            // AI CHAT LOGIC (NO SOCKETS)
            const userMessage = { role: 'user', content };
            addMessage({ ...userMessage, sender: 'user', timestamp: new Date().toISOString() });
            
            const apiMessages = [...messages, { role: 'user', content }].map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.content.replace(/<[^>]*>/g, '') // Strip HTML for API
            }));

            try {
                if (conversationMode === 'normal') {
                    // Normal Request/Response
                    const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/ai/complete`, { messages: apiMessages }, { headers: { 'Authorization': `Bearer ${getAuthToken()}` } });
                    addMessage({ ...response.data.choices[0].message, sender: 'ai', timestamp: new Date().toISOString() });
                } else {
                    // Streaming Response
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/ai/complete/stream`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
                        body: JSON.stringify({ messages: apiMessages })
                    });
                    if (!response.ok) throw new Error(`Stream request failed: ${response.status}`);
                    
                    const aiResponseId = `ai-${Date.now()}`;
                    addMessage({ id: aiResponseId, content: '', sender: 'ai', timestamp: new Date().toISOString(), isStreaming: true });
                    
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';
                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) break;
                        buffer += decoder.decode(value, { stream: true });
                        let boundary;
                        while ((boundary = buffer.indexOf('\n')) !== -1) {
                            const line = buffer.substring(0, boundary).trim();
                            buffer = buffer.substring(boundary + 1);
                            if (line.startsWith('data:') && !line.includes('[DONE]')) {
                                try {
                                    const data = JSON.parse(line.substring(5).trim());
                                    if (data.content) {
                                        updateMessage(aiResponseId, { content: (prev) => prev + data.content });
                                    }
                                } catch (e) { console.error('Error parsing stream data:', e); }
                            }
                        }
                    }
                    updateMessage(aiResponseId, { isStreaming: false });
                }
            } catch (err) {
                console.error('Error with AI chat:', err);
                addMessage({ content: 'Sorry, I ran into an error. Please try again.', sender: 'ai', isError: true, timestamp: new Date().toISOString() });
            } finally {
                setIsLoading(false);
            }
        } else {
            // PRIVATE & GROUP CHAT LOGIC (SOCKET-BASED)
            const tempId = `temp-${Date.now()}`;
            addMessage({ id: tempId, content, senderId: currentUserId, timestamp: new Date().toISOString(), isTemp: true });

            try {
                const endpoint = activeChat.type === 'private' ? '/api/chat/messages' : '/api/chat/messages/group';
                const payload = activeChat.type === 'private' ? { receiverId: activeChat.pid, content } : { chatId: activeChat.chatId, content };
                await axios.post(`${process.env.REACT_APP_API_URL}${endpoint}`, payload, { headers: { 'Authorization': `Bearer ${getAuthToken()}` } });
                removeMessage(tempId); // Remove temp message, real one comes from socket
            } catch (err) {
                console.error('Error sending message:', err);
                setError('Failed to send message.');
                removeMessage(tempId); // Remove failed temp message
            } finally {
                setIsLoading(false);
            }
        }
    };

    const toggleConversationMode = useCallback(() => {
        setConversationMode(prev => (prev === 'normal' ? 'stream' : 'normal'));
    }, []);

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

    if (activeChat.type === 'none') {
        return (
            <div className="chat-screen-placeholder">
                <img src="/network.png" alt="No chat selected" className="network-illustration" />
                <p>Select a chat to start messaging</p>
            </div>
        );
    }

    return (
        <ChatErrorBoundary>
            <div className={`chat-screen-container ${activeChat.type}-chat-background`}>
                <div className="chat-screen-content">
                    <div className="chat-screen-top-bar">{renderTopBar()}</div>
                    <div className={`chat-screen-messages ${isFetching ? 'loading' : ''}`} role="log" aria-live="polite">
                        <div className="messages-wrapper">
                            {isFetching && messages.length === 0 ? (
                                <div className="loading-message"><div className="loading-spinner"></div><p>Loading conversation...</p></div>
                            ) : messages.length === 0 ? (
                                <div className="welcome-message"><FaRobot className="empty-chat-icon" /><p>Start the conversation!</p></div>
                            ) : (
                                messages.map(msg => <MessageItem key={msg.id} msg={msg} currentUserId={currentUserId} />)
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
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', width: '100%' }}>
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={isLoading ? "Sending..." : activeChat.type === 'ai' ? "Ask AI anything..." : "Type a message..."}
                                className="message-input-field"
                                disabled={isLoading || isFetching}
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