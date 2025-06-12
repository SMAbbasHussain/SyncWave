import React, { useState, useEffect, useRef } from "react";
import "../styles/Groups.css";
import { FaSearch, FaTimes, FaUsers } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import CreateGroupModal from "./CreateGroupModal";
import { getFriends } from '../services/friendService';
import axios from 'axios';


function Groups({ onChatSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const searchInputRef = useRef(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's groups from backend
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/groups`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setGroups(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch groups');
        console.error('Error fetching groups:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await getFriends();
        setFriends(data);
      } catch (error) {
        console.log(error.message);
        setError('Failed to fetch friends');
      }
    };
    fetchFriends();
  }, []);

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
      onChatSelect(
        groupId
      );
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      console.log('Creating group with data:', groupData);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/groups`,
        {
          name: groupData.title,
          description: groupData.description,
          members: groupData.members,
          photo: groupData.photo
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        const newGroup = response.data;
        setGroups(prevGroups => [...prevGroups, newGroup]);
        setIsCreateModalOpen(false);
      } else {
        throw new Error('No data received from server');
      }

    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.response?.data?.error || 'Failed to create group');
    }
  };

  if (isLoading) {
    return <div className="groups-container loading">Loading groups...</div>;
  }

  if (error) {
    return <div className="groups-container error">Error: {error}</div>;
  }

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
          groups.length > 0 ? (
            groups.map((group) => (
              <div
                key={group._id}
                className={`group-item ${selectedGroupId === group._id ? 'active' : ''}`}
                onClick={() => handleGroupClick(group._id)}
              >
                <div className="group-pic">
                  {group.photo ? (
                    <img src={group.photo} alt={`${group.name}'s picture`} className="group-pic-img" />
                  ) : (
                    <FaUsers className="group-pic-icon" />
                  )}
                </div>
                <div className="group-name">{group.name}</div>
              </div>
            ))
          ) : (
            <div className="no-groups-message">
              You don't have any groups yet. Create one to get started!
            </div>
          )
        ) : filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <div
              key={group._id}
              className={`group-item ${selectedGroupId === group._id ? 'active' : ''}`}
              onClick={() => handleGroupClick(group._id)}
            >
              <div className="group-pic">
                {group.photo ? (
                  <img src={group.photo} alt={`${group.name}'s picture`} className="group-pic-img" />
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
        friends={friends}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}

export default Groups;