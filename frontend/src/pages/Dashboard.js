import React from "react";
import "../styles/Dashboard.css";
import PrivateChats from "../components/PrivateChats";
import Profile from "../components/Profile";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <div className="top-section">
        <PrivateChats />
        <Profile />
      </div>
    </div>
  );
}

export default Dashboard;