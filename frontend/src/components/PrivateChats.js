import React, { useState, useRef, useEffect } from "react";
import "../styles/PrivateChats.css";
import { FaSearch } from "react-icons/fa";

function PrivateChats() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const chatContainerRef = useRef(null);
  const searchContainerRef = useRef(null);

  const privateChats = [
    { id: 1, name: "aleena", image: "https://via.placeholder.com/40" },
    { id: 2, name: "salman", image: "https://via.placeholder.com/40" },
    { id: 3, name: "Abbas hussain", image: "https://via.placeholder.com/40" },
    { id: 4, name: "zayn abbas", image: "https://via.placeholder.com/40" },
    { id: 5, name: "Johnson", image: "https://via.placeholder.com/40" },
    { id: 6, name: "Jane Smith", image: "https://via.placeholder.com/40" },
    { id: 7, name: "mynamezain", image: "https://via.placeholder.com/40" },
    { id: 8, name: "Namesare", image: "https://via.placeholder.com/40" },
    { id: 9, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 10, name: "Nail", image: "https://via.placeholder.com/40" },
    { id: 11, name: "Jane Smith", image: "https://via.placeholder.com/40" },
    { id: 12, name: "mynamezain", image: "https://via.placeholder.com/40" },
    { id: 13, name: "Namesare", image: "https://via.placeholder.com/40" },
    { id: 14, name: "Name", image: "https://via.placeholder.com/40" }
  ];

  const filteredChats = privateChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const shouldTextScroll = (text) => {
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.fontSize = '0.8rem';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.innerText = text;
    document.body.appendChild(tempSpan);
    const width = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);
    return width > 45;
  };

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
                    <div className="chat-name" data-should-scroll={shouldTextScroll(chat.name)}>
                      <span className="chat-name-inner">{chat.name}</span>
                    </div>
                  </div>
                ))
                : filteredChats.length > 0
                  ? filteredChats.map((chat) => (
                    <div key={chat.id} className="chat-item">
                      <img src={chat.image} alt={chat.name} className="chat-pic" />
                      <div className="chat-name" data-should-scroll={shouldTextScroll(chat.name)}>
                        <span className="chat-name-inner">{chat.name}</span>
                      </div>
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