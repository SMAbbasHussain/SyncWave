import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileSetup.css";

function ProfileSetup() {
  const [profilePic, setProfilePic] = useState(null);
  const [bio, setBio] = useState("");
  const [isFormFilled, setIsFormFilled] = useState(false);
  const navigate = useNavigate();

  // Monitor form state changes
  useEffect(() => {
    setIsFormFilled(!!(profilePic || bio.trim()));
  }, [profilePic, bio]);

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

  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  const handleContinue = async () => {
    if (!isFormFilled) return;

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
        const updatedUser = {
          ...storedUser,
          username: data.username || storedUser.username,
          profilePic: data.profilePic || profilePic,
          bio: data.bio || bio
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
        navigate("/home", { replace: true });
      } else {
        alert(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("An error occurred while updating your profile.");
    }
  };

  const handleSkip = () => {
    if (isFormFilled) return;
    navigate("/home", { replace: true });
  };

  return (
    <div className="profile-setup-wrapper">
      <div className="profile-setup-container">
        <h2 className="profile-setup-head-text">Complete Your Profile</h2>

        <div className="profile-setup-content">
          <div className="setup-profile-pic-container">
            <div className="setup-profile-pic-circle">
              <img
                src={profilePic || "/PFP2.png"}
                alt="Profile"
                className="setup-profile-pic"
              />
              <label
                htmlFor="profile-pic-upload"
                className="setup-profile-pic-edit-label"
                tabIndex="0"
                role="button"
                aria-label="Upload profile picture"
              >
                Edit
              </label>
              <input
                type="file"
                id="profile-pic-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="setup-profile-pic-upload"
                aria-label="Upload profile picture"
              />
            </div>
          </div>

          <div className="bio-input-container">
            <textarea
              value={bio}
              onChange={handleBioChange}
              placeholder="Add a bio (optional)"
              rows="4"
              aria-label="Profile bio"
              maxLength="500"
            />
            <div className="bio-character-count">
              {bio.length}/500
            </div>
          </div>

          <div className="profile-setup-actions">
            <button
              className={`skip-btn ${isFormFilled ? 'disabled' : ''}`}
              onClick={handleSkip}
              disabled={isFormFilled}
              aria-label="Skip profile setup"
            >
              Skip
            </button>
            <button
              className={`continue-btn ${!isFormFilled ? 'disabled' : ''}`}
              onClick={handleContinue}
              disabled={!isFormFilled}
              aria-label="Continue with profile setup"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetup;
