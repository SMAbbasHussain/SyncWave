import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileSetup.css"; // Reuse same styles

function TestProfileSetup() {
  const [testPic, setTestPic] = useState(null);
  const [testBio, setTestBio] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("TestProfileSetup rendered");
  }, []);

  const handleTestImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTestPic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestContinue = async () => {
    console.log("Test Continue clicked");

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to test profile setup.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio: testBio, profilePic: testPic }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Test profile updated. Navigating to /home");
        navigate("/home");
      } else {
        alert(data.error || "Test profile update failed.");
      }
    } catch (error) {
      console.error("Test profile error:", error);
      alert("An error occurred while updating test profile.");
    }
  };

  const handleTestSkip = () => {
    console.log("Test Skip clicked");
    navigate("/home");
  };

  return (
    <div className="container profile-setup-container">
      <h2 className="profile-setup-head-text">Test Profile Setup</h2>

      <div className="setup-profile-pic-container">
        <div className="setup-profile-pic-circle">
          <img
            src={testPic || "/PFP2.png"}
            alt="Test Profile"
            className="setup-profile-pic"
          />
          <label htmlFor="test-profile-pic-upload" className="setup-profile-pic-edit-label">
            Edit Test
          </label>
          <input
            type="file"
            id="test-profile-pic-upload"
            accept="image/*"
            onChange={handleTestImageChange}
            className="setup-profile-pic-upload"
          />
        </div>
      </div>

      <div className="bio-input-container">
        <textarea
          value={testBio}
          onChange={(e) => setTestBio(e.target.value)}
          placeholder="Test bio (optional)"
          rows="4"
        />
      </div>

      <div className="profile-setup-actions">
        <button className="skip-btn" onClick={handleTestSkip}>
          Test Skip
        </button>
        <button className="continue-btn" onClick={handleTestContinue}>
          Test Continue
        </button>
      </div>
    </div>
  );
}

export default TestProfileSetup;
