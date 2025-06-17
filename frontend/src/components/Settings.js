import React, { useState, useEffect } from 'react';
import { FaUser, FaComments, FaBell, FaCog, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import '../styles/Settings.css';
import ProfileSettingsModal from './ProfileSettingsModal';
import ConfirmationModal from './ConfirmationModal';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [userData, setUserData] = useState({
        profilePic: '/PFP.png',
        name: 'User Name',
        bio: 'User bio will appear here...',
        email: 'user@example.com',
        phone: '+1 234 567 8900'
    });

    // Notification settings states
    const [allNotificationsOn, setAllNotificationsOn] = useState(true);
    const [privateChatNotificationsOn, setPrivateChatNotificationsOn] = useState(true);
    const [groupNotificationsOn, setGroupNotificationsOn] = useState(true);

    const navigate = useNavigate();

    const menuItems = [
        { id: 'profile', label: 'Profile', icon: FaUser },
        { id: 'chats', label: 'Chats', icon: FaComments },
        { id: 'notifs', label: 'Notifs', icon: FaBell },
        { id: 'account', label: 'Account', icon: FaCog }
    ];

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
        console.log('Logging out...');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setShowLogoutConfirm(false);
        navigate('/login');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
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

    // Effect to control dependent toggles based on allNotificationsOn
    useEffect(() => {
        if (!allNotificationsOn) {
            setPrivateChatNotificationsOn(false);
            setGroupNotificationsOn(false);
        }
    }, [allNotificationsOn]);

    const handleAllNotificationsToggle = () => {
        setAllNotificationsOn(prev => !prev);
    };

    const handlePrivateChatNotificationsToggle = () => {
        setPrivateChatNotificationsOn(prev => !prev);
    };

    const handleGroupNotificationsToggle = () => {
        setGroupNotificationsOn(prev => !prev);
    };

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

    const renderProfileContent = () => (
        <div className="settings-profile-content">
            <div className="settings-profile-header">
                <div className="settings-profile-image-section">
                    <div className="settings-profile-image-container">
                        <img src={userData.profilePic} alt="Profile" className="settings-profile-image" />
                    </div>
                    <h3 className="settings-profile-name">{userData.name}</h3>
                </div>

                <button className="settings-edit-profile-btn" onClick={handleEditProfile}>
                    <FaEdit className="settings-edit-icon" />
                    <span>Edit Profile</span>
                </button>
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
                            {userData.phone || 'No phone number available'}
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

    const renderNotificationsContent = () => (
        <div className="settings-notifications-content">
            <h3 className="settings-notifications-heading">Notifications Settings</h3>

            <div className="settings-notification-group">
                <div className="settings-notification-info">
                    <label className="settings-notification-label">Notifications</label>
                    <p className="settings-notification-text">You can mute all types of notifications at once.</p>
                </div>
                <label className="settings-toggle-switch">
                    <input
                        type="checkbox"
                        checked={allNotificationsOn}
                        onChange={handleAllNotificationsToggle}
                    />
                    <span className="settings-slider settings-round"></span>
                </label>
            </div>

            <div className="settings-notification-group">
                <div className="settings-notification-info">
                    <label className="settings-notification-label">Private Chats</label>
                    <p className="settings-notification-text">You can mute the notifications for all private chats at once.</p>
                </div>
                <label className="settings-toggle-switch">
                    <input
                        type="checkbox"
                        checked={privateChatNotificationsOn}
                        onChange={handlePrivateChatNotificationsToggle}
                        disabled={!allNotificationsOn} // Disabled if allNotificationsOn is false
                    />
                    <span className="settings-slider settings-round"></span>
                </label>
            </div>

            <div className="settings-notification-group">
                <div className="settings-notification-info">
                    <label className="settings-notification-label">Groups</label>
                    <p className="settings-notification-text">You can mute notifications for all groups at once.</p>
                </div>
                <label className="settings-toggle-switch">
                    <input
                        type="checkbox"
                        checked={groupNotificationsOn}
                        onChange={handleGroupNotificationsToggle}
                        disabled={!allNotificationsOn} // Disabled if allNotificationsOn is false
                    />
                    <span className="settings-slider settings-round"></span>
                </label>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return renderProfileContent();
            case 'chats':
                return (
                    <div className="settings-placeholder">
                        <h3>Chats Settings</h3>
                        <p>Content for chats settings will be implemented here.</p>
                    </div>
                );
            case 'notifs':
                return renderNotificationsContent(); // Render notifications content
            case 'account':
                return (
                    <div className="settings-placeholder">
                        <h3>Account Settings</h3>
                        <p>Content for account settings will be implemented here.</p>
                    </div>
                );
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