import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(13,27,42,0.55)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  zIndex: 2000,
};

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 520,
  padding: '40px',
  borderRadius: 18,
  boxShadow: '0 16px 48px rgba(13,27,42,0.32)',
  backgroundColor: '#fff',
  position: 'relative',
  overflow: 'hidden',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const accentBar: React.CSSProperties = {
  position: 'absolute',
  top: 0, left: 0, right: 0,
  height: 5,
  background: 'linear-gradient(135deg, #1e88e5, #42a5f5)',
};

const closeBtn: React.CSSProperties = {
  position: 'absolute',
  top: 16, right: 16,
  background: 'rgba(13,27,42,0.06)',
  border: 'none',
  borderRadius: '50%',
  width: 32, height: 32,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  color: '#4a5d7e',
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
  borderRadius: 8,
  borderLeft: '5px solid #1e88e5',
  color: '#0d47a1',
  fontSize: 14,
  animation: 'fadeIn 0.4s ease-out',
};

interface LoggedInUser { name: string; role: string; [key: string]: unknown; }

interface Props {
  initialTab?: "login" | "signup";
  onClose: () => void;
  onLoginSuccess: (user: LoggedInUser) => void;
}

// Renders as an overlay modal on top of Landing, not a separate page — logging in should
// feel like unlocking the page you're already on, not a trip somewhere else and back.
const LoginSignUp: React.FC<Props> = ({ initialTab = "login", onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
  const [loginData, setLoginData] = useState({ loginId: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "", contactNumber: "", age: "", sex: "", nationality: "", password: "", confirmPassword: "",
  });
  const [generatedLoginId, setGeneratedLoginId] = useState("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setSignupData({ ...signupData, [e.target.name]: e.target.value });

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) { alert("Passwords don't match!"); return; }
    const loginId = `${signupData.contactNumber}_customer`;
    try {
      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupData.name,
          contactNumber: signupData.contactNumber,
          age: Number(signupData.age),
          sex: signupData.sex,
          nationality: signupData.nationality,
          password: signupData.password,
          loginId,
        }),
      });
      if (!response.ok) { const err = await response.json(); alert(`Registration failed: ${err.error}`); return; }
      setGeneratedLoginId(loginId);
      // Straight into the login tab, pre-filled — the point of showing the generated ID
      // is so they can use it immediately, not copy it down for later.
      setLoginData({ loginId, password: "" });
      setActiveTab("login");
    } catch (error) { console.error("Registration failed:", error); }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId: loginData.loginId, password: loginData.password }),
      });
      if (!response.ok) { alert("Invalid credentials!"); return; }
      const user = await response.json();
      localStorage.setItem("currentUser", JSON.stringify(user));
      onLoginSuccess(user);
    } catch (error) { console.error("Login failed:", error); }
  };

  return (
    <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={card}>
        <div style={accentBar} />
        <button style={closeBtn} onClick={onClose} aria-label="Close">
          <FaTimes size={14} />
        </button>

        <div style={tabsRow}>
          <button style={tabBtn(activeTab === "login")}  onClick={() => setActiveTab("login")}>Login</button>
          <button style={tabBtn(activeTab === "signup")} onClick={() => setActiveTab("signup")}>Sign Up</button>
        </div>

        {activeTab === "login" ? (
          <>
            <h2 style={heading}>Login</h2>
            {generatedLoginId && (
              <div style={generatedBox}>
                <p style={{ margin: 0 }}>Account created! Your Login ID <strong style={{ color: '#1e88e5' }}>{generatedLoginId}</strong> is filled in below — just add your password.</p>
              </div>
            )}
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
                <label style={label} htmlFor="age">Age</label>
                <input className="auth-input" id="age" name="age" type="number" min={0} value={signupData.age} onChange={handleSignupChange} required />
              </div>
              <div style={fgRow}>
                <label style={label} htmlFor="sex">Sex</label>
                <select className="auth-select" id="sex" name="sex" value={signupData.sex} onChange={handleSignupChange} required>
                  <option value="" disabled>Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={fgRow}>
                <label style={label} htmlFor="nationality">Nationality</label>
                <input className="auth-input" id="nationality" name="nationality" type="text" value={signupData.nationality} onChange={handleSignupChange} required />
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
          </>
        )}
      </div>
    </div>
  );
};

export default LoginSignUp;
