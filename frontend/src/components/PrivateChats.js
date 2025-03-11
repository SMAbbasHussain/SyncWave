import React, { useState, useRef, useEffect } from "react";
import "../styles/PrivateChats.css";
import { FaSearch } from "react-icons/fa";

function PrivateChats() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const chatContainerRef = useRef(null);
  const searchContainerRef = useRef(null);

  const privateChats = [
    { id: 1, name: "aleen", image: "https://via.placeholder.com/40" },
    { id: 2, name: "zayr", image: "https://via.placeholder.com/40" },
    { id: 3, name: "saleeha", image: "https://via.placeholder.com/40" },
    { id: 4, name: "zayn uhj2", image: "https://via.placeholder.com/40" },
    { id: 5, name: "Johjnjn Doe", image: "https://via.placeholder.com/40" }, // Two-word name
    { id: 6, name: "Jane Smith", image: "https://via.placeholder.com/40" }, // Two-word name
    { id: 7, name: "mynameiszain", image: "https://via.placeholder.com/40" }, // Long name
    { id: 8, name: "Namesi ", image: "https://via.placeholder.com/40" },
    { id: 9, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 10, name: "Nail", image: "https://via.placeholder.com/40" },
  ];

  const filteredChats = privateChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target) &&
        !e.target.classList.contains("search-toggle-icon") &&
        !e.target.classList.contains("search-toggle") &&
        !e.target.classList.contains("search-toggle-span")
      ) {
        setIsSearchVisible(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const formatChatName = (name) => {
    if (name.length > 7) {
      return name.slice(0, 7) + "..";
    }
    return name;
  };

  return (
    <div className="private-chats-container">
      <div className="content-wrapper">
        <div className={`chats-section ${isSearchVisible ? "reduced-width" : ""}`}>
          <div className="chats-wrapper">
            <div className="chat-container" ref={chatContainerRef}>
              {isSearchVisible && searchQuery.trim() === ""
                ? privateChats.map((chat) => (
                    <div key={chat.id} className="chat-item">
                      <img src={chat.image} alt={chat.name} className="chat-pic" />
                      <div className="chat-name">{formatChatName(chat.name)}</div>
                    </div>
                  ))
                : filteredChats.length > 0
                ? filteredChats.map((chat) => (
                    <div key={chat.id} className="chat-item">
                      <img src={chat.image} alt={chat.name} className="chat-pic" />
                      <div className="chat-name">{formatChatName(chat.name)}</div>
                    </div>
                  ))
                : (
                    <div className="no-results">
                      No chats found matching "{searchQuery}"
                    </div>
                  )}
            </div>
          </div>
        </div>
        <div className="separator"></div>
        <div className={`search-section ${isSearchVisible ? "expanded" : ""}`} ref={searchContainerRef}>
          {!isSearchVisible && (
            <div className="search-toggle" onClick={toggleSearch}>
              <FaSearch className="search-toggle-icon" />
              <span className="search-toggle-span">Search</span>
            </div>
          )}
          {isSearchVisible && (
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search private chats..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrivateChats;