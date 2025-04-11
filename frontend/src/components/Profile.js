import React, { useState, useEffect, useRef } from "react";
import "../styles/Profile.css";
import { FaChevronDown, FaCog, FaMoon, FaSignOutAlt } from "react-icons/fa";

function Profile() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const profileRef = useRef(null);

    // Placeholder data - replace with actual user data later
    const user = {
        isLoggedIn: false,
        name: "Sardor",
        email: "sardor@mail.com",
        profilePic: ""
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current &&
                profileRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !profileRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleOptionClick = (option) => {
        // Placeholder for future functionality
        console.log(`Clicked: ${option}`);
    };

    return (
        <div className="profile-section" ref={profileRef}>
            <div className="line-3"></div>
            <div className="line-4"></div>
            <div className="profile-content">
                <div className="home-profile-pic-container">
                    <img
                        src={user.isLoggedIn && user.profilePic ? user.profilePic : "https://via.placeholder.com/50"}
                        alt="Profile"
                        className="home-profile-pic"
                    />
                </div>
                <div className="profile-name-container">
                    <span className="profile-name">
                        <span className="profile-name-inner">
                            {user.isLoggedIn && user.name ? user.name : "Profile Setup"}
                        </span>
                    </span>
                </div>
                <div className="dropdown-icon-container" onClick={toggleDropdown}>
                    <FaChevronDown className="dropdown-icon" />
                </div>
            </div>
            {isDropdownOpen && (
                <div className="profile-dropdown" ref={dropdownRef}>
                    <div className="dropdown-account-info">
                        <img
                            src={user.profilePic || "https://via.placeholder.com/50"}
                            alt="Profile"
                            className="dropdown-profile-pic"
                        />
                        <div className="dropdown-user-details">
                            <span className="dropdown-username">{user.name}</span>
                            <span className="dropdown-email">{user.email}</span>
                        </div>
                    </div>
                    <div className="dropdown-separator" />
                    <div className="dropdown-option" onClick={() => handleOptionClick('settings')}>
                        <FaCog className="dropdown-option-icon" />
                        <span className="dropdown-option-text">Profile Settings</span>
                    </div>
                    <div className="dropdown-option" onClick={() => handleOptionClick('theme')}>
                        <FaMoon className="dropdown-option-icon" />
                        <span className="dropdown-option-text">Dark Mode</span>
                    </div>
                    <div className="dropdown-separator" />
                    <div className="dropdown-option" onClick={() => handleOptionClick('logout')}>
                        <FaSignOutAlt className="dropdown-option-icon" />
                        <span className="dropdown-option-text">Sign Out</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile; 