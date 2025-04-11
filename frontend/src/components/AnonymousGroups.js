import React, { useState, useEffect } from 'react';
import { FiPlus, FiRefreshCw, FiFilter, FiEye, FiEyeOff } from 'react-icons/fi';
import '../styles/AnonymousGroups.css';

const AnonymousGroups = () => {
    const [isHidden, setIsHidden] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Close category dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.anon-category-container')) {
                setShowCategoryDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Placeholder data for anonymous groups
    const [groups, setGroups] = useState([
        { id: 1, name: "Whisper Circle #1", members: 15, category: "Gaming" },
        { id: 2, name: "Tech Hub Connect", members: 8, category: "Technology & Programming" },
        { id: 3, name: "Movie Buffs Anonymous", members: 12, category: "Entertainment & Movies" },
        { id: 4, name: "Study Squad Alpha", members: 20, category: "Education & Study Groups" },
        { id: 5, name: "Music Makers Unite", members: 10, category: "Music & Podcasts" },
        { id: 6, name: "Fitness Warriors", members: 25, category: "Sports & Fitness" },
        { id: 7, name: "Code Masters", members: 18, category: "Technology & Programming" },
        { id: 8, name: "Book Club Secret", members: 14, category: "Education & Study Groups" },
        { id: 9, name: "Gaming League X", members: 30, category: "Gaming" },
        { id: 10, name: "Health & Wellness Circle", members: 22, category: "Health & Wellness" },
        { id: 11, name: "Travel Tales", members: 16, category: "Travel & Adventure" },
        { id: 12, name: "Business Innovators", members: 19, category: "Work & Business" },
        { id: 13, name: "Family Connect", members: 13, category: "Friends & Family" },
        { id: 14, name: "Sports Talk Anonymous", members: 28, category: "Sports & Fitness" },
        { id: 15, name: "Movie Critics Circle", members: 17, category: "Entertainment & Movies" }
    ]);

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

    const handleRefresh = () => {
        const shuffled = [...groups].sort(() => Math.random() - 0.5);
        setGroups(shuffled);
    };

    const toggleVisibility = () => {
        setIsHidden(!isHidden);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setShowCategoryDropdown(false);
    };

    const filteredGroups = selectedCategory
        ? groups.filter(group => group.category === selectedCategory)
        : groups;

    return (
        <div className={`anon-groups-container ${isHidden ? 'hidden' : ''}`}>
            {!isHidden ? (
                <>
                    <div className="anon-groups-header">
                        <h2>Anonymous Groups</h2>
                        <div className="anon-groups-actions">
                            <button className="anon-action-btn create-btn" title="Create New Group">
                                <FiPlus className="action-icon" />
                            </button>
                            <button
                                className="anon-action-btn refresh-btn"
                                onClick={handleRefresh}
                                title="Refresh Groups"
                            >
                                <FiRefreshCw className="action-icon" />
                            </button>
                            <div className="anon-category-container">
                                <button
                                    className="anon-action-btn category-btn"
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    title="Filter by Category"
                                >
                                    <FiFilter className="action-icon" />
                                </button>
                                {showCategoryDropdown && (
                                    <div className="anon-category-dropdown">
                                        <div
                                            className="category-option"
                                            onClick={() => handleCategorySelect('')}
                                        >
                                            All Categories
                                        </div>
                                        {categories.map(category => (
                                            <div
                                                key={category}
                                                className="category-option"
                                                onClick={() => handleCategorySelect(category)}
                                            >
                                                {category}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                className="anon-action-btn visibility-btn"
                                onClick={toggleVisibility}
                                title="Hide Groups"
                            >
                                <FiEye className="action-icon" />
                            </button>
                        </div>
                    </div>
                    <div className="anon-groups-list">
                        {filteredGroups.map(group => (
                            <div key={group.id} className="anon-group-item">
                                <div className="anon-group-info">
                                    <span className="anon-group-name">{group.name}</span>
                                    <span className="anon-group-members">{group.members} members</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="anon-groups-collapsed">
                    <div className="collapsed-content">
                        <h2>Anonymous Groups</h2>
                        <div className="collapsed-actions">
                            <button className="anon-action-btn create-btn" title="Create New Group">
                                <FiPlus className="action-icon" />
                            </button>
                            <button
                                className="anon-action-btn visibility-btn"
                                onClick={toggleVisibility}
                                title="Show Groups"
                            >
                                <FiEyeOff className="action-icon" />
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default AnonymousGroups; 