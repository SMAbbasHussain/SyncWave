import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import PrivateChats from "./PrivateChats";
import AiChat from "./AiChat";
import Groups from "./Groups";
import AnonymousGroups from "./AnonymousGroups";
import Profile from "./Profile";
import ChatScreen from "./ChatScreen";
import Friends from "./Friends";
import FriendsAction from "./FriendsAction";
import Settings from "./Settings";
import "../styles/Dashboard.css";
import axios from "axios";

function Dashboard({ activeNavItem = 'home' }) {
    const [socket, setSocket] = useState(null);
    const [activeChat, setActiveChat] = useState({ type: 'none' });
    const [showAnonymousGroups, setShowAnonymousGroups] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("Authentication token not found. Cannot establish socket connection.");
            return;
        }

        const newSocket = io(process.env.REACT_APP_API_URL, {
            auth: {
                token: `Bearer ${token}`
            }
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected.');
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (activeNavItem === 'home' && ['group', 'anonymousGroup'].includes(activeChat.type)) {
            setActiveChat({ type: 'none' });
            setShowAnonymousGroups(false);
        } else if (activeNavItem === 'groups' && ['private', 'ai'].includes(activeChat.type)) {
            setActiveChat({ type: 'none' });
        }
    }, [activeNavItem, activeChat.type]);

    const handleChatSelect = (chatType, chatId, pid) => {
        setActiveChat({ type: chatType, chatId: chatId, pid: pid });
    };

    const handleAnonymousGroupsToggle = (isVisible) => {
        setShowAnonymousGroups(isVisible);
        if (isVisible) {
            setActiveChat({ type: 'none' });
        }
    };

    const HomeView = () => (
        <div className="dashboard-content">
            <div className="left-sidebar-content">
                <div className="chat-section">
                    <div className="private-chats-container">
                        <PrivateChats
                            socket={socket}
                            onChatSelect={(chatId, pid) => handleChatSelect('private', chatId, pid)}
                        />
                    </div>
                    <AiChat
                        socket={socket}
                        onChatSelect={() => handleChatSelect('ai')}
                    />
                </div>
            </div>
            <ChatScreen
                socket={socket}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
            />
        </div>
    );

    const GroupsView = () => (
        <div className="dashboard-content">
            <div className="left-sidebar-content">
                <div className="groups-view">
                    <div className="top-section">
                        {!showAnonymousGroups ? (
                            <Groups
                                socket={socket}
                                onChatSelect={(groupId) => handleChatSelect('group', groupId)}
                            />
                        ) : (
                            <div className="groups-container-placeholder" style={{ height: 'calc(80vh - 120px)' }}></div>
                        )}
                    </div>
                    <AnonymousGroups
                        socket={socket}
                        onChatSelect={(groupId) => handleChatSelect('anonymousGroup', groupId)}
                        onToggle={handleAnonymousGroupsToggle}
                        isVisible={showAnonymousGroups}
                    />
                </div>
            </div>
            <ChatScreen
                socket={socket}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
            />
        </div>
    );

    const renderContent = () => {
        switch (activeNavItem) {
            case 'home':
                return <HomeView />;
            case 'groups':
                return <GroupsView />;
            case 'friends':
                return (
                    <div className="friends-dashboard-layout">
                        <div className="friends-left-section">
                            <Friends />
                        </div>
                        <div className="friends-right-section">
                            <FriendsAction />
                        </div>
                    </div>
                );
            case 'settings':
                return <Settings />;
            default:
                return <HomeView />;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-top-bar">
                <div className="wave-container">
                    <div className="wave-bg">
                        <div className="wave-line wave-line-1"></div>
                        <div className="wave-line wave-line-2"></div>
                        <div className="wave-line wave-line-3"></div>
                    </div>
                </div>
                <div className="dashboard-top-bar-content">
                    <div className="dashboard-logo">
                        <span>SYNCWAVE</span>
                    </div>
                    <Profile />
                </div>
            </div>
            {renderContent()}
        </div>
    );
}

export default Dashboard;