import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import HomePage from "./pages/Homepage";
import ProfileSetup from "./components/ProfileSetup";
import LandingPage from "./pages/LandingPage";
import LoadingToHome from "./components/LoadingToHome";
import "./styles/App.css";
import Background from './components/Background';
import AuthSuccess from './components/authSuccess';

function App() {
  return (
    <Router>
      <Background>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/home" element={<LoadingToHome />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
        </Routes>
      </Background>
    </Router>
  );
}

export default App;