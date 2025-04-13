import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./LoginSignUp.css"; 

// ok

const LoginSignUp = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({
    loginId: "",
    password: "",
  });
  const [signupData, setSignupData] = useState({
    name: "",
    contactNumber: "",
    role: "user",
    password: "",
    confirmPassword: "",
  });
  const [generatedLoginId, setGeneratedLoginId] = useState("");

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value,
    });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    const loginId = `${signupData.contactNumber}_${signupData.role}`;
    const userData = {
      name: signupData.name,
      contactNumber: signupData.contactNumber,
      role: signupData.role,
      password: signupData.password, // Hash this in production
      loginId: loginId
    };
  
    try {
      const response = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      setGeneratedLoginId(loginId);
      alert('Registration successful!');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/users?loginId=${loginData.loginId}`);
      const users = await response.json();
  
      if (users.length > 0 && users[0].password === loginData.password) {
        alert('Login successful!');
        
        if (loginData.loginId.includes("admin")) {
          navigate("/AdminHome"); // redirect to AdminHome route
        } else if (loginData.loginId.includes("manager")) {
          navigate("/ManagerHome"); // redirect to ManagerHome route
        }
        else if (loginData.loginId.includes("employee")) {
          navigate("/EmployeeHome"); // redirect to EmployeeHome route 
        }
        else if (loginData.loginId.includes("customer")) {
          navigate("/CustomerHome"); // redirect to CustomerHome route
        }
         else {
          alert("Logged in, but role not recognized for redirection.");
        }
      } else {
        alert('Invalid credentials!');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  

  return (
    <div className="login-signup-container">
      <div className="tabs">
        <button
          className={`tab ${activeTab === "login" ? "active" : ""}`}
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>
        <button
          className={`tab ${activeTab === "signup" ? "active" : ""}`}
          onClick={() => setActiveTab("signup")}
        >
          Sign Up
        </button>
      </div>

      {activeTab === "login" ? (
        <div className="login-form">
          <h2>Login</h2>
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="loginId">Login ID</label>
              <input
                type="text"
                id="loginId"
                name="loginId"
                value={loginData.loginId}
                onChange={handleLoginChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>
            <button type="submit" className="submit-btn">
              Login
            </button>
          </form>
        </div>
      ) : (
        <div className="signup-form">
          <h2>Sign Up</h2>
          <form onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={signupData.name}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={signupData.contactNumber}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={signupData.role}
                onChange={handleSignupChange}
                required
              >
                
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="Employee">Employee</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="password">Create Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={signupData.password}
                onChange={handleSignupChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Re-enter Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                required
              />
            </div>
            <button type="submit" className="submit-btn">
              Sign Up
            </button>
          </form>
          
          {generatedLoginId && (
            <div className="generated-login-id">
              <p>Your Login ID: <strong>{generatedLoginId}</strong></p>
              <p>Please save this for future logins.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginSignUp;