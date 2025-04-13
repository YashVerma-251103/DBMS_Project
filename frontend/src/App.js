// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import SearchFlights from "./pages/SearchFlights";
import LoginSignUp from "./components/LoginSignUp";
import AdminHome from "./components/AdminHome";
import ManagerHome from "./components/ManagerHome";
import EmployeeHome from "./components/EmployeeHome";
import CustomerHome from "./components/CustomerHome";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          {/* <Route path="/" element={<SearchFlights />} /> */}
          <Route path="/" element={<LoginSignUp />} />
          
          {/* <Route path="/" element={<AdminHome />} /> */}

          {/* <Route path="/" element={<ManagerHome />} /> */}
          {/* <Route path="/" element={<EmployeeHome />} /> */}
          {/* <Route path="/" element={<CustomerHome />} />  */}
          <Route path="/home" element={<Home />} />
          <Route path="/flights/search" element={<SearchFlights />} />
          <Route path="/LoginSignup" element={<LoginSignUp />} />
          <Route path="/AdminHome" element={<AdminHome />} />
          <Route path="/ManagerHome" element={<ManagerHome />} />
          <Route path="/EmployeeHome" element={<EmployeeHome />} />
          <Route path="/CustomerHome" element={<CustomerHome />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
