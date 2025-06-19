import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaChevronDown, FaCog, FaMoon, FaSignOutAlt, FaUser, FaPlus } from "react-icons/fa";
import "../styles/Profile.css";
import ProfileSettingsModal from './ProfileSettingsModal';

function Profile() {
    const [showDropdown, setShowDropdown] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userStatus, setUserStatus] = useState('offline');
    const profileContainerRef = useRef(null);
    const profileRef = useRef(null);
    const heartbeatInterval = useRef(null);
    const navigate = useNavigate();
    const [reload,setReload] = useState(false);
    const [showProfileSettingsModal, setShowProfileSettingsModal] = useState(false);

    const sendHeartbeat = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token && user) {
                await axios.patch(
                    `${process.env.REACT_APP_API_URL}/api/users/heartbeat`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }
        } catch (error) {
            console.error("Heartbeat failed:", error);
            if (error.response?.status === 401) {
                handleLogout();
            }
        }
    };

    useEffect(() => {
       const loadUserData = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        // 🔥 Always fetch from server if reload is true
        if (!reload) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.username && parsedUser.email) {
                    setUser(parsedUser);
                    setUserStatus(parsedUser.status || 'online');
                    setLoading(false);

                    if (parsedUser.isLoggedIn) {
                        startHeartbeat();
                    }
                    return;
                }
            }
        }

        // ✅ Fetch latest user from backend
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });


        const completeUserData = {
            isLoggedIn: true,
            username: response.data.user.username,
            email: response.data.user.email,
            profilePic: response.data.user.profilePic,
            bio: response.data.user.bio,
            status: response.data.user.status || 'online'
        };

        localStorage.setItem('user', JSON.stringify(completeUserData));
        setUser(completeUserData);
        setUserStatus(completeUserData.status);
        startHeartbeat();

    } catch (error) {
        console.error("Failed to load user data:", error);
        if (error.response?.status === 401) {
            handleLogout();
        }
    } finally {
        setLoading(false);
        setReload(false); // ✅ Move this to the end of the function
    }
};

        const startHeartbeat = () => {
            heartbeatInterval.current = setInterval(sendHeartbeat, 5 * 60 * 1000);
        };

        loadUserData();

        const handleUserUpdate = (e) => {
            setUser(e.detail);
            setUserStatus(e.detail.status || 'online');
        };

        window.addEventListener('userUpdated', handleUserUpdate);

        return () => {
            window.removeEventListener('userUpdated', handleUserUpdate);
            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
            }
        };
    }, [reload]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && profileContainerRef.current && !profileContainerRef.current.contains(event.target) && !showProfileSettingsModal) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown, showProfileSettingsModal]);

    const handleLogout = async () => {
        console.log("Starting full logout process...");

        // Stop any ongoing processes like the heartbeat
        if (heartbeatInterval.current) {
            clearInterval(heartbeatInterval.current);
        }

        try {
            // --- 1. Unsubscribe from Push Notifications ---
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
    
                if (subscription) {
                    console.log("Found active push subscription. Unsubscribing...");
    
                    // A. Tell the backend to delete the subscription from the DB
                    await axios.post(
                        `${process.env.REACT_APP_API_URL}/api/notifications/unsubscribe`,
                        { endpoint: subscription.endpoint }, // Send the unique identifier
                        {
                            headers: {
                                // Send the token to authenticate this request
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );
    
                    // B. Unsubscribe the browser itself
                    await subscription.unsubscribe();
                    console.log("Successfully unsubscribed from browser push service.");
                } else {
                    console.log("No active push subscription to unsubscribe from.");
                }
            }
        } catch (error) {
            // Don't let a failed unsubscribe stop the user from logging out.
            // The main goal is to log them out of the UI.
            console.error("Could not unsubscribe from push notifications, but proceeding with logout:", error);
        } finally {
            // --- 2. Proceed with Standard API and Local Logout ---
            try {
                // Call the backend logout endpoint (optional but good practice)
                await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/auth/logout`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
            } catch (apiLogoutError) {
                // Log the error but don't stop the local logout
                console.error("API logout call failed, continuing with local logout:", apiLogoutError);
            }

            console.log("Clearing local session and redirecting.");
            // Clear all user data from local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Update local state
            setUser(null);
            setUserStatus('offline');
            
            // Force a full page reload to the login screen to ensure all state is cleared.
            // This is often more reliable than just using navigate().
            window.location.href = '/login';
        }
    };

    const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

 const handleSaveProfileSettings = async (updatedData) => {
    try {
        const token = localStorage.getItem('token');

        // If there's a photo file, convert it to base64
        let base64Image = null;
        if (updatedData.photo instanceof File) {
            base64Image = await convertToBase64(updatedData.photo);
        }

        const payload = {
            username: updatedData.username,
            bio: updatedData.bio,
            status: updatedData.status,
            profilePic: base64Image || user.profilePic // send previous one if unchanged
        };
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }


        // ✅ Update localStorage and state directly
        const updatedUser = {
            ...user,
            ...updatedData
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setUserStatus(updatedUser.status);
        setReload(true);

    } catch (error) {
        console.error('Error updating profile:', error.message);
        alert('Error updating profile: ' + error.message);
    }
};


    const getStatusDisplay = () => {
        if (!user) return "Offline";
        return userStatus.charAt(0).toUpperCase() + userStatus.slice(1);
    };

    const getStatusColor = () => {
        switch (userStatus) {
            case 'online': return '#4ade80';
            case 'away': return '#facc15';
            case 'offline': return '#94a3b8';
            default: return '#94a3b8';
        }
    };

    if (loading) {
        return (
            <div className="profile-section">
                <div className="profile-skeleton">
                    <div className="avatar-skeleton"></div>
                    <div className="name-skeleton"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container" ref={profileContainerRef}>
            <div
                className="profile-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <div className="profile-section" ref={profileRef}>
                    <div className="profile-content">
                        <div className="dropdown-toggle">
                            <FaChevronDown className={`dropdown-icon ${showDropdown ? "active" : ""}`} />
                        </div>
                        <div className="profile-info">
                            <span className="profile-name">
                                {user?.username || "Guest"}
                            </span>
                            <span className="profile-status" style={{ color: getStatusColor() }}>
                                <span
                                    className="status-indicator"
                                    style={{ backgroundColor: getStatusColor() }}
                                ></span>
                                {getStatusDisplay()}
                            </span>
                        </div>
                        <div className="profile-avatar-container">
                            {user?.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt="Profile"
                                    className="profile-avatar"
                                    onError={(e) => {
                                        e.target.src = "/PFP2.png";
                                        e.target.className = "profile-avatar placeholder";
                                    }}
                                />
                            ) : (
                                <div className="profile-avatar placeholder">
                                    <FaUser className="default-avatar" />
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {showDropdown && (
                <>
                    <div className="profile-dropdown-backdrop" onClick={() => setShowDropdown(false)} />
                    <div className="profile-dropdown">
                        <div className="dropdown-header">
                            <div className="dropdown-avatar-container">
                                {user?.profilePic ? (
                                    <img
                                        src={user.profilePic}
                                        alt="Profile"
                                        className="dropdown-avatar"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/100";
                                            e.target.className = "dropdown-avatar placeholder";
                                        }}
                                    />
                                ) : (
                                    <div className="dropdown-avatar placeholder">
                                        <FaUser className="default-avatar" />
                                    </div>
                                )}
                            </div>
                            <div className="dropdown-user-info">
                                <span className="dropdown-username">{user.username}</span>
                                <span className="dropdown-email">{user.email}</span>
                                <span className="dropdown-status" style={{ color: getStatusColor() }}>
                                    {getStatusDisplay()}
                                </span>
                            </div>
                        </div>
                        <div className="dropdown-divider"></div>
                        <div className="dropdown-menu">
                            <div
                                className="dropdown-item"
                                onClick={() => {
                                    setShowDropdown(false);
                                    setShowProfileSettingsModal(true);
                                }}
                            >
                                <FaCog className="dropdown-icon" />
                                <span>Profile Settings</span>
                            </div>
                            {user ? (
                                <div
                                    className="dropdown-item logout"
                                    onClick={() => {
                                        handleLogout();
                                        setShowDropdown(false);
                                    }}
                                >
                                    <FaSignOutAlt className="dropdown-icon" />
                                    <span>Sign Out</span>
                                </div>
                            ) : (
                                <div
                                    className="dropdown-item"
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate('/signup');
                                    }}
                                >
                                    <FaPlus className="dropdown-icon" />
                                    <span>Create Account</span>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <ProfileSettingsModal
                isOpen={showProfileSettingsModal}
                onClose={() => setShowProfileSettingsModal(false)}
                user={user}
                onSave={handleSaveProfileSettings}
            />
        </div>
    );
}

export default Profile;