import React, { useEffect, useRef } from 'react';
import { FaUser, FaBell, FaTrash, FaUserSlash, FaUsers, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';
import '../styles/ChatDropdownMenu.css';

function ChatDropdownMenu({
    isOpen,
    onClose,
    type,
    onVisitProfile,
    onMuteNotifications,
    onClearChat,
    onBlockUser,
    onLeaveGroup,
    onViewGroupInfo,
    isMuted = false
}) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const renderMenuItems = () => {
        switch (type) {
            case 'private':
                return (
                    <>
                        <li>
                            <button onClick={onVisitProfile}>
                                <FaUser />
                                View Profile
                            </button>
                        </li>
                        <li>
                            <button onClick={onMuteNotifications}>
                                <FaBell />
                                {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                            </button>
                        </li>
                        <li>
                            <button className="danger" onClick={onBlockUser}>
                                <FaUserSlash />
                                Block User
                            </button>
                        </li>
                    </>
                );
            case 'group':
                return (
                    <>
                        <li>
                            <button onClick={onViewGroupInfo}>
                                <FaInfoCircle />
                                View Group Info
                            </button>
                        </li>
                        <li>
                            <button onClick={onMuteNotifications}>
                                <FaBell />
                                {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                            </button>
                        </li>
                        <li>
                            <button className="danger" onClick={onLeaveGroup}>
                                <FaSignOutAlt />
                                Leave Group
                            </button>
                        </li>
                    </>
                );
            case 'anonymous':
                return (
                    <>
                        <li>
                            <button onClick={onViewGroupInfo}>
                                <FaInfoCircle />
                                View Group Info
                            </button>
                        </li>
                        <li>
                            <button onClick={onMuteNotifications}>
                                <FaBell />
                                {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                            </button>
                        </li>
                        <li>
                            <button className="danger" onClick={onLeaveGroup}>
                                <FaSignOutAlt />
                                Leave Anonymous Chat
                            </button>
                        </li>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className={`chat-dropdown-menu ${isOpen ? 'open' : ''}`}
            ref={menuRef}
            style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                zIndex: 9999,
                marginTop: '5px'
            }}
        >
            <ul>
                {renderMenuItems()}
            </ul>
        </div>
    );
}

export default ChatDropdownMenu; 