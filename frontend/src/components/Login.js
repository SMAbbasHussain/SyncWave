import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
// 1. IMPORT TOAST AND ITS CSS
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/login.css";
import Background from "./Background";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [hasShownCaptcha, setHasShownCaptcha] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const captchaRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle login errors from OAuth redirect (this is fine)
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get('error')) {
      setError(query.get('error'));
    }
  }, [location.search]);


  // **** 2. ADD THIS NEW USEEFFECT TO HANDLE REDIRECT MESSAGES ****
  useEffect(() => {
    // Check if the location state object exists and has our specific message property
    if (location.state?.message) {
      // Display the message from the state as an error toast
      toast.error(location.state.message);
      
      // Clear the state from the history so the message doesn't reappear
      // if the user navigates back and forth.
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]); // Dependencies ensure this runs only when location or navigate changes


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
    if (formData.email && formData.password && !focusedField) {
      setShowCaptcha(true);
      setHasShownCaptcha(true);
    }
  };

  useEffect(() => {
    if (hasShownCaptcha) {
      setShowCaptcha(true);
    } else if (formData.email && formData.password && !focusedField) {
      setShowCaptcha(true);
      setHasShownCaptcha(true);
    } else if (!formData.email || !formData.password) {
      setShowCaptcha(false);
    }
  }, [formData.email, formData.password, focusedField, hasShownCaptcha]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!captchaVerified) {
      setError("Please verify that you are not a robot.");
      setLoading(false);
      return;
    }

    const token = captchaRef.current.getValue();
    if (!token) {
      setError("Please complete the reCAPTCHA");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          email: formData.email,
          password: formData.password,
          recaptchaToken: token
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const user = {
        _id: response.data.user._id,
        username: response.data.user.username,
        email: response.data.user.email,
        profilePic: response.data.user.profilePic || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        bio: response.data.user.bio || '',
        phoneNo: response.data.user.phoneNo || '',
        status: response.data.user.status || 'offline'
      };

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate('/home', { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        setError(error.response.data?.error || error.response.data?.message || "Login failed. Please try again.");
      } else if (error.request) {
        setError("No response from server. Please check your network.");
      } else {
        setError("Unexpected error occurred. Please try again.");
      }
      if (captchaRef.current) captchaRef.current.reset();
      setCaptchaVerified(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Background />
      {/* 3. RENDER THE TOASTCONTAINER */}
      {/* This component is invisible but is required for toasts to appear. */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <div className="login-page-container">
        <div className="login-decorative-oval">
          <div className="oval-content">
            <h1 className="oval-logo">SYNCWAVE</h1>
            <p className="oval-welcome-text">Welcome to the future of communication</p>
            <button
              className="oval-signup-button"
              onClick={() => navigate('/signup')}
            >
              Sign Up Now!
            </button>
          </div>
        </div>
        <div className="container login-container">
          <h2 className={`login-head-text ${!showCaptcha ? 'captcha-hidden' : ''}`}>Login Account</h2>
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* ... Your form JSX ... */}
             <div className="login-input-container">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                required
                placeholder=" "
              />
              <label>Email</label>
            </div>

            <div className="login-input-container">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => handleFocus('password')}
                onBlur={handleBlur}
                required
                placeholder=" "
                minLength="6"
              />
              <label>Password</label>
            </div>

            <div className={`login-captcha-container ${showCaptcha ? 'show' : 'hide'}`}>
              <ReCAPTCHA
                ref={captchaRef}
                sitekey={process.env.REACT_APP_RECAPTCHA_KEY}
                onChange={(value) => setCaptchaVerified(!!value)}
                theme="dark"
                size="normal"
              />
            </div>

            <button
              className="login-btn-login"
              type="submit"
              disabled={loading || !formData.email || !formData.password || !captchaVerified}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <button
            className="login-btn-google"
            onClick={() => {
              window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
            }}
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png" alt="Google Logo" />
            Login with Google
          </button>

          <p className="login-else-text">
            Don't have an account? <Link to="/signup">Create New</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;