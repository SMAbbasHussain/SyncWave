import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingToHome = () => {
    const navigate = useNavigate();
    const [isExiting, setIsExiting] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // State to control rendering

    useEffect(() => {
        // 1. Check for the authentication token in localStorage
        const token = localStorage.getItem('token');

        // --- If NO TOKEN is found ---
        if (!token) {
            console.error("Auth check failed in LoadingToHome: No token found.");
            
            // THE FIX: Instead of calling toast.error, pass the message in the navigation state.
            // The Login.js component will receive this state and display the toast.
            navigate('/login', { 
              replace: true,
              state: { message: "You must be logged in to access this page." } 
            });
            
            // Stop rendering the loading page
            setIsLoading(false);
            
            // Exit the useEffect hook early
            return; 
        }

        // --- If a TOKEN IS FOUND ---
        // The component will proceed with the loading animation.
        console.log("Auth check passed: Token found. Proceeding to homepage...");

        // Start exit animation after a delay (e.g., 2.5 seconds)
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, 2500);

        // Navigate to the homepage after the animation delay (e.g., 3 seconds)
        const navigateTimer = setTimeout(() => {
            navigate('/homepage', { replace: true });
        }, 3000);

        // Cleanup timers on component unmount
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(navigateTimer);
        };
    }, [navigate]); // Dependency array remains the same

    // Conditionally render the LoadingPage component
    // If there was no token, isLoading becomes false and this returns null.
    if (!isLoading) {
        return null;
    }
};

export default LoadingToHome;