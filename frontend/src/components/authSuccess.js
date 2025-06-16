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

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch current user data
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

        // Store authentication data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Dispatch custom event to notify other components
        const userUpdatedEvent = new CustomEvent('userUpdated', {
          detail: userData
        });
        window.dispatchEvent(userUpdatedEvent);

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirect based on new user status
        navigate(isNewUser ? '/profile-setup' : '/home', {
          replace: true
        });

      } catch (err) {
        console.error("Authentication error:", err);

        // Clear any stored data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setError(err.response?.data?.error || err.message || "Authentication failed");

        navigate('/login', {
          replace: true,
          state: {
            error: err.response?.data?.error || err.message || "Authentication failed"
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [location, navigate]);

  return (
    <div className="auth-processing">
      {loading ? (
        <div className="loading-spinner">Processing login...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : null}
    </div>
  );
}

export default AuthSuccess;