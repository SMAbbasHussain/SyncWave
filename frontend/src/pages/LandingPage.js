import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LoadingDots = () => {
    return (
        <div className="loading-dots">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
        </div>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <div className="button-container">
                <button
                    className="auth-button login"
                    onClick={() => navigate('/login')}
                >
                    Login
                </button>
                <button
                    className="auth-button signup"
                    onClick={() => navigate('/signup')}
                >
                    Sign Up
                </button>
            </div>
            <div className="logo-container">
                <h1 className="syncwave-logo">SYNCWAVE</h1>
                <LoadingDots />
            </div>
        </div>
    );
};

export default LandingPage; 