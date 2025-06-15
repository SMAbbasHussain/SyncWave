import React, { useState } from 'react';
import { FaUsers, FaUser, FaEnvelope, FaVolumeMute, FaVolumeUp, FaUserCircle } from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal';
import '../styles/GroupInfoModal.css';

function GroupInfoModal({ group, onClose, isMuted, onMuteToggle }) {
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [leaveError, setLeaveError] = useState('');

    // Placeholder data for group members and admin.
    // In a real application, you would fetch this from your backend
    const adminUser = {
        username: group.adminUsername || 'Admin User',
        email: group.adminEmail || 'admin@example.com',
    };

    const members = group.members || [
        { _id: '1', username: 'Member One', profilePic: '' },
        { _id: '2', username: 'Member Two', profilePic: '' },
        { _id: '3', username: 'Member Three', profilePic: '' },
        { _id: '4', username: 'Member Four', profilePic: '' },
        { _id: '5', username: 'Member Five', profilePic: '' },
    ];
    const groupBio = group.bio || 'No group description provided.';


    const handleLeaveGroup = async () => {
        setLeaveLoading(true);
        setLeaveError('');
        try {
            // Replace with actual API call to leave group
            console.log(`Leaving group: ${group.name}`);
            // await fetch(`${process.env.REACT_APP_API_URL}/api/groups/leave/${group._id}`, {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`,
            //     },
            // });
            setShowLeaveConfirm(false);
            onClose(); // Close modal after leaving
            // Potentially redirect or update UI to reflect leaving the group
        } catch (err) {
            setLeaveError('Failed to leave group.');
        } finally {
            setLeaveLoading(false);
        }
    };

    return (
        <div className="group-info-modal-overlay" onClick={onClose}>
            <div className="group-info-modal" onClick={e => e.stopPropagation()}>
                <div className="group-modal-main">
                    {/* Top Section: Group Icon, Name, Admin Info */}
                    <div className="group-modal-main-top">
                        <div className="group-modal-image-section">
                            {group.groupPic ? (
                                <img src={group.groupPic} alt="Group" className="group-modal-image" />
                            ) : (
                                <div className="group-modal-image placeholder"><FaUsers size={48} /></div>
                            )}
                        </div>
                        <div className="group-modal-info-section">
                            <div className="group-modal-info-main">
                                <div className="group-modal-name">{group.name}</div>
                                <div className="group-modal-admin-username"><FaUser /> Admin: {adminUser.username}</div>
                            </div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="group-modal-bio-section">
                        <div className="group-modal-bio-label">Description</div>
                        <div className="group-modal-bio">{groupBio}</div>
                    </div>

                    {/* Mute Toggle */}
                    <div className="group-modal-mute-toggle">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={isMuted}
                                onChange={onMuteToggle}
                            />
                            <span className="slider round"></span>
                        </label>
                        <span className="mute-label">
                            {isMuted ? <><FaVolumeMute /> <span className="mute-text">Muted</span></> : <><FaVolumeUp /> <span className="mute-text">Unmuted</span></>}
                        </span>
                    </div>

                    {/* Members List */}
                    <div className="group-modal-members-section">
                        <div className="group-modal-members-label">Members ({members.length})</div>
                        <div className="group-modal-members-list">
                            {members.map(member => (
                                <div key={member._id} className="group-modal-member-item">
                                    {member.profilePic ? (
                                        <img src={member.profilePic} alt={member.username} className="member-avatar" />
                                    ) : (
                                        <div className="member-avatar placeholder"><FaUserCircle /></div>
                                    )}
                                    <span className="member-username">{member.username}</span>
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
                        className="group-modal-action-btn block" // Using 'block' for styling similarity
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
                    message={`Are you sure you want to leave ${group.name}?`}
                    onConfirm={handleLeaveGroup}
                    onClose={() => setShowLeaveConfirm(false)}
                    confirmText="Leave"
                    cancelText="Cancel"
                />

                {/* Close button */}
                <button className="group-modal-close-btn" onClick={onClose}>&times;</button>
            </div>
        </div>
    );
}

export default GroupInfoModal; 