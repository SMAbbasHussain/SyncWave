// src/components/TitleBar.js
import React from 'react';
import '../styles/TitleBar.css'; // We'll create this file next

const TitleBar = () => {
  return (
    <div className="title-bar">
      <div className="title">
        <img src="/logo192.png" alt="logo" className="icon" /> {/* Example icon */}
        SyncWave
      </div>
      <div className="window-controls">
         {/* We will add buttons here later */}
      </div>
    </div>
  );
};

export default TitleBar;