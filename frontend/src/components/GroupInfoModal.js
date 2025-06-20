import React, { useState, useEffect } from 'react';
import { FaUsers, FaUser, FaEnvelope, FaVolumeMute, FaVolumeUp, FaUserCircle, FaEdit, FaCheck, FaTimes, FaCrown } from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal';
import '../styles/GroupInfoModal.css';

function GroupInfoModal({ group, onClose, isMuted, onMuteToggle, currentUserId, setReload }) {
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [leaveError, setLeaveError] = useState('');

    const [isEditingName, setIsEditingName] = useState(false);
    const [newGroupName, setNewGroupName] = useState(group.name);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [newGroupDescription, setNewGroupDescription] = useState(group.description || '');
    const [newGroupImage, setNewGroupImage] = useState(group.photo || '');

    const [showTransferAdminConfirm, setShowTransferAdminConfirm] = useState(false);
    const [selectedMemberToAdmin, setSelectedMemberToAdmin] = useState(null);
    const [transferAdminLoading, setTransferAdminLoading] = useState(false);
    const [transferAdminError, setTransferAdminError] = useState('');

    const adminUsers = group.members?.filter(member => member.role === 'admin') || [];

    const isAdmin = adminUsers.some(admin => admin.userId._id === currentUserId);
    const members = group.members || [];
    const groupBio = group.description || 'No group description provided.';


    // Handlers for editable fields
    const handleImageChange = async (e) => {
        const file = e.target.files[0];

        let photoData = null;

        if (file) {
            const reader = new FileReader();
            photoData = await new Promise((resolve, reject) => {
                reader.onload = () => {
                    resolve(reader.result); setNewGroupImage(reader.result);
                }
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });




            try {
                const token = localStorage.getItem('token');

                // If there's a photo file, convert it to base64


                const payload = {

                    photo: photoData
                };
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/groups/${group._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update profile pic');
                }

                setReload(prev => !prev);

            } catch (error) {
                console.error('Error updating profile:', error.message);
                alert('Error updating profile: ' + error.message);
            }

        } else {
            alert("Add an image first !")
            return;
        }

    };

    const handleNameSave = async () => {
        // TODO: Call backend API to update group name
        //   console.log('Saving new group name:', newGroupName);

        try {
            const token = localStorage.getItem('token');

            // If there's a photo file, convert it to base64


            const payload = {

                name: newGroupName
            };
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/groups/${group._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile pic');
            }

            setIsEditingName(false);
            setReload(prev => !prev);



        } catch (error) {
            console.error('Error updating profile:', error.message);
            alert('Error updating profile: ' + error.message);
        }
    };

    const handleDescriptionSave = async () => {
        // TODO: Call backend API to update group description
        // console.log('Saving new group description:', newGroupDescription);

        try {
            const token = localStorage.getItem('token');

            // If there's a photo file, convert it to base64


            const payload = {

                description: newGroupDescription
            };
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/groups/${group._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile pic');
            }

            setIsEditingDescription(false);
            setReload(prev => !prev);



        } catch (error) {
            console.error('Error updating profile:', error.message);
            alert('Error updating profile: ' + error.message);
        }
    };

    const handleLeaveGroup = async () => {
        setLeaveLoading(true);
        setLeaveError('');
        try {
            // Replace with actual API call to leave group
            await fetch(`${process.env.REACT_APP_API_URL}/api/groups/${group._id}/leave`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setShowLeaveConfirm(false);
            onClose(); // Close modal after leaving
            // Potentially redirect or update UI to reflect leaving the group
        } catch (err) {
            setLeaveError(err.message);
        } finally {
            setLeaveLoading(false);
        }
    };

    const handleMakeAdminClick = (member) => {
        setSelectedMemberToAdmin(member);
        setShowTransferAdminConfirm(true);
    };

    const handleConfirmTransferAdmin = async () => {
        if (!selectedMemberToAdmin) return;

        setTransferAdminLoading(true);
        setTransferAdminError('');
        try {
            // TODO: Call backend API to transfer admin rights
            console.log(`Transferring admin rights to: ${selectedMemberToAdmin.userId.username}`);
            const token = localStorage.getItem('token');

            // If there's a photo file, convert it to base64


            const payload = {

                userId: selectedMemberToAdmin.userId._id
            };
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/groups/${group._id}/members/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile pic');
            }
            setShowTransferAdminConfirm(false);

            onClose(); // Close modal, parent component should refresh group data
        } catch (err) {
            setTransferAdminError('Failed to transfer admin rights.');
            console.error('Error transferring admin rights:', err);
        } finally {
            setTransferAdminLoading(false);
        }
    };


    return (
        <div className="group-info-modal-overlay" onClick={onClose}>
            <div className="group-info-modal" onClick={e => e.stopPropagation()}>
                <div className="group-modal-main">
                    {/* Top Section: Group Icon, Name, Admin Info */}
                    <div className="group-modal-main-top">
                        <div className="group-modal-image-section">
                            {isAdmin && (
                                <>
                                    <label htmlFor="group-image-upload" className="group-image-edit-icon">
                                        <FaEdit />
                                    </label>
                                    <input
                                        type="file"
                                        id="group-image-upload"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </>
                            )}
                            {newGroupImage ? (
                                <img src={newGroupImage} alt="Group" className="group-modal-image" />
                            ) : (
                                <div className="group-modal-image placeholder"><FaUsers size={48} /></div>
                            )}
                        </div>
                        <div className="group-modal-info-section">
                            <div className="group-modal-info-main">
                                <div className="group-modal-name-container">
                                    {isEditingName ? (
                                        <input
                                            type="text"
                                            value={newGroupName}
                                            onChange={(e) => setNewGroupName(e.target.value)}
                                            className="editable-input"
                                        />
                                    ) : (
                                        <div className="group-modal-name">{newGroupName}</div>
                                    )}
                                    {isAdmin && (
                                        <button className="edit-button" onClick={() => isEditingName ? handleNameSave() : setIsEditingName(true)}>
                                            {isEditingName ? <FaCheck /> : <FaEdit />}
                                        </button>
                                    )}
                                    {isAdmin && isEditingName && (
                                        <button className="cancel-button" onClick={() => { setIsEditingName(false); setNewGroupName(group.name); }}>
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                                {adminUsers.length > 0 ? (
                                    adminUsers.map((admin, index) => (
                                        <div key={admin.userId._id || index}>
                                            <div className="group-modal-admin-username">
                                                <FaUser /> Admin: {admin.userId.username} {admin.userId._id === currentUserId && "(You)"}
                                            </div>
                                            <div className="group-modal-admin-email">
                                                <FaEnvelope /> {admin.userId.email}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div>
                                        <div className="group-modal-admin-username">
                                            <FaUser /> Admin: Admin User
                                        </div>
                                        <div className="group-modal-admin-email">
                                            <FaEnvelope /> admin@example.com
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="group-modal-bio-section">
                        <div className="group-modal-bio-label">
                            Description
                            {isAdmin && (
                                <button className="edit-button" onClick={() => isEditingDescription ? handleDescriptionSave() : setIsEditingDescription(true)}>
                                    {isEditingDescription ? <FaCheck /> : <FaEdit />}
                                </button>
                            )}
                            {isAdmin && isEditingDescription && (
                                <button className="cancel-button" onClick={() => { setIsEditingDescription(false); setNewGroupDescription(groupBio); }}>
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                        {isEditingDescription ? (
                            <textarea
                                value={newGroupDescription}
                                onChange={(e) => setNewGroupDescription(e.target.value)}
                                className="editable-textarea"
                                rows="3"
                            />
                        ) : (
                            <div className="group-modal-bio">{newGroupDescription}</div>
                        )}
                    </div>

                    {/* Mute Toggle */}
                    <div className="group-modal-mute-toggle">
                        <span className="mute-label">
                            {isMuted ? <><FaVolumeMute /> <span className="mute-text">Mute Notifications</span></> : <><FaVolumeUp /> <span className="mute-text">Unmute Notifications</span></>}
                        </span>
                        <label className="toggle-switch">

                            <input
                                type="checkbox"
                                checked={isMuted}
                                onChange={onMuteToggle}
                            />
                            <span className="slider round"></span>
                        </label>

                    </div>

                    {/* Members List */}
                    <div className="group-modal-members-section">
                        <div className="group-modal-members-label">Members ({members.length})</div>
                        <div className="group-modal-members-list">
                            {members.map(member => (
                                <div key={member.userId._id} className="group-modal-member-item">
                                    {member.userId.profilePic ? (
                                        <img src={member.userId.profilePic} alt={member.username} className="member-avatar" />
                                    ) : (
                                        <div className="member-avatar placeholder"><FaUserCircle /></div>
                                    )}
                                    <span className="member-username">{member.userId.username}</span>
                                    {isAdmin && member.userId._id !== currentUserId && member.role !== "admin" && (
                                        <button
                                            className="make-admin-btn"
                                            onClick={() => handleMakeAdminClick(member)}
                                            disabled={transferAdminLoading}
                                        >
                                            <FaCrown /> Make Admin
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Separator */}
                <div className="group-modal-separator" />

                {/* Leave Group Section */}
                <div className="group-modal-leave-section">
                    <button
                        className="group-modal-action-btn block"
                        onClick={() => setShowLeaveConfirm(true)}
                        disabled={leaveLoading}
                    >
                        Leave Group
                    </button>
                    <div className="group-modal-leave-msg centered">
                        This action will prevent you from sending or receiving messages in this Group.
                    </div>
                    {leaveError && <div className="group-modal-leave-error">{leaveError}</div>}
                </div>

                {/* Confirmation Modal for Leave Group */}
                <ConfirmationModal
                    isOpen={showLeaveConfirm}
                    message={`Are you sure you want to leave "${group.name}"?`}
                    onConfirm={handleLeaveGroup}
                    onClose={() => setShowLeaveConfirm(false)}
                    onCancel={() => setShowLeaveConfirm(false)}
                    confirmText="Leave"
                    cancelText="Cancel"
                />

                {/* Confirmation Modal for Transfer Admin */}
                {selectedMemberToAdmin && (
                    <ConfirmationModal
                        isOpen={showTransferAdminConfirm}
                        message={`Are you sure making ${selectedMemberToAdmin.username} Admin? You'll lose Admin access.`}
                        onConfirm={handleConfirmTransferAdmin}
                        onClose={() => setShowTransferAdminConfirm(false)}
                        onCancel={() => setShowTransferAdminConfirm(false)}
                        confirmText="Transfer"
                        cancelText="Cancel"
                    />
                )}

                {/* Close button */}
                <button className="group-modal-close-btn" onClick={onClose}>&times;</button>
            </div>
        </div>
    );
}

export default GroupInfoModal;