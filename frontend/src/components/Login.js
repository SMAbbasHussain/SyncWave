import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [fieldsFilled, setFieldsFilled] = useState(false);
  const captchaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setFieldsFilled(email !== "" && password !== "");
  }, [email, password]);

  const handleCaptchaChange = (value) => {
    if (value) {
      setCaptchaVerified(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaVerified) {
      alert("Please verify that you are not a robot.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // Store token in localStorage
      localStorage.setItem("token", response.data.token);

      // Redirect to home page
      navigate("/home");
    } catch (error) {
      alert(error.response?.data?.error || "Login failed. Try again.");
    }
  };

  return (
    <div className="container login-container">
      <h2 className="login-head-text">Login Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="login-input-container">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder=" "
          />
          <label>Username or Email</label>
        </div>
        <div className="login-input-container">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder=" "
          />
          <label>Password</label>
        </div>

        {fieldsFilled && (
          <div className="login-captcha-container">
            <ReCAPTCHA
              ref={captchaRef}
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" 
              onChange={handleCaptchaChange}
            />
          </div>
        )}

        <button className="login-btn-login" type="submit">
          Login
        </button>
      </form>
      <button className="login-btn-google" onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}>
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