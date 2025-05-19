import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileSetup.css";

function ProfileSetup() {
  const [profilePic, setProfilePic] = useState(null);
  const [bio, setBio] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProfileSetup rendered");
  }, []);

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
  console.log("handleContinue triggered");

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem('user'));

  if (!token) {
    alert("You must be logged in to complete your profile.");
    return;
  }

  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bio, profilePic }),
    });

    const data = await response.json();

    if (response.ok) {
      // Update local storage with complete user data
      const updatedUser = {
        ...storedUser,
        username: data.username || storedUser.username,
        profilePic: data.profilePic || profilePic,
        bio: data.bio || bio
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Dispatch event to notify other components
      const event = new CustomEvent('userUpdated', { detail: updatedUser });
      window.dispatchEvent(event);
      
      console.log("Profile updated, navigating to /home");
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
    console.log("Skip clicked, navigating to /home");
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
