// src/components/TitleBar.js
import React from 'react';
import '../styles/TitleBar.css'; // We'll create this file next
import appIcon from '../assets/icon.png';

const TitleBar = () => {
  const handleMinimize = () => {
    // The 'electronAPI' object is available globally thanks to the preload script
    window.electronAPI.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI.maximize();
  };

  const handleClose = () => {
    window.electronAPI.close();
  };

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <img src={appIcon} alt="app icon" className="title-bar-icon" />
        <span className="title-bar-text">SyncWave</span>
      </div>
      <div className="title-bar-right">
        <button className="window-control" onClick={handleMinimize}></button>
        <button className="window-control" onClick={handleMaximize}></button>
        <button className="window-control window-control-close" onClick={handleClose}></button>
      </div>
    </div>
  );
};

export default TitleBar;