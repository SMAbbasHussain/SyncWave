import React, { useState, useEffect } from "react";
import "../styles/Groups.css";
import { FaSearch } from "react-icons/fa";

function Groups() {
  const [scrolling, setScrolling] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [groups] = useState([
    { id: 1, name: "Group Name ni mila?" },
    { id: 2, name: "itna dehan kabhi.." },
    { id: 3, name: "PARHAI Pr dete na" },
    { id: 4, name: "To ajj kamyaab hote" },
    { id: 5, name: "Hadeed bhai.." },
    { id: 6, name: "React seekh lo" },
    { id: 7, name: "Abbas kerey na nikal" },
    { id: 8, name: "Sakooon kr thore din" },
    { id: 9, name: "kia dhoond rhy?" },
    { id: 10, name: "bsss kro. bye" },
    
  ]);

  const handleScroll = () => {
    setScrolling(true);
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => setScrolling(false), 1000);
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="groups-container">
      <div className="groups-search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search groups..."
          className="groups-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div
        className={`groups-list ${scrolling ? "show-scrollbar" : ""}`}
        onScroll={handleScroll}
      >
        {searchQuery.trim() === ""
          ? groups.map((group) => (
              <div key={group.id} className="group-item">
                <div className="group-pic"></div>
                <div className="group-name">{group.name}</div>
              </div>
            ))
          : filteredGroups.length > 0
          ? filteredGroups.map((group) => (
              <div key={group.id} className="group-item">
                <div className="group-pic"></div>
                <div className="group-name">{group.name}</div>
              </div>
            ))
          : (
              <div className="no-results">
                No groups found matching "{searchQuery}"
              </div>
            )}
      </div>
    </div>
  );
}

export default Groups;