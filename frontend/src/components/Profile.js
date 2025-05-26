import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaChevronDown, FaCog, FaMoon, FaSignOutAlt, FaUser, FaPlus } from "react-icons/fa";
import "../styles/Profile.css";

function Profile() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    // Make sure we have all required fields
                    if (parsedUser.username && parsedUser.email) {
                        setUser(parsedUser);
                        setLoading(false);
                        return;
                    }
                }

                // If local storage data is incomplete, fetch from server
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const completeUserData = {
                    isLoggedIn: true,
                    username: response.data.username,
                    email: response.data.email,
                    profilePic: response.data.profilePic,
                    bio: response.data.bio
                };

                localStorage.setItem('user', JSON.stringify(completeUserData));
                setUser(completeUserData);
            } catch (error) {
                console.error("Failed to load user data:", error);
                if (error.response?.status === 401) {
                    handleLogout();
                }
            } finally {
                setLoading(false);
            }
        };

        loadUserData();

        const handleUserUpdate = (e) => {
            setUser(e.detail);
        };

        window.addEventListener('userUpdated', handleUserUpdate);

        return () => {
            window.removeEventListener('userUpdated', handleUserUpdate);
        };
    }, []);// Empty dependency array - runs only once on mount

    const handleLogout = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/auth/logout`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            // Clear client-side storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);

            // Redirect to login
            navigate('/login', { replace: true });

            // Optional: Refresh to ensure clean state
            window.location.reload();

        } catch (error) {
            console.error("Logout error:", error);
            // Fallback cleanup if server request fails
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            navigate('/login');
        }
    };

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleOptionClick = (option) => {
        setIsDropdownOpen(false);
        switch (option) {
            case 'settings':
                navigate('/settings');
                break;
            case 'theme':
                // Implement theme toggle logic
                console.log("Theme toggle");
                break;
            case 'logout':
                handleLogout();
                break;
            default:
                break;
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
        <div className="profile-section" ref={profileRef}>
            <div className="profile-content" onClick={toggleDropdown}>
                <div className="dropdown-toggle">
                    <FaChevronDown className={`dropdown-icon ${isDropdownOpen ? "active" : ""}`} />
                </div>
                <div className="profile-info">
                    <span className="profile-name">
                        {user?.username || "Guest"}
                    </span>
                    <span className="profile-status">
                        {user ? "Online" : "Offline"}
                    </span>
                </div>
                <div className="profile-avatar-container">
                    {user?.profilePic ? (
                        <img
                            src={user.profilePic}
                            alt="Profile"
                            className="profile-avatar"
                            onError={(e) => {
                                e.target.src = "https://via.placeholder.com/50";
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

            {isDropdownOpen && (
                <div className="profile-dropdown" ref={dropdownRef}>
                    {user ? (
                        <>
                            <div className="dropdown-header">
                                <div className="dropdown-avatar-container">
                                    {user.profilePic ? (
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
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                        </>
                    ) : (
                        <div className="dropdown-guest">
                            <div className="guest-avatar">
                                <FaUser />
                            </div>
                            <p>You're not signed in</p>
                            <button
                                className="signin-btn"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </button>
                        </div>
                    )}

                    <div className="dropdown-menu">
                        <div
                            className="dropdown-item"
                            onClick={() => handleOptionClick('settings')}
                        >
                            <FaCog className="dropdown-icon" />
                            <span>Profile Settings</span>
                        </div>
                        <div
                            className="dropdown-item"
                            onClick={() => handleOptionClick('theme')}
                        >
                            <FaMoon className="dropdown-icon" />
                            <span>Dark Mode</span>
                        </div>
                        <div className="dropdown-divider"></div>

                        {user ? (
                            <div
                                className="dropdown-item logout"
                                onClick={() => handleOptionClick('logout')}
                            >
                                <FaSignOutAlt className="dropdown-icon" />
                                <span>Sign Out</span>
                            </div>
                        ) : (
                            <div
                                className="dropdown-item"
                                onClick={() => navigate('/signup')}
                            >
                                <FaPlus className="dropdown-icon" />
                                <span>Create Account</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;