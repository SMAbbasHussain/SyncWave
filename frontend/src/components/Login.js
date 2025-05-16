import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import "../styles/login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const captchaRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!captchaVerified) {
      setError("Please verify that you are not a robot.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/home");
    } 
    catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        // Backend responded with a status code
        console.error("Backend error response:", error.response);
        setError(error.response.data?.error || error.response.data?.message || "Login failed. Please try again.");
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
        setError("No response from server. Please check your network.");
      } else {
        // Something happened setting up the request
        console.error("Axios error setting up the request:", error.message);
        setError("Unexpected error occurred. Please try again.");
      }

      // Always reset CAPTCHA on error
      if (captchaRef.current) {
        captchaRef.current.reset();
      }
      setCaptchaVerified(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container login-container">
      <h2 className="login-head-text">Login Account</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="login-input-container">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
            required
            placeholder=" "
            minLength="6"
          />
          <label>Password</label>
        </div>

        <div className="login-captcha-container">
          <ReCAPTCHA
            ref={captchaRef}
            sitekey={process.env.REACT_APP_RECAPTCHA_KEY}
            onChange={(value) => setCaptchaVerified(!!value)}
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
        onClick={() => window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`}
      >
        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png" alt="Google Logo" />
        Login with Google
      </button>
      
      <p className="login-else-text">
        Don't have an account? <Link to="/signup">Create New</Link>
      </p>
    </div>
  );
}

export default Login;