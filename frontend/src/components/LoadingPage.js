import React from 'react';
import '../styles/LoadingPage.css';

const LoadingPage = () => {
    return (
        <div className="loading-container">
            <h1 className="loading-logo">SyncWave</h1>
            <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>
        </div>
    );
};

export default LoadingPage; 