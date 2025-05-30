import React, { useState, useEffect, useRef } from "react";
import "../styles/Groups.css";
import { FaSearch, FaTimes, FaUsers } from "react-icons/fa";

function Groups({ onChatSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groups] = useState([
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

  return (
    <div className="groups-container">
      <div className="groups-header">
        <div className={`header-content ${isSearchActive ? 'search-active' : ''}`}>
          <h2 className="header-title">Groups</h2>
          <button
            className={`search-toggle ${isSearchActive ? 'active' : ''}`}
            onClick={toggleSearch}
            aria-label="Toggle search"
          >
            <FaSearch />
            <span className="search-label">Search</span>
          </button>
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
    </div>
  );
}

export default Groups;