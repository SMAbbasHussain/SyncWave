import React, { useState, useRef, useEffect } from "react";
import "../styles/PrivateChats.css";
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";

function PrivateChats() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const chatContainerRef = useRef(null);
  const [scrollButtonsVisible, setScrollButtonsVisible] = useState({
    left: false,
    right: true,
  });

  const privateChats = [
    { id: 1, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 2, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 3, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 4, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 5, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 6, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 7, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 8, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 9, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 10, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 11, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 12, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 13, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 14, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 15, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 16, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 17, name: "Name", image: "https://via.placeholder.com/40" },
    { id: 18, name: "Name", image: "https://via.placeholder.com/40" },
  ];

  const filteredChats = privateChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollLeft = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollLeft -= 100;
      checkScrollPosition();
    }
  };

  const scrollRight = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollLeft += 100;
      checkScrollPosition();
    }
  };

  const checkScrollPosition = () => {
    if (chatContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = chatContainerRef.current;
      setScrollButtonsVisible({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth,
      });
    }
  };

  useEffect(() => {
    checkScrollPosition();
  }, []);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  return (
    <div className="private-chats-container">
      <div className="content-wrapper">
        <div className={`chats-section ${isSearchVisible ? "reduced-width" : ""}`}>
          <div className="chats-wrapper">
            <button
              className={`scroll-button left ${!scrollButtonsVisible.left ? "disabled" : ""}`}
              onClick={scrollLeft}
            >
              <FaChevronLeft />
            </button>
            <div className="chat-container" ref={chatContainerRef} onScroll={checkScrollPosition}>
              {isSearchVisible && searchQuery.trim() === ""
                ? privateChats.map((chat) => (
                    <div key={chat.id} className="chat-item">
                      <img src={chat.image} alt={chat.name} className="chat-pic" />
                      <div className="chat-name">{chat.name}</div>
                    </div>
                  ))
                : filteredChats.length > 0
                ? filteredChats.map((chat) => (
                    <div key={chat.id} className="chat-item">
                      <img src={chat.image} alt={chat.name} className="chat-pic" />
                      <div className="chat-name">{chat.name}</div>
                    </div>
                  ))
                : (
                    <div className="no-results">
                      No chats found matching "{searchQuery}"
                    </div>
                  )}
            </div>
            <button
              className={`scroll-button right ${!scrollButtonsVisible.right ? "disabled" : ""}`}
              onClick={scrollRight}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        <div className="separator"></div>
        <div className={`search-section ${isSearchVisible ? "expanded" : ""}`}>
          <div className="search-toggle" onClick={toggleSearch}>
            <FaSearch className="search-toggle-icon" />
            <span>Search</span>
          </div>
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