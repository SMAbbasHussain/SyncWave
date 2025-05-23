import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';


const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">

            <div className="logo-container">
                <h1 className="syncwave-logo">SYNCWAVE</h1>
            </div>
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

        </div>
    );
};

export default LandingPage; 