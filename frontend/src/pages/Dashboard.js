import React from "react";
import "../styles/Dashboard.css";
import PrivateChats from "../components/PrivateChats";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <PrivateChats />
    </div>
  );
}

export default Dashboard;