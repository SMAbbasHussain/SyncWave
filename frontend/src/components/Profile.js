import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaChevronDown, FaCog, FaMoon, FaSignOutAlt, FaUser, FaPlus, FaCircle } from "react-icons/fa";
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
                    if (parsedUser.username && parsedUser.email) {
                        setUser(parsedUser);
                        setLoading(false);
                        return;
                    }
                }

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
                    bio: response.data.bio,
                    status: response.data.status || 'offline'
                };

                localStorage.setItem('user', JSON.stringify(completeUserData));
                setUser(completeUserData);
            } catch (error) {
                console.error("Error loading user data:", error);
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                profileRef.current && !profileRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleOptionClick = (option) => {
        setIsDropdownOpen(false);
        switch (option) {
            case 'settings':
                navigate('/settings');
                break;
            case 'theme':
                console.log("Theme toggle");
                break;
            case 'logout':
                handleLogout();
                break;
            default:
                break;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'online':
                return '#4CAF50';
            case 'offline':
                return '#9E9E9E';
            case 'away':
                return '#FFC107';
            case 'busy':
                return '#F44336';
            default:
                return '#9E9E9E';
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
            <div className="profile-content" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <FaChevronDown className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
                <div className="profile-info">
                    <div className="profile-name">{user ? user.username : 'Guest'}</div>
                    <div className="profile-status">
                        <FaCircle className="status-icon" style={{ color: getStatusColor(user?.status) }} />
                        <span>{user ? user.status : 'Guest'}</span>
                    </div>
                </div>
                <div className="profile-avatar">
                    {user?.profilePic ? (
                        <img src={user.profilePic} alt={user.username} />
                    ) : (
                        <FaUser className="default-avatar" />
                    )}
                </div>
            </div>

            {isDropdownOpen && (
                <div className="profile-dropdown" ref={dropdownRef}>
                    {!user ? (
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
                    ) : (
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
                            <div
                                className="dropdown-item logout"
                                onClick={() => handleOptionClick('logout')}
                            >
                                <FaSignOutAlt className="dropdown-icon" />
                                <span>Sign Out</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Profile;