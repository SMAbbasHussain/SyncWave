import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    if (email && password) {
      setFieldsFilled(true);
    } else {
      setFieldsFilled(false);
    }
  }, [email, password]);

  const handleCaptchaChange = (value) => {
    if (value) {
      setCaptchaVerified(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!captchaVerified) {
      alert("Please verify that you are not a robot.");
      return;
    }

    if (email === "test@example.com" && password === "password123") {
      navigate("/home");
    } else {
      alert("Invalid credentials, please try again.");
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
              sitekey="YOUR_SITE_KEY" // Replace with your Site Key
              onChange={handleCaptchaChange}
            />
          </div>
        )}

        <button className="login-btn-login" type="submit">
          Login
        </button>
      </form>
      <button className="login-btn-google">
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