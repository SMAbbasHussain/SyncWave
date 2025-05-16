import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import HomePage from "./pages/Homepage";
import ProfileSetup from "./components/ProfileSetup";
import "./styles/App.css";
import Background from './components/Background';

function App() {
  return (
    <Router>
      <Background>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </Background>
    </Router>
  );
}

export default App;