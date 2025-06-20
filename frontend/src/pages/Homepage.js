import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// We no longer need toast here
// import { toast } from 'react-toastify'; 

import "../styles/HomePage.css";
import Dashboard from "../components/Dashboard";
import VerticalNavbar from "../components/VerticalNavbar";
import Background from "../components/Background";
import LoadingPage from "../components/LoadingToHome";

function Homepage() {
  const [activeNavItem, setActiveNavItem] = useState(() => {
    return localStorage.getItem('activeNavItem') || 'home';
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      // THE FIX: Instead of calling toast here, pass the message in the navigation state.
      navigate('/login', { 
        replace: true,
        state: { message: "Authentication required. Please log in." } 
      });
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('activeNavItem', activeNavItem);
  }, [activeNavItem]);

  const handleNavItemChange = (navItem) => {
    setActiveNavItem(navItem);
  };

  if (isLoading) {
    return <LoadingPage />;
  }
  
  return (
    <div className="homepage-layout">
      <Background />
      <div className="left-sidebar">
        <VerticalNavbar 
          activeItem={activeNavItem}
          onNavItemChange={handleNavItemChange} 
        />
      </div>
      <div className="main-dashboard-area">
        <Dashboard 
          activeNavItem={activeNavItem} 
          onNavigate={handleNavItemChange} 
        />
      </div>
    </div>
  );
}

export default Homepage;