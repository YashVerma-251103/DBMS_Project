import React, { useState, useEffect } from "react";
import { User } from "../../types";

const API = "http://localhost:5000";

const Profile: React.FC = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const loginId = currentUser?.loginId || "";
  const [profileData, setProfileData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);

  const fetchProfileData = async () => {
    if (!loginId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/users?loginId=${loginId}`);
      const data = await res.json();
      if (data && data.length > 0) setProfileData(data[0]);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProfileData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/users?loginId=${loginId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (res.ok) { alert("Profile updated successfully."); fetchProfileData(); }
      else console.error("Error updating profile. Status:", res.status);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading profile data...</p></div>;

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={profileData.name || ''} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Contact Number</label>
          <input type="text" name="contactNumber" value={(profileData as any).contactNumber || ''} onChange={(e) => setProfileData({ ...profileData, contactNumber: e.target.value } as any)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={profileData.password || ''} onChange={(e) => setProfileData({ ...profileData, password: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Login ID</label>
          <input type="text" name="loginId" value={profileData.loginId || ''} readOnly />
        </div>
        <div className="form-group">
          <label>Role</label>
          <input type="text" name="role" value={profileData.role || ''} readOnly />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
