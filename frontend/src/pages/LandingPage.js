import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import '../styles/LandingPage.css';
import Background from '../components/Background';

const LandingPage = () => {
    const navigate = useNavigate();
    const overlayRef = useRef(null);

    useEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay) return;

        const numStars = 50; // Number of stars
        const colors = ['#ffffff', '#ffffff', '#ffffff', '#87CEFA', '#00bfff']; // White and bluish colors (more white)

        // Function to create a single star element
        const createStar = () => {
            const star = document.createElement('span');
            star.classList.add('star');

            // Set random position within the overlay
            const size = Math.random() * 2 + 1; // Size between 1px and 3px
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.left = `${Math.random() * 100}%`;

            // Set random color and opacity
            const color = colors[Math.floor(Math.random() * colors.length)];
            star.style.backgroundColor = color;
            star.style.opacity = Math.random() * 0.8 + 0.2; // Opacity between 0.2 and 1

            // Set random animation delay
            star.style.animationDelay = `${Math.random() * 5}s`; // Random delay up to 5 seconds

            return star;
        };

        // Create and append stars
        const stars = [];
        for (let i = 0; i < numStars; i++) {
            const star = createStar();
            overlay.appendChild(star);
            stars.push(star);
        }

        // Cleanup function to remove stars when component unmounts
        return () => {
            stars.forEach(star => star.remove());
        };

    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    return (
        <div className="landing-container">
            <Background />
            <div className="landing-content">
                <div className="left-column">
                    <div className="new-tag-container">
                        <span className="new-box">NEW</span> Try Anonymous ChatGroups
                    </div>
                    <h1 className="syncwave-logo">SYNCWAVE</h1>
                    <p className="landing-caption">From private chats to AI talks — even anonymous groups. One app, endless conversations.</p>
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
                        <button
                            className="download-app-button"
                            onClick={() => window.open('https://play.google.com/store/apps/details?id=com.syncwave.app', '_blank')}
                        >
                            <FaDownload className="download-icon" />
                            Download App
                        </button>
                    </div>

                </div>
                <div className="right-column">
                    <img src="/AiModel.svg" alt="AI Robot" className="robot-image" />
                    <div className="right-column-overlay" ref={overlayRef}></div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage; 