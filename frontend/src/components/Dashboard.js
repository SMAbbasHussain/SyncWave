import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
// 1. Import ToastContainer and toast from react-toastify
import { ToastContainer, toast } from 'react-toastify';
// 2. Import the CSS for styling
import 'react-toastify/dist/ReactToastify.css';

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

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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
        window.socket = newSocket;

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected.');
        });

        
        
        // 3. Listen for the 'notification' event from the server
        newSocket.on('notification', (notification) => {
            console.log('New Notification Received:', notification);

            // Display a different toast style based on the notification type
            switch (notification.type) {
                case 'private':
                    toast.info(`New message from ${notification.title}`, {
                        onClick: () => handleNotificationClick(notification)
                    });
                    break;
                case 'group':
                    toast.success(`New message in ${notification.title}`, {
                        onClick: () => handleNotificationClick(notification)
                    });
                    break;
                case 'mention':
                    toast.warn(`You were mentioned in ${notification.title}`, {
                        // Mentions can have a longer auto-close time
                        autoClose: 10000,
                        onClick: () => handleNotificationClick(notification)
                    });
                    break;
                default:
                    toast(notification.body);
            }
        });

        return () => {
            newSocket.off('notification'); // Clean up the listener
            newSocket.disconnect();
        };
    }, []);

    // **** NEW: useEffect for Push Notification Subscription ****
    useEffect(() => {
        const subscribeToPushNotifications = async () => {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    
                    // Check if we already have a subscription
                    let subscription = await registration.pushManager.getSubscription();
                    
                    if (subscription === null) {
                        // We don't have a subscription, so create one
                        console.log('No subscription found, subscribing...');
                        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications/vapid-public-key`);
                        const vapidPublicKey = response.data.publicKey;
                        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

                        subscription = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: convertedVapidKey
                        });

                        // Send the new subscription to the backend
                        await axios.post(`${process.env.REACT_APP_API_URL}/api/notifications/subscribe`, subscription, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        console.log('User subscribed successfully.');
                    } else {
                        console.log('User is already subscribed.');
                    }
                } catch (error) {
                    console.error('Failed to subscribe the user: ', error);
                }
            }
        };

        // Ask for permission and subscribe
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                subscribeToPushNotifications();
            } else {
                console.warn('Notification permission denied.');
            }
        });
    }, []); // Run this once when the dashboard loads

    const handleNotificationClick = (notification) => {
        // This function is called when a user clicks a toast.
        // It should navigate the user to the correct chat.
        console.log("Notification clicked, navigating to:", notification);
        if (notification.type === 'private') {
            // navigate('/dashboard/private');
            handleChatSelect('private', notification.chatId, notification.sender._id);
        } else if (notification.type === 'group' || notification.type === 'mention') {
            // You may need to switch the main view to 'groups' if it's not already active
            // navigate('/dashboard/groups'); // Example if you have routing inside dashboard
            handleChatSelect('group', notification.groupId);
        }
    };

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
            {/* 4. Render the ToastContainer component here. It's invisible until a toast is triggered. */}
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
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