import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
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
          {/* Login/Signup is a modal Landing renders over itself, not a separate page —
              this route exists so /login stays linkable (RequireAuth redirects here),
              and Landing auto-opens the modal when it detects this exact path. */}
          <Route path="/login" element={<Landing />} />
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
