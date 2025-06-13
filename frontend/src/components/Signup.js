import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/signup.css";
import Background from "./Background";


function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    phoneNo: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.email && formData.password && formData.username && formData.phoneNo) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            username: formData.username,
            password: formData.password,
            phoneNo: formData.phoneNo
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store both token and user data in localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify({
            _id: data.user._id,
            username: data.user.username,
            email: data.user.email,
            phoneNo: data.user.phoneNo,
            profilePic: data.user.profilePic || "/PFP2.png", // Default profile picture
            bio: "", // Empty bio by default
            isLoggedIn: true
          }));

          // Navigate to profile setup
          navigate("/profile-setup");
        } else {
          alert(data.error || "Signup failed");
        }
      } catch (err) {
        console.error("Signup error:", err);
        alert("An error occurred. Please try again.");
      }
    } else {
      setError("Please fill in all required fields.");
    }
  };

  return (
    <>
      <Background />
      <div className="signup-page-container">
        {/* Decorative Oval */}
        <div className="signup-decorative-oval">
          <div className="signup-oval-content">
            <h1 className="signup-oval-logo">SyncWave</h1>
            <p className="signup-oval-welcome-text">
              Welcome to SyncWave! Your journey to seamless communication starts here.

            </p>
            <Link to="/login" className="signup-oval-login-button">
              Go to Login
            </Link>
          </div>
        </div>

        {/* Signup Form Container */}
        <div className="signup-container container">
          <h2 className="signup-head-text">Create New Account</h2>
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="signup-input-container signup-full-width">
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

            {/* Username and Phone Number in a Single Row */}
            <div className="signup-row">
              <div className="signup-input-container signup-half-width">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <label>Username</label>
              </div>
              <div className="signup-input-container signup-half-width">
                <input
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <label>Phone Number</label>
              </div>
            </div>

            {/* Password and Confirm Password Fields */}
            <div className="signup-row">
              <div className="signup-input-container signup-half-width">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <label>Password</label>
              </div>
              <div className="signup-input-container signup-half-width">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder=" "
                />
                <label>Re-type Password</label>
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            {/* Submit Button */}
            <button className="signup-btn-signup" type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Signup;