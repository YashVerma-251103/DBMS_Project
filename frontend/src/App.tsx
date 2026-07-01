import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import LoginSignUp from "./components/LoginSignUp";
import AdminHome from "./components/AdminHome";
import ManagerHome from "./components/ManagerHome";
import EmployeeHome from "./components/EmployeeHome";
import RequireAuth from "./components/RequireAuth";
import Profile from "./components/customer_tab/Profile";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginSignUp />} />
          <Route path="/profile" element={<RequireAuth role="customer"><Profile /></RequireAuth>} />
          <Route path="/AdminHome" element={<RequireAuth role="admin"><AdminHome /></RequireAuth>} />
          <Route path="/ManagerHome" element={<RequireAuth role="manager"><ManagerHome /></RequireAuth>} />
          <Route path="/EmployeeHome" element={<RequireAuth role="employee"><EmployeeHome /></RequireAuth>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
