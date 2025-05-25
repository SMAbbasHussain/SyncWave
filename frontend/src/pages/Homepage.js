import React from "react";
import "../styles/HomePage.css";
import Dashboard from "../components/Dashboard";
import VerticalNavbar from "../components/VerticalNavbar";
import Background from "../components/Background";

function Homepage() {
  return (
    <div className="homepage-layout">
      <Background />
      <div className="left-sidebar">
        <VerticalNavbar />
      </div>
      <div className="main-dashboard-area">
        <Dashboard />
      </div>
    </div>
  );
}

export default Homepage;