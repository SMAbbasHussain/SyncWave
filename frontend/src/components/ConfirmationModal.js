import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import '../styles/ConfirmationModal.css';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    message,
    confirmText = "Yes",
    cancelText = "No",
    confirmIcon = <FaCheck />,
    cancelIcon = <FaTimes />,
    onCancel
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div className="confirmation-modal-overlay" onClick={handleBackdropClick}>
            <div className="confirmation-modal-container" onClick={e => e.stopPropagation()}>
                <div className="confirmation-message">
                    {message}
                </div>
                <div className="confirmation-buttons">
                    <button
                        className="confirmation-button confirm-button"
                        onClick={onConfirm}
                    >
                        {confirmIcon}
                        <span>{confirmText}</span>
                    </button>
                    <button
                        className="confirmation-button cancel-button"
                        onClick={onCancel}
                    >
                        {cancelIcon}
                        <span>{cancelText}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal; 