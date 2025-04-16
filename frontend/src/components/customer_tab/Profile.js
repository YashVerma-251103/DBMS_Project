import React, { useState, useEffect } from "react";

const Profile = () => {
  // In a real app, obtain the loginId from your authentication context or similar
  const loginId = "login123";
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch user profile via the GET route defined in your user_routes.py. // Note that the GET endpoint returns an array.
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/users?loginId=${loginId}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setProfileData(data[0]);
      } else {
        setProfileData({});
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  // Handle form input changes.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updated profile data.
  // This sends a PUT request to the same /users endpoint with loginId as a query parameter.
  // (Your user_routes.py does not currently support this operation, so be sure to add a PUT handler on your back end.)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/users?loginId=${loginId}`,
        {
          method: "PUT", // Make sure your backend supports PUT for updates.
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profileData),
        }
      );
      if (response.ok) {
        alert("Profile updated successfully.");
        fetchProfileData();
      } else {
        console.error(
          "Error updating profile. Response status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error during profile update:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={profileData.name || ''}
            onChange={handleInputChange}
          />
        </div>
        {/* Contact Number */}
        <div className="form-group">
          <label>Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={profileData.contactNumber || ''}
            onChange={handleInputChange}
          />
        </div>
        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={profileData.password || ''}
            onChange={handleInputChange}
          />
        </div>
        {/* Login ID (read-only) */}
        <div className="form-group">
          <label>Login ID</label>
          <input
            type="text"
            name="loginId"
            value={profileData.loginId || ''}
            readOnly
          />
        </div>
        {/* Role (read-only) */}
        <div className="form-group">
          <label>Role</label>
          <input
            type="text"
            name="role"
            value={profileData.role || ''}
            readOnly
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
