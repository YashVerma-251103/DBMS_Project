import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Employee, EMPLOYEE_ROLES, DEPARTMENTS } from "../../types";

const API = "http://localhost:5000";

const emptyEmployee = {
  employee_id: 0, name: "", role: EMPLOYEE_ROLES[0], department: DEPARTMENTS[0], shift_timings: "",
  contact_number: "", initial_password: "",
};

const EmployeeTab: React.FC = () => {
  const [searchParams, setSearchParams] = useState({ employee_id: "", name: "", role: "", department: "", shift_timings: "" });
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<any>({ ...emptyEmployee });
  const [adminPassword, setAdminPassword] = useState("");

  const currentAdminLoginId: string = (() => {
    try { return JSON.parse(localStorage.getItem("currentUser") || "null")?.loginId || ""; }
    catch { return ""; }
  })();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/employees/search`);
      setData(await res.json());
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    const filtered = Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== ""));
    try {
      const res = await axios.get(`${API}/employees/search`, { params: filtered });
      setSearchResults(res.data);
      setShowSearchResults(true);
    } catch {
      setSearchError("Error fetching employee data.");
      setShowSearchResults(false);
    }
  };

  // Creating a new employee provisions their login credentials too (POST /users/provision-staff,
  // a JSON-body route unlike the rest of this file's query-string ones — it carries passwords,
  // which don't belong in a URL). Editing an existing employee's basic fields stays on the
  // plain query-string /employees/update; it isn't re-provisioning anyone's login.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentEmployee) {
      const params = new URLSearchParams({
        employee_id: String(formData.employee_id), name: formData.name, role: formData.role,
        department: formData.department, shift_timings: formData.shift_timings,
      }).toString();
      try {
        const res = await fetch(`${API}/employees/update?${params}`, { method: "PUT" });
        if (res.ok) {
          alert("Employee updated successfully!");
          fetchData(); setEditMode(false); setCurrentEmployee(null);
        } else {
          const err = await res.json();
          alert(`Error: ${err.error || "Unknown error"}`);
        }
      } catch { alert("Failed to update employee."); }
      return;
    }

    try {
      const res = await fetch(`${API}/users/provision-staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name, contactNumber: formData.contact_number, role: formData.role,
          department: formData.department, shiftTimings: formData.shift_timings,
          password: formData.initial_password,
          adminLoginId: currentAdminLoginId, adminPassword,
        }),
      });
      const body = await res.json();
      if (res.ok) {
        alert(`Employee created! Login ID: ${body.loginId}`);
        fetchData(); setEditMode(false); setCurrentEmployee(null); setAdminPassword("");
      } else {
        alert(`Error: ${body.error || "Unknown error"}`);
      }
    } catch { alert("Failed to provision employee."); }
  };

  const handleDelete = async (emp: Employee) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await fetch(`${API}/employees/delete?employee_id=${emp.employee_id}`, { method: "DELETE" });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const renderTable = (employees: Employee[]) => (
    <div className="table-responsive">
      <table>
        <thead><tr><th>Select</th><th>ID</th><th>Name</th><th>Role</th><th>Department</th><th>Shift Timings</th><th>Actions</th></tr></thead>
        <tbody>
          {employees.map((emp, i) => (
            <tr key={i} className={currentEmployee?.employee_id === emp.employee_id ? "selected-row" : ""} onClick={() => setCurrentEmployee(emp)}>
              <td><input type="radio" name="selectedEmployee" checked={currentEmployee?.employee_id === emp.employee_id} onChange={() => setCurrentEmployee(emp)} /></td>
              <td>{emp.employee_id}</td><td>{emp.name}</td><td>{emp.role}</td><td>{emp.department}</td><td>{emp.shift_timings}</td>
              <td className="actions-cell">
                <button onClick={(e) => { e.stopPropagation(); setEditMode(true); setCurrentEmployee(emp); setFormData({ ...emptyEmployee, ...emp }); }} className="btn-edit"><FaEdit /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(emp); }} className="btn-delete"><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding: "1rem" }}>
      <div className="table-header">
        <h3>EMPLOYEE MANAGEMENT</h3>
        <div className="action-buttons">
          <button onClick={() => { if (currentEmployee) { setEditMode(true); setFormData({ ...emptyEmployee, ...currentEmployee }); } }} className="btn-update" disabled={!currentEmployee}><FaEdit /> Update Selected</button>
          <button onClick={() => { setEditMode(true); setCurrentEmployee(null); setFormData({ ...emptyEmployee }); setAdminPassword(""); }} className="btn-primary"><FaPlus /> Add Employee</button>
        </div>
      </div>

      <div className="search-employees-container">
        <h4>Search Employees</h4>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group"><label>Employee ID:</label><input type="text" value={searchParams.employee_id} onChange={(e) => setSearchParams({ ...searchParams, employee_id: e.target.value })} placeholder="e.g., 1001" /></div>
          <div className="form-group"><label>Name:</label><input type="text" value={searchParams.name} onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })} /></div>
          <div className="form-group">
            <label>Role:</label>
            <select value={searchParams.role} onChange={(e) => setSearchParams({ ...searchParams, role: e.target.value })}>
              <option value="">--Select--</option>
              {EMPLOYEE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Department:</label>
            <select value={searchParams.department} onChange={(e) => setSearchParams({ ...searchParams, department: e.target.value })}>
              <option value="">--Select--</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Shift Timings:</label><input type="text" value={searchParams.shift_timings} onChange={(e) => setSearchParams({ ...searchParams, shift_timings: e.target.value })} /></div>
          <div className="form-group">
            <button type="submit" className="btn-primary">Search</button>
            {showSearchResults && <button type="button" onClick={() => setShowSearchResults(false)} className="btn-secondary">Show All</button>}
          </div>
        </form>
        {searchError && <p className="error-message">{searchError}</p>}
      </div>

      {showSearchResults ? (
        <>{<h4>Search Results:</h4>}{searchResults.length > 0 ? renderTable(searchResults) : <p>No employees found.</p>}</>
      ) : loading ? (
        <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>
      ) : data.length > 0 ? renderTable(data) : <p>No employees available.</p>}

      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentEmployee ? "Edit Employee" : "Create Employee"}</h2>
            <form onSubmit={handleSubmit}>
              {currentEmployee && <div className="form-group"><label>Employee ID</label><input type="text" value={formData.employee_id} disabled /></div>}
              <div className="form-group"><label>Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div className="form-group">
                <label>Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required>
                  {EMPLOYEE_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Shift Timings</label><input type="text" value={formData.shift_timings} onChange={(e) => setFormData({ ...formData, shift_timings: e.target.value })} placeholder="e.g., 9AM-5PM" /></div>

              {!currentEmployee && (
                <>
                  <div className="form-group"><label>Contact Number</label><input type="text" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} required /></div>
                  <div className="form-group"><label>Initial Password</label><input type="password" value={formData.initial_password} onChange={(e) => setFormData({ ...formData, initial_password: e.target.value })} required /></div>
                  <hr />
                  <p style={{ fontSize: "0.85rem", color: "#666" }}>Confirm your admin credentials to provision this login:</p>
                  <div className="form-group"><label>Your Admin Login ID</label><input type="text" value={currentAdminLoginId} disabled /></div>
                  <div className="form-group"><label>Your Admin Password</label><input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required /></div>
                </>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTab;
