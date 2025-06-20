import React, { useState } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaVolumeMute, FaVolumeUp, FaBan, FaCheckCircle } from 'react-icons/fa';
import ConfirmationModal from './ConfirmationModal';
import '../styles/PrivateProfileModal.css';

function PrivateProfileModal({ user, chatId, isMuted, onMuteToggle, onClose }) {
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);
    const [isBlocked, setIsBlocked] = useState(user.isBlocked || false); // Assume user object may have isBlocked
    const [blockLoading, setBlockLoading] = useState(false);
    const [blockError, setBlockError] = useState('');

    // For demo, phone/email/bio fallback
    const phone = user.phoneNo || 'N/A';
    const email = user.email || 'N/A';
    const bio = user.bio || 'No bio provided.';

    // Block/Unblock API call
    const handleBlockToggle = async () => {
        setBlockLoading(true);
        setBlockError('');
        try {
            const token = localStorage.getItem('token');
            const url = `${process.env.REACT_APP_API_URL}/api/users/${isBlocked ? 'unblock' : 'block'}/${user._id}`;
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setIsBlocked(!isBlocked);
            setShowBlockConfirm(false);
        } catch (err) {
            setBlockError('Failed to update block status.');
        } finally {
            setBlockLoading(false);
        }
    };

    return (
        <div className="private-profile-modal-overlay" onClick={onClose}>
            <div className="private-profile-modal" onClick={e => e.stopPropagation()}>
                <div className="profile-modal-main">
                    {/* Left: Profile Image */}
                    <div className='profile-modal-main-top'>
                        <div className="profile-modal-image-section">
                            {user.profilePic ? (
                                <img src={user.profilePic} alt="Profile" className="profile-modal-image" />
                            ) : (
                                <div className="profile-modal-image placeholder"><FaUser size={48} /></div>
                            )}
                        </div>
                        {/* Right: Info */}
                        <div className="profile-modal-info-section">
                            <div className="profile-modal-info-main">
                                <div className="profile-modal-username">{user.username}</div>
                                <div className="profile-modal-email"><FaEnvelope /> {email}</div>
                                <div className="profile-modal-phone"><FaPhone /> {phone}</div>
                            </div>
                        </div>
                    </div>
                    <div className="profile-modal-bio-section">
                        <div className="profile-modal-bio-label">Bio</div>
                        <div className="profile-modal-bio">{bio}</div>
                    </div>
                    <div className="profile-modal-mute-toggle">
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
                <div className="profile-modal-separator" />
                {/* Block/Unblock */}
                <div className="profile-modal-block-section">
                    <div className="profile-modal-block-buttons">
                        <button
                            className={`profile-modal-action-btn ${isBlocked ? 'inactive' : 'block'}`}
                            onClick={() => setShowBlockConfirm(true)}
                            disabled={isBlocked || blockLoading}
                        >
                            <FaBan /> Block
                        </button>
                        <button
                            className={`profile-modal-action-btn ${isBlocked ? 'unblock' : 'inactive'}`}
                            onClick={() => setShowBlockConfirm(true)}
                            disabled={!isBlocked || blockLoading}
                        >
                            <FaCheckCircle /> Unblock
                        </button>
                    </div>
                    <div className="profile-modal-block-msg centered">
                        {isBlocked
                            ? 'You have blocked this contact. Unblock to send and receive messages.'
                            : 'Blocking this contact will prevent sending and receiving messages.'}
                    </div>
                    {blockError && <div className="profile-modal-block-error">{blockError}</div>}
                </div>
                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={showBlockConfirm}
                    message={isBlocked
                        ? `Are you sure you want to unblock ${user.username}?`
                        : `Are you sure to block ${user.username}? You'll not be able to send or receive messages.`}
                    onConfirm={handleBlockToggle}
                    onClose={() => setShowBlockConfirm(false)}
                    onCancel={() => setShowBlockConfirm(false)}
                    confirmText={isBlocked ? 'Unblock' : 'Block'}
                    cancelText="Cancel"
                />
                {/* Close button */}
                <button className="profile-modal-close-btn" onClick={onClose}>&times;</button>
            </div>
        </div>
    );
}

export default PrivateProfileModal; 