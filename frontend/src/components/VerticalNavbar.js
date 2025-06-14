import React, { useState } from 'react';
import { AiFillHome } from 'react-icons/ai';
import { HiUserGroup } from 'react-icons/hi';
import { FaUserFriends } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import '../styles/VerticalNavbar.css'; // We will create this CSS file later

function VerticalNavbar({ onNavItemChange }) {
    const [activeNavItem, setActiveNavItem] = useState('home');

    const handleIconClick = (iconName) => {
        setActiveNavItem(iconName);
        if (onNavItemChange) {
            onNavItemChange(iconName);
        }
    };

    const renderIcon = (iconName, text, IconComponent) => (
        <div
            className={`icon-container ${activeNavItem === iconName ? 'active' : ''} ${activeNavItem === iconName ? 'expanded' : ''}`}
            onClick={() => handleIconClick(iconName)}
        >
            <div className="icon-wrapper">
                <IconComponent size={20} />
            </div>

            {activeNavItem === iconName && (
                <div className="icon-label">
                    {text}
                </div>
            )}
        </div>
    );

    return (
        <div className="vertical-navbar">
            {renderIcon('home', 'Home', AiFillHome)}
            {renderIcon('groups', 'Groups', HiUserGroup)}
            {renderIcon('friends', 'Friends', FaUserFriends)}
            {renderIcon('settings', 'Settings', IoSettingsSharp)}
        </div>
    );
}

export default VerticalNavbar; 