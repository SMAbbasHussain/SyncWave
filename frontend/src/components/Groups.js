import React, { useState, useEffect, useRef } from "react";
import "../styles/Groups.css";
import { FaSearch, FaTimes, FaUsers } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import CreateGroupModal from "./CreateGroupModal";

function Groups({ onChatSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const searchInputRef = useRef(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groups, setGroups] = useState([
    { id: 1, name: "Group Name ni mila?", groupPicUrl: "https://via.placeholder.com/40/abcdef", image: "https://via.placeholder.com/35" },
    { id: 2, name: "itna dehan kabhi..", groupPicUrl: '', image: "https://via.placeholder.com/35" },
    { id: 3, name: "PARHAI Pr dete na", groupPicUrl: "https://via.placeholder.com/40/123456", image: "https://via.placeholder.com/35" },
    { id: 4, name: "To ajj kamyaab hote", groupPicUrl: null, image: "https://via.placeholder.com/35" },
    { id: 5, name: "Hadeed bhai..", groupPicUrl: "https://via.placeholder.com/40/789012", image: "https://via.placeholder.com/35" },
    { id: 6, name: "React seekh lo", image: "https://via.placeholder.com/35" },
    { id: 7, name: "Abbas kerey na nikal", groupPicUrl: "https://via.placeholder.com/40/345678", image: "https://via.placeholder.com/35" },
    { id: 8, name: "Sakooon kr thore din", groupPicUrl: '', image: "https://via.placeholder.com/35" },
    { id: 9, name: "kia dhoond rhy?", groupPicUrl: "https://via.placeholder.com/40/901234", image: "https://via.placeholder.com/35" },
    { id: 10, name: "bsss kro. bye", image: "https://via.placeholder.com/35" },
  ]);

  // Mock friends list for the create group modal
  const mockFriends = [
    { id: 1, username: "John Doe", avatar: "https://via.placeholder.com/40" },
    { id: 2, username: "Jane Smith", avatar: "https://via.placeholder.com/40" },
    { id: 3, username: "Mike Johnson", avatar: null },
    { id: 4, username: "Sarah Williams", avatar: "https://via.placeholder.com/40" },
    { id: 5, username: "Alex Brown", avatar: null },
  ];

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
    }
  };

  const handleCloseSearch = (e) => {
    e.stopPropagation();
    setIsSearchActive(false);
    setSearchQuery("");
  };

  const handleGroupClick = (groupId) => {
    setSelectedGroupId(groupId);
    if (onChatSelect) {
      onChatSelect('group', groupId);
    }
  };

  const handleCreateGroup = (groupData) => {
    // TODO: Replace with actual API call to create group
    const newGroup = {
      id: groups.length + 1,
      name: groupData.title,
      groupPicUrl: null, // Will be updated when group image upload is implemented
      description: groupData.description,
      members: groupData.members
    };
    setGroups(prevGroups => [...prevGroups, newGroup]);
  };

  return (
    <div className="groups-container">
      <div className="groups-header">
        <div className={`header-content ${isSearchActive ? 'search-active' : ''}`}>
          <h2 className="header-title">Groups</h2>
          <div className="header-actions">
            <button
              className="action-btn create-btn"
              title="Create New Group"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <FiPlus className="action-icon" />
            </button>
            <button
              className={`search-toggle ${isSearchActive ? 'active' : ''}`}
              onClick={toggleSearch}
              aria-label="Toggle search"
            >
              <FaSearch />
              <span className="search-label">Search</span>
            </button>
          </div>
        </div>
        <div className={`search-container ${isSearchActive ? 'active' : ''}`}>
          <div className="search-bar">
            <FaSearch className="search-icon search-icon-left" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="search-close-button"
              onClick={handleCloseSearch}
              aria-label="Close search"
            >
              <FaTimes className="search-icon" />
            </button>
          </div>
        </div>
      </div>
      <div className="groups-list">
        {searchQuery.trim() === "" ? (
          groups.map((group) => (
            <div
              key={group.id}
              className={`group-item ${selectedGroupId === group.id ? 'active' : ''}`}
              onClick={() => handleGroupClick(group.id)}
            >
              <div className="group-pic">
                {group.groupPicUrl ? (
                  <img src={group.groupPicUrl} alt={`${group.name}'s picture`} className="group-pic-img" />
                ) : (
                  <FaUsers className="group-pic-icon" />
                )}
              </div>
              <div className="group-name">{group.name}</div>
            </div>
          ))
        ) : filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <div
              key={group.id}
              className={`group-item ${selectedGroupId === group.id ? 'active' : ''}`}
              onClick={() => handleGroupClick(group.id)}
            >
              <div className="group-pic">
                {group.groupPicUrl ? (
                  <img src={group.groupPicUrl} alt={`${group.name}'s picture`} className="group-pic-img" />
                ) : (
                  <FaUsers className="group-pic-icon" />
                )}
              </div>
              <div className="group-name">{group.name}</div>
            </div>
          ))
        ) : (
          <div className="no-results">
            No groups found matching "{searchQuery}"
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        friends={mockFriends}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}

export default Groups;