import React, { useState } from 'react';
import { FaUsers, FaVolumeMute, FaVolumeUp, FaHashtag } from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal';
import '../styles/GroupInfoModal.css'; // We'll reuse the same styles

function AnonymousGroupInfoModal({ group, onClose, isMuted, onMuteToggle }) {
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [leaveError, setLeaveError] = useState('');

    const handleLeaveGroup = async () => {
        setLeaveLoading(true);
        setLeaveError('');
        try {
            // TODO: Implement leave anonymous group functionality
            console.log(`Leaving anonymous group: ${group.name}`);
            setShowLeaveConfirm(false);
            onClose();
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
                    {/* Top Section: Group Icon, Name, Category */}
                    <div className="group-modal-main-top">
                        <div className="group-modal-image-section">
                            {group.photo ? (
                                <img src={group.photo} alt="Group" className="group-modal-image" />
                            ) : (
                                <div className="group-modal-image placeholder"><FaUsers size={48} /></div>
                            )}
                        </div>
                        <div className="group-modal-info-section">
                            <div className="group-modal-info-main">
                                <div className="group-modal-name-container">
                                    <div className="group-modal-name">{group.name}</div>
                                </div>
                                <div className="group-modal-category">
                                    <FaHashtag /> {group.category}
                                </div>
                                <div className="group-modal-members-count">
                                    <FaUsers /> Members: {group.memberCount || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="group-modal-bio-section">
                        <div className="group-modal-bio-label">
                            Description
                        </div>
                        <div className="group-modal-bio">{group.description || 'No group description provided.'}</div>
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
                    message={`If you leave you may not found "${group.name}" again. You'll also lose all chats of it.`}
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

export default AnonymousGroupInfoModal; 