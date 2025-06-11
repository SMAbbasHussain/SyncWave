import React, { useState, useRef, useEffect } from 'react';
import { FaImage, FaTimes } from 'react-icons/fa';
import '../styles/CreateAnonymousGroupModal.css';
import { IoMdAdd } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';

const CreateAnonymousGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
    const [groupTitle, setGroupTitle] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupImage, setGroupImage] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const modalRef = useRef(null);
    const fileInputRef = useRef(null);
    const dropdownRef = useRef(null);

    const categories = [
        "Friends & Family",
        "Work & Business",
        "Education & Study Groups",
        "Gaming",
        "Technology & Programming",
        "Entertainment & Movies",
        "Music & Podcasts",
        "Sports & Fitness",
        "Health & Wellness",
        "Travel & Adventure"
    ];

    // Add click outside handler for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isCategoryOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !event.target.closest('.anon-category-select-button')) {
                setIsCategoryOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCategoryOpen, isOpen]);

    const handleClose = () => {
        setGroupTitle('');
        setGroupDescription('');
        setGroupImage(null);
        setSelectedCategory('');
        setShowCategoryDropdown(false);
        setIsCategoryOpen(false);
        onClose();
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (groupTitle.trim() && selectedCategory) {
            try {
                let photoData = null;

                // If there's an image, convert it to base64
                if (groupImage) {
                    const reader = new FileReader();
                    photoData = await new Promise((resolve, reject) => {
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(groupImage);
                    });
                }

                // Create the group data
                const groupData = {
                    title: groupTitle.trim(),
                    description: groupDescription.trim(),
                    category: selectedCategory,
                    photo: photoData
                };

                await onCreateGroup(groupData);
                handleClose();
            } catch (error) {
                console.error('Error processing group image:', error);
                // Still try to create the group without the image
                const groupData = {
                    title: groupTitle.trim(),
                    description: groupDescription.trim(),
                    category: selectedCategory
                };
                await onCreateGroup(groupData);
                handleClose();
            }
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setGroupImage(file);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && isSaveEnabled) {
            handleCreateGroup(e);
        } else if (e.key === 'Escape') {
            handleClose();
        }
    };

    const isSaveEnabled = groupTitle.trim().length > 0 && selectedCategory;

    if (!isOpen) return null;

    return (
        <div className={`anon-create-modal-overlay ${isOpen ? 'visible' : ''}`}>
            <div className={`anon-create-modal-container ${isCategoryOpen ? 'dropdown-open' : ''}`} ref={modalRef} tabIndex="-1" onKeyDown={handleKeyPress}>
                <div className="anon-create-modal-header">
                    <h2 className="anon-header-title">Create Anonymous Group</h2>
                </div>

                <div className="anon-create-modal-content">
                    <div className="anon-group-form">
                        <div className="anon-form-top">
                            <div className="anon-image-upload" onClick={handleImageClick}>
                                {groupImage ? (
                                    <img src={URL.createObjectURL(groupImage)} alt="Group" className="anon-image-preview" />
                                ) : (
                                    <div className="anon-image-placeholder">
                                        <FaImage className="anon-image-icon" />
                                        <span>Add Group Image</span>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            <div className="anon-form-inputs">
                                <div className="anon-input-group">
                                    <label htmlFor="anon-group-title">Group Title</label>
                                    <input
                                        id="anon-group-title"
                                        type="text"
                                        placeholder="Enter group title"
                                        value={groupTitle}
                                        onChange={(e) => setGroupTitle(e.target.value)}
                                        className="anon-title-input"
                                    />
                                </div>
                                <div className="anon-input-group">
                                    <label htmlFor="anon-group-category">Category</label>
                                    <div className="anon-category-container" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            className={`anon-category-select-button ${isCategoryOpen ? 'open' : ''}`}
                                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                        >
                                            {selectedCategory || 'Select Category'}
                                            <IoIosArrowDown className="anon-category-icon" />
                                        </button>
                                        {isCategoryOpen && (
                                            <div className="anon-category-dropdown">
                                                {categories.map((category) => (
                                                    <div
                                                        key={category}
                                                        className="anon-category-option"
                                                        onClick={() => {
                                                            setSelectedCategory(category);
                                                            setIsCategoryOpen(false);
                                                        }}
                                                    >
                                                        {category}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="anon-input-group">
                            <label htmlFor="anon-group-description">Description</label>
                            <textarea
                                id="anon-group-description"
                                placeholder="Enter group description"
                                value={groupDescription}
                                onChange={(e) => setGroupDescription(e.target.value)}
                                className="anon-description-input"
                            />
                        </div>
                        <div className="anon-form-buttons">
                            <button
                                className="anon-cancel-button"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="anon-save-button"
                                onClick={handleCreateGroup}
                                disabled={!isSaveEnabled}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAnonymousGroupModal; 