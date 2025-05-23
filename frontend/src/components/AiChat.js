import React, { useState, useRef } from 'react';
import { FaRobot } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';
import '../styles/AiChat.css';

const AiChat = ({ onClick }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    return (
        <div
            className="ai-chat-container"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <div className="gradient-lines left">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
            </div>

            <div className="ai-chat-content">
                <div className="ai-chat-header">
                    <h2>Chat with AI</h2>
                    <BsStars className="stars-icon" />
                </div>

                <div className="right-icon">
                    <FaRobot className="robot-icon" />
                    <div className="ai-pulse"></div>
                </div>
            </div>

            <div className="gradient-lines right">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
            </div>

            <div
                className="hover-effect"
                style={{
                    left: `${mousePosition.x}px`,
                    top: `${mousePosition.y}px`
                }}
            ></div>
        </div>
    );
};

export default AiChat; 