import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';


function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const isNewUser = query.get('isNewUser') === 'true';

    // If the URL parameters from OAuth are missing, redirect immediately.
    if (!token) {
      // Pass a generic error message to the login page.
      navigate('/login', {
        replace: true,
        state: { message: 'Authentication process was invalid. Please try again.' }
      });
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch current user data using the token from the URL
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch user data');
        }

        const userData = response.data.user;

        // Store authentication data in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Dispatch a custom event to notify other components (like Profile.js)
        const userUpdatedEvent = new CustomEvent('userUpdated', {
          detail: userData
        });
        window.dispatchEvent(userUpdatedEvent);

        // Clean the token from the URL for security
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirect based on whether the user is new or returning
        navigate(isNewUser ? '/profile-setup' : '/home', {
          replace: true
        });

      } catch (err) {
        console.error("Authentication error during AuthSuccess:", err);

        // Clear any potentially stored bad data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        const errorMessage = err.response?.data?.error || err.message || "Authentication failed. Please try again.";
        setError(errorMessage);

        // THE FIX: Redirect to login and pass the error message
        // in a 'message' property within the state object.
        navigate('/login', {
          replace: true,
          state: {
            message: errorMessage
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [location, navigate]);

  // This component will only be visible for a very short time.
  // It provides feedback to the user while processing.
  return (
    <div className="auth-processing-container">
      <div className="auth-processing-content">
        {loading && <div className="loading-spinner">Finalizing login...</div>}
        {error && <div className="error-message">Redirecting... An error occurred: {error}</div>}
      </div>
    </div>
  );
}

export default AuthSuccess;