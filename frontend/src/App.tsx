import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SearchFlights from "./pages/SearchFlights";
import LoginSignUp from "./components/LoginSignUp";
import AdminHome from "./components/AdminHome";
import ManagerHome from "./components/ManagerHome";
import EmployeeHome from "./components/EmployeeHome";
import CustomerHome from "./components/CustomerHome";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LoginSignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/flights/search" element={<SearchFlights />} />
          <Route path="/LoginSignup" element={<LoginSignUp />} />
          <Route path="/login" element={<LoginSignUp />} />
          <Route path="/AdminHome" element={<RequireAuth role="admin"><AdminHome /></RequireAuth>} />
          <Route path="/ManagerHome" element={<RequireAuth role="manager"><ManagerHome /></RequireAuth>} />
          <Route path="/EmployeeHome" element={<RequireAuth role="employee"><EmployeeHome /></RequireAuth>} />
          <Route path="/CustomerHome" element={<RequireAuth role="customer"><CustomerHome /></RequireAuth>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
