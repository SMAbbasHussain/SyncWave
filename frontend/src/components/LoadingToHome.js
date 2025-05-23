import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingPage from './LoadingPage';

const LoadingToHome = () => {
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Start exit animation after 2.5 seconds (giving 0.5s for fade out)
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, 2500);

        // Navigate to home after 3 seconds
        const navigateTimer = setTimeout(() => {
            navigate('/homepage', { replace: true });
        }, 3000);

        // Cleanup timers
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(navigateTimer);
        };
    }, [navigate]);

    return (
        <div style={{
            animation: isExiting ? 'fadeOut 0.5s ease-out forwards' : 'none'
        }}>
            <LoadingPage />
        </div>
    );
};

export default LoadingToHome; 