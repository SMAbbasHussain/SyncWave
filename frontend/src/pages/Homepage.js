import React from "react";
import "../styles/HomePage.css";
import Groups from "../components/Groups";
import Dashboard from "../components/Dashboard";

function Homepage() {
  return (
    <div className="homepage-layout">
      <Groups />
      <Dashboard />
    </div>
  );
}

export default Homepage;