import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const page: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #e0f2ff 0%, #f0f8ff 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 520,
  padding: '40px',
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
  backgroundColor: 'rgba(255,255,255,0.97)',
  border: '1px solid #cce0ff',
  position: 'relative',
  overflow: 'hidden',
};

const accentBar: React.CSSProperties = {
  position: 'absolute',
  top: 0, left: 0, right: 0,
  height: 7,
  background: 'linear-gradient(to right, #2962ff, #00b0ff)',
  borderRadius: '12px 12px 0 0',
};

const tabsRow: React.CSSProperties = {
  display: 'flex',
  marginBottom: 28,
  borderBottom: '2px solid #b3d4ff',
};

const tabBtn = (active: boolean): React.CSSProperties => ({
  flex: 1,
  padding: '14px',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: active ? 700 : 500,
  color: active ? '#1e88e5' : '#4d79a6',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  borderBottom: active ? '3px solid #1e88e5' : '3px solid transparent',
  marginBottom: -2,
  transition: 'color 0.2s, border-color 0.2s',
  fontFamily: 'inherit',
});

const heading: React.CSSProperties = {
  color: '#0d47a1',
  marginBottom: 24,
  textAlign: 'center',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontSize: 22,
  marginTop: 0,
};

const fgRow: React.CSSProperties = {
  marginBottom: 20,
};

const label: React.CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontWeight: 500,
  color: '#375a80',
  fontSize: 14,
};

const generatedBox: React.CSSProperties = {
  marginTop: 24,
  padding: 16,
  backgroundColor: '#e3f2fd',
  borderRadius: 6,
  borderLeft: '5px solid #00aaff',
  color: '#0d47a1',
  fontSize: 14,
  animation: 'fadeIn 0.4s ease-out',
};

const LoginSignUp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loginData, setLoginData] = useState({ loginId: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "", contactNumber: "", aaddhaar_no: "", role: "", password: "", confirmPassword: "",
  });
  const [generatedLoginId, setGeneratedLoginId] = useState("");
  const navigate = useNavigate();

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setSignupData({ ...signupData, [e.target.name]: e.target.value });

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) { alert("Passwords don't match!"); return; }
    const loginId = `${signupData.contactNumber}_${signupData.role}`;
    try {
      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signupData.name, contactNumber: signupData.contactNumber, aaddhaar_no: signupData.aaddhaar_no, role: signupData.role, password: signupData.password, loginId }),
      });
      if (!response.ok) { const err = await response.json(); alert(`Registration failed: ${err.error}`); return; }
      setGeneratedLoginId(loginId);
      alert("Registration successful! Your Login ID: " + loginId);
    } catch (error) { console.error("Registration failed:", error); }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/users?loginId=${loginData.loginId}`);
      const users = await response.json();
      if (users.length > 0 && users[0].password === loginData.password) {
        localStorage.setItem("currentUser", JSON.stringify(users[0]));
        const id = loginData.loginId.toLowerCase();
        if (id.includes("admin"))    navigate("/AdminHome");
        else if (id.includes("manager"))  navigate("/ManagerHome");
        else if (id.includes("employee")) navigate("/EmployeeHome");
        else if (id.includes("customer")) navigate("/CustomerHome");
        else alert("Logged in, but role not recognized for redirection.");
      } else {
        alert("Invalid credentials!");
      }
    } catch (error) { console.error("Login failed:", error); }
  };

  return (
    <div style={page}>
      <div style={card}>
        <div style={accentBar} />

        <div style={tabsRow}>
          <button style={tabBtn(activeTab === "login")}  onClick={() => setActiveTab("login")}>Login</button>
          <button style={tabBtn(activeTab === "signup")} onClick={() => setActiveTab("signup")}>Sign Up</button>
        </div>

        {activeTab === "login" ? (
          <>
            <h2 style={heading}>Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <div style={fgRow}>
                <label style={label} htmlFor="loginId">Login ID</label>
                <input className="auth-input" id="loginId" name="loginId" type="text" value={loginData.loginId} onChange={handleLoginChange} required />
              </div>
              <div style={fgRow}>
                <label style={label} htmlFor="password">Password</label>
                <input className="auth-input" id="password" name="password" type="password" value={loginData.password} onChange={handleLoginChange} required />
              </div>
              <button type="submit" className="auth-submit">Login</button>
            </form>
          </>
        ) : (
          <>
            <h2 style={heading}>Sign Up</h2>
            <form onSubmit={handleSignupSubmit}>
              <div style={fgRow}>
                <label style={label} htmlFor="name">Full Name</label>
                <input className="auth-input" id="name" name="name" type="text" value={signupData.name} onChange={handleSignupChange} required />
              </div>
              <div style={fgRow}>
                <label style={label} htmlFor="contactNumber">Contact Number</label>
                <input className="auth-input" id="contactNumber" name="contactNumber" type="tel" value={signupData.contactNumber} onChange={handleSignupChange} required />
              </div>
              <div style={fgRow}>
                <label style={label} htmlFor="aaddhaar_no">Aadhaar Number</label>
                <input className="auth-input" id="aaddhaar_no" name="aaddhaar_no" type="text" value={signupData.aaddhaar_no} onChange={handleSignupChange} required />
              </div>
              <div style={fgRow}>
                <label style={label} htmlFor="role">Role</label>
                <select className="auth-select" id="role" name="role" value={signupData.role} onChange={handleSignupChange} required>
                  <option value="" disabled>Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <div style={fgRow}>
                <label style={label} htmlFor="password">Create Password</label>
                <input className="auth-input" id="password" name="password" type="password" value={signupData.password} onChange={handleSignupChange} required />
              </div>
              <div style={fgRow}>
                <label style={label} htmlFor="confirmPassword">Re-enter Password</label>
                <input className="auth-input" id="confirmPassword" name="confirmPassword" type="password" value={signupData.confirmPassword} onChange={handleSignupChange} required />
              </div>
              <button type="submit" className="auth-submit">Sign Up</button>
            </form>

            {generatedLoginId && (
              <div style={generatedBox}>
                <p style={{ margin: '0 0 6px' }}>Your Login ID: <strong style={{ color: '#1e88e5' }}>{generatedLoginId}</strong></p>
                <p style={{ margin: 0, opacity: 0.85 }}>Please save this for future logins.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginSignUp;
