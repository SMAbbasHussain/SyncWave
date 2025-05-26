import React from 'react';
import Profile from './Profile';
import '../styles/TopBar.css';

function TopBar() {
    return (
        <div className="top-bar">
            <div className="logo-container">
                <h1 className="syncwave-logo-small">SYNCWAVE</h1>
            </div>
            <div className="profile-container">
                <Profile />
            </div>
        </div>
    );
}

export default TopBar; 