import React, { useState } from "react";
import "../styles/Profile.css";
import { FaChevronDown } from "react-icons/fa";

function Profile() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Placeholder data - replace with actual user data later
    const user = {
        isLoggedIn: false,
        name: "Profile Setup",
        profilePic: ""
    };

    const toggleDropdown = (e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="profile-section">
            <div className="line-3"></div>
            <div className="line-4"></div>
            <div className="profile-content">
                <div className="profile-pic-container">
                    <img
                        src={user.isLoggedIn && user.profilePic ? user.profilePic : "https://via.placeholder.com/50"}
                        alt="Profile"
                        className="profile-pic"
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
                <div className="profile-dropdown">
                    {/* Dropdown content will be added later */}
                </div>
            )}
        </div>
    );
}

export default Profile; 