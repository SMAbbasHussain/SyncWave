import React, { useState } from "react";
import "../styles/HomePage.css";
import Dashboard from "../components/Dashboard";
import VerticalNavbar from "../components/VerticalNavbar";
import Background from "../components/Background";

function Homepage() {
  const [activeNavItem, setActiveNavItem] = useState('home');

  const handleNavItemChange = (navItem) => {
    setActiveNavItem(navItem);
  };

  return (
    <div className="homepage-layout">
      <Background />
      <div className="left-sidebar">
        <VerticalNavbar onNavItemChange={handleNavItemChange} />
      </div>
      <div className="main-dashboard-area">
        <Dashboard activeNavItem={activeNavItem} />
      </div>
    </div>
  );
}

export default Homepage;