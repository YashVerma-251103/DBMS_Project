// // import logo from './logo.svg';
// // import './App.css';

// // function App() {
// //   return (
// //     <div className="App">
// //       <header className="App-header">
// //         <img src={logo} className="App-logo" alt="logo" />
// //         <p>
// //           Edit <code>src/App.js</code> and save to reload.
// //         </p>
// //         <a
// //           className="App-link"
// //           href="https://reactjs.org"
// //           target="_blank"
// //           rel="noopener noreferrer"
// //         >
// //           Learn React
// //         </a>
// //       </header>
// //     </div>
// //   );
// // }

// // export default App;



// // src/App.js
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Home from "./pages/Home";
// import SearchFlights from "./pages/SearchFlights";
// import StaffManagement from "./pages/StaffManagement";

// function App() {
//   return (
//     <Router>
//       <Navbar />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/flights" element={<SearchFlights />} />
//         <Route path="/staff" element={<StaffManagement />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;




// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import SearchFlights from './pages/SearchFlights';
import LoginSignUp from "./components/LoginSignUp";
import AdminHome from "./components/AdminHome";
import ManagerHome from "./components/ManagerHome";
import EmployeeHome from "./components/EmployeeHome";
import CustomerHome from "./components/CustomerHome";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <Link to="/">Home</Link> |{' '}
          <Link to="/flights/search">Search Flights</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
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
