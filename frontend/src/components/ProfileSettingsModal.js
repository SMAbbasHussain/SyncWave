import React, { useState, useEffect, useRef } from 'react';
import { FaCamera, FaUser, FaCheck, FaTimes, FaEdit } from 'react-icons/fa';
import '../styles/ProfileSettingsModal.css';

const ProfileSettingsModal = ({
    isOpen,
    onClose,
    user, // Pass the current user data to the modal
    onSave
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedUsername, setEditedUsername] = useState(user?.username || '');
    const [editedBio, setEditedBio] = useState(user?.bio || '');
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(user?.profilePic || '');
    const [showOnlineStatus, setShowOnlineStatus] = useState(user?.status === 'online');

    const usernameInputRef = useRef(null);
    const fileInputRef = useRef(null);

    // Update state when user prop changes (e.g., after fetching initial data in Profile.js)
    useEffect(() => {
        if (user) {
            setEditedUsername(user.username || '');
            setEditedBio(user.bio || '');
            setProfileImagePreview(user.profilePic || '');
            setShowOnlineStatus(user.status === 'online');
        }
    }, [user]);

    useEffect(() => {
        if (isOpen && isEditing && usernameInputRef.current) {
            usernameInputRef.current.focus();
        }
    }, [isOpen, isEditing]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setProfileImageFile(null);
            setProfileImagePreview(user?.profilePic || '');
        }
    };

    const handleSave = () => {
        // Prepare data to send to parent (Profile.js) for saving
        const updatedData = {
            username: editedUsername.trim(),
            bio: editedBio.trim(),
            // Only include photo if a new file was selected. Send the file itself.
            photo: profileImageFile,
            status: showOnlineStatus ? 'online' : 'offline'
        };
    
        onSave(updatedData);
        setIsEditing(false); // Exit editing mode after save
        onClose(); // Close the modal
    };

    const handleCancel = () => {
        // Reset changes if cancelling while editing
        if (isEditing) {
            setEditedUsername(user?.username || '');
            setEditedBio(user?.bio || '');
            setProfileImageFile(null);
            setProfileImagePreview(user?.profilePic || '');
            setShowOnlineStatus(user?.status === 'online');
            setIsEditing(false);
        } else {
            // If not editing, just close
            onClose();
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            // Optionally reset state here if you want to lose changes on outside click
            handleCancel(); // This would reset changes, might not be desired
            // onClose(); // Just close the modal
        }
    };

    return (
        <div className="profile-settings-modal-overlay" onClick={handleBackdropClick}>
            <div className="profile-settings-modal-container" onClick={e => e.stopPropagation()}>
                <div className="profile-settings-header">
                    <h2>Profile Settings</h2>
                    {!isEditing && (
                        <button className="edit-profile-button" onClick={() => setIsEditing(true)}>
                            <span>Edit Profile</span>
                            <div className='profile-edit-Icon'><FaEdit /></div>

                        </button>
                    )}
                </div>
                <div className="profile-settings-content">

                    {/* Profile Image Upload */}
                    <div className="profile-image-section">
                        <div className="profile-image-container" onClick={() => isEditing && fileInputRef.current?.click()}>
                            {profileImagePreview ? (
                                <img src={profileImagePreview} alt="Profile Preview" />
                            ) : (
                                <FaUser className="profile-image-placeholder-icon" />
                            )}
                            {isEditing && (
                                <div className="edit-icon-overlay">
                                    <FaEdit size={30} />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={editedUsername}
                            onChange={(e) => setEditedUsername(e.target.value)}
                            disabled={!isEditing}
                            ref={usernameInputRef}
                        />
                    </div>

                    {/* Email (Not Editable) */}
                    <div className="form-group">
                        <label>Email</label>
                        <div className="email-input-display">{user?.email || 'N/A'}</div>
                    </div>

                    {/* Bio */}
                    <div className="form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            value={editedBio}
                            onChange={(e) => setEditedBio(e.target.value)}
                            disabled={!isEditing}
                        />
                    </div>

                    {/* Show Online Status Toggle */}
                    <div className="status-toggle-group">
                        <label htmlFor="online-status-toggle">Show Online Status</label>
                        <label className="switch">
                            <input
                                type="checkbox"
                                id="online-status-toggle"
                                checked={showOnlineStatus}
                                onChange={(e) => setShowOnlineStatus(e.target.checked)}
                                disabled={!isEditing}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                </div>
                {isEditing && (
                    <div className="profile-settings-footer">
                        <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                        <button className="save-button" onClick={handleSave}>Save</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSettingsModal; 