import React, { useState, useEffect } from 'react';
import { FaUser, FaComments, FaBell, FaCog, FaEdit, FaSignOutAlt, FaUnlock } from 'react-icons/fa';
import '../styles/Settings.css';
import ProfileSettingsModal from './ProfileSettingsModal';
import ConfirmationModal from './ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Settings = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [privacySettings, setPrivacySettings] = useState({
        lastSeen: 'Everyone',
        profilePhoto: 'Everyone',
        about: 'Everyone',
        addToGroups: 'Everyone'
    });
    const [userData, setUserData] = useState({
        profilePic: '/PFP.png',
        name: 'User Name',
        bio: 'User bio will appear here...',
        email: 'user@example.com',
        phone: '+1 234 567 8900'
    });

    const [blockedUsers, setBlockedUsers] = useState([]);
    const [unblockConfirmUser, setUnblockConfirmUser] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const navigate = useNavigate();

    const menuItems = [
        { id: 'profile', label: 'Profile', icon: FaUser },
        { id: 'blocked', label: 'Blocked Accounts', icon: FaComments },

    ];

    useEffect(() => {
        const fetchBlockedUsers = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/blocked`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const formattedData = response.data.map(user => ({
                    id: user._id,
                    name: user.username,
                    profilePic: user.profilePic
                }));

                setBlockedUsers(formattedData);
            } catch (error) {
                console.error('Error fetching blocked users:', error);
            }
        };

        fetchBlockedUsers();
    }, []);

    const handleMenuClick = (sectionId) => {
        setActiveSection(sectionId);
    };

    const handleEditProfile = () => {
        setShowProfileModal(true);
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setShowLogoutConfirm(false);
        navigate('/login');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    const handlePrivacyChange = (setting, value) => {
        setPrivacySettings(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    useEffect(() => {
        const fetchUserData = () => {
            try {
                const userString = localStorage.getItem('user');
                if (userString) {
                    const user = JSON.parse(userString);
                    setUserData({
                        profilePic: user.profilePic || '/PFP.png',
                        name: user.username || 'User Name',
                        bio: user.bio || 'No bio available',
                        email: user.email || 'user@example.com',
                        phone: user.phone || 'No phone number'
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    const handleProfileSave = (updatedData) => {
        setUserData(prev => ({
            ...prev,
            name: updatedData.username || prev.name,
            bio: updatedData.bio || prev.bio,
            profilePic: updatedData.photo ? URL.createObjectURL(updatedData.photo) : prev.profilePic
        }));

        console.log('Saving profile data:', updatedData);

        setShowProfileModal(false);
    };

    const handleUnblock = async (userId) => {
        try {
            const token = localStorage.getItem('token');

            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/users/unblock/${userId}`,
                {}, // no request body
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('✅ Unblocked:', response.data);

            setBlockedUsers(prev => prev.filter(user => user.id !== userId));
            setUnblockConfirmUser(null);
        } catch (error) {
            alert(error.message);
        }
    }

    const handleAskUnblock = (user) => {
        setUnblockConfirmUser(user);
    };

    const handleCancelUnblock = () => {
        setUnblockConfirmUser(null);
    };

    const renderProfileContent = () => (
        <div className="settings-profile-content">
            <div className="settings-profile-header">
                <div className="settings-profile-image-section">
                    <div className="settings-profile-image-container">
                        <img src={userData.profilePic} alt="Profile" className="settings-profile-image" />
                    </div>
                    <h3 className="settings-profile-name">{userData.name}</h3>
                </div>
                {/*
                <button className="settings-edit-profile-btn" onClick={handleEditProfile}>
                    <FaEdit className="settings-edit-icon" />
                    <span>Edit Profile</span>
                </button> */}
            </div>

            <div className="settings-profile-display-section">
                <div className="settings-profile-display">
                    <div className="settings-display-group">
                        <label>Bio</label>
                        <div className="settings-display-value">
                            {userData.bio || 'No bio available'}
                        </div>
                    </div>

                    <div className="settings-display-group">
                        <label>Email</label>
                        <div className="settings-display-value">
                            {userData.email || 'No email available'}
                        </div>
                    </div>

                    <div className="settings-display-group">
                        <label>Phone Number</label>
                        <div className="settings-display-value">
                            {userData.phoneNo || 'No phone number available'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-profile-separator"></div>

            <div className="settings-logout-section">
                <div className="settings-logout-info">
                    <h4>Sign Out</h4>
                    <p>Sign out of your account to end your current session</p>
                </div>
                <button className="settings-logout-button" onClick={handleLogout}>
                    <FaSignOutAlt className="settings-logout-icon" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );

    const renderBlockedAccountsContent = () => (
        <div className="settings-blocked-accounts-content">
            <h3 className="settings-blocked-heading">Blocked Accounts</h3>
            <div className="settings-blocked-description">
                You can manage the accounts you have blocked here. Blocked users cannot send you messages or add you to groups.
            </div>
            <div className="settings-blocked-count">
                Blocked Users ({blockedUsers.length}):
            </div>
            {blockedUsers.length === 0 ? (
                <div className="settings-blocked-empty">You have not blocked any accounts.</div>
            ) : (
                <ul className="settings-blocked-list">
                    {blockedUsers.map(user => (
                        <li key={user.id} className="settings-blocked-user">
                            <img src={user.profilePic} alt={user.name} className="settings-blocked-user-pic" />
                            <span className="settings-blocked-user-name">{user.name}</span>
                            <button className="settings-unblock-label-btn" title="Unblock" onClick={() => handleAskUnblock(user)}>
                                <FaUnlock className="unblock-icon" />
                                <span>Unblock</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {unblockConfirmUser && (
                <ConfirmationModal
                    isOpen={!!unblockConfirmUser}
                    message={`Are you sure you want to unblock ${unblockConfirmUser.name}?`}
                    onConfirm={() => handleUnblock(unblockConfirmUser.id)}
                    onCancel={handleCancelUnblock}
                />
            )}
        </div>
    );

    const renderAccountContent = () => (
        <div className="settings-account-content">
            <h3 className="settings-account-heading">Account Settings</h3>

            <div className="settings-privacy-section-content">
                <h4 className="settings-section-title">Privacy</h4>
                <p className="settings-section-description">Managed on your phone</p>

                <div className="settings-privacy-group">
                    <div className="settings-privacy-left">
                        <label className="settings-privacy-label">Last seen and online</label>
                        <p className="settings-privacy-text">Choose who can see when you were last online and if you are currently online.</p>
                    </div>
                    <div className="settings-privacy-right">
                        <span className="settings-privacy-static">Everyone</span>
                    </div>
                </div>

                <div className="settings-privacy-group">
                    <div className="settings-privacy-left">
                        <label className="settings-privacy-label">Profile photo</label>
                        <p className="settings-privacy-text">Choose who can see your profile photo.</p>
                    </div>
                    <div className="settings-privacy-right">
                        <span className="settings-privacy-static">Everyone</span>
                    </div>
                </div>

                <div className="settings-privacy-group">
                    <div className="settings-privacy-left">
                        <label className="settings-privacy-label">About</label>
                        <p className="settings-privacy-text">Choose who can see your 'About' information (e.g., your bio).</p>
                    </div>
                    <div className="settings-privacy-right">
                        <span className="settings-privacy-static">Everyone</span>
                    </div>
                </div>

                <div className="settings-privacy-group">
                    <div className="settings-privacy-left">
                        <label className="settings-privacy-label">Add to groups</label>
                        <p className="settings-privacy-text">Choose who can add you to new groups.</p>
                    </div>
                    <div className="settings-privacy-right">
                        <span className="settings-privacy-static">Everyone</span>
                    </div>
                </div>
            </div>

            <div className="settings-security-section-content">
                <h4 className="settings-section-title">Security</h4>
                <div className="settings-security-info">
                    <h5>Your chats are private</h5>
                    <p>End-to-end encryption keeps your personal messages between you and the people you choose. No one outside of the chat, not even SyncWave, can read or share them. This includes your: </p>
                    <ul>
                        <li>Text messages</li>
                    </ul>
                </div>
            </div>

            <div className="settings-profile-separator"></div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return renderProfileContent();
            case 'blocked':
                return renderBlockedAccountsContent();
            case 'account':
                return renderAccountContent();
            default:
                return renderProfileContent();
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-left-section">
                <div className="settings-menu">
                    <h2 className="settings-title">Settings</h2>
                    <nav className="settings-nav">
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    className={`settings-menu-item ${activeSection === item.id ? 'active' : ''}`}
                                    onClick={() => handleMenuClick(item.id)}
                                >
                                    <IconComponent className="menu-icon" />
                                    <span className="menu-label">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            <div className="settings-separator"></div>

            <div className="settings-right-section">
                <div className="settings-content">
                    {renderContent()}
                </div>
            </div>

            {showProfileModal && (
                <ProfileSettingsModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    user={{
                        username: userData.name,
                        bio: userData.bio,
                        profilePic: userData.profilePic,
                        email: userData.email,
                        status: 'online'
                    }}
                    onSave={handleProfileSave}
                />
            )}

            {showLogoutConfirm && (
                <ConfirmationModal
                    isOpen={showLogoutConfirm}
                    message="Are you sure you want to log out? Your chat history will be cleared."
                    onConfirm={confirmLogout}
                    onCancel={cancelLogout}
                />
            )}
        </div>
    );
};

export default Settings; 