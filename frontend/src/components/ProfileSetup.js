import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileSetup.css";

function ProfileSetup() {
  const [profilePic, setProfilePic] = useState(null);
  const [bio, setBio] = useState("");
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleContinue = async () => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      alert("You must be logged in to complete your profile.");
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio, profilePic }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        navigate("/home");
      } else {
        alert(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("An error occurred while updating your profile.");
    }
  };
  

  const handleSkip = () => {
    navigate("/home");
  };

  return (
    <div className="container profile-setup-container">
      <h2 className="profile-setup-head-text">Complete Your Profile</h2>
      <div className="setup-profile-pic-container">
        <div className="setup-profile-pic-circle">
          <img
            src={profilePic || "/PFP2.png"}
            alt="Profile"
            className="setup-profile-pic"
          />
          <label htmlFor="profile-pic-upload" className="setup-profile-pic-edit-label">
            Edit
          </label>
          <input
            type="file"
            id="profile-pic-upload"
            accept="image/*"
            onChange={handleImageChange}
            className="setup-profile-pic-upload"
          />
        </div>
      </div>

      <div className="bio-input-container">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Add a bio (optional)"
          rows="4"
        />
      </div>

      <div className="profile-setup-actions">
      <button className="skip-btn" onClick={handleSkip}>
  Skip
</button>
<button className="continue-btn" onClick={handleContinue}>
  Continue
</button>

      </div>
    </div>
  );
}

export default ProfileSetup;