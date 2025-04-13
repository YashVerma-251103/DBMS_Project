// src/components/Navbar.js
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "1em", background: "#eee" }}>
      <Link to="/" style={{ marginRight: "1em" }}>Home</Link>
      <Link to="/flights" style={{ marginRight: "1em" }}>Search Flights</Link>
      <Link to="/staff">Staff Management</Link>
    </nav>
  );
}

export default Navbar;
