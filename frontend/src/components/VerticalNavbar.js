import React, { useState } from 'react';
import { AiFillHome, AiOutlineMail } from 'react-icons/ai';
import { HiUsers } from 'react-icons/hi';
import { IoSettingsSharp } from 'react-icons/io5';
import '../styles/VerticalNavbar.css'; // We will create this CSS file later

function VerticalNavbar() {
    const [expandedIcon, setExpandedIcon] = useState(null);

    const handleIconClick = (iconName) => {
        setExpandedIcon(expandedIcon === iconName ? null : iconName);
    };

    const renderIcon = (iconName, text, IconComponent) => (
        <div
            className={`icon-container ${expandedIcon === iconName ? 'expanded' : ''}`}
            onClick={() => handleIconClick(iconName)}
        >
            <div className="icon-wrapper">
                <IconComponent size={20} />
            </div>

            {expandedIcon === iconName && (
                <div className="icon-label">
                    {text}
                </div>
            )}
        </div>
    );

    return (
        <div className="vertical-navbar">
            {renderIcon('home', 'Home', AiFillHome)}
            {renderIcon('dm', 'Private', AiOutlineMail)}
            {renderIcon('groups', 'Groups', HiUsers)}
            {renderIcon('settings', 'Settings', IoSettingsSharp)}
        </div>
    );
}

export default VerticalNavbar; 