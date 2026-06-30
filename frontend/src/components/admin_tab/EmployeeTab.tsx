import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Employee } from "../../types";

const API = "http://localhost:5000";

const emptyEmployee = { employee_id: 0, name: "", role: "Staff", shift_timings: "" };

const EmployeeTab: React.FC = () => {
  const [searchParams, setSearchParams] = useState({ employee_id: "", name: "", role: "", shift_timings: "" });
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<any>({ ...emptyEmployee });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = !!currentEmployee;
    const url = isUpdate ? `${API}/employees/update` : `${API}/employees/insert`;
    const method = isUpdate ? "PUT" : "POST";
    const params = new URLSearchParams(formData).toString();
    try {
      const res = await fetch(`${url}?${params}`, { method });
      if (res.ok) {
        alert(`Employee ${isUpdate ? "updated" : "created"} successfully!`);
        fetchData(); setEditMode(false); setCurrentEmployee(null);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Unknown error"}`);
      }
    } catch { alert("Failed to process employee action."); }
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
        <thead><tr><th>Select</th><th>ID</th><th>Name</th><th>Role</th><th>Shift Timings</th><th>Actions</th></tr></thead>
        <tbody>
          {employees.map((emp, i) => (
            <tr key={i} className={currentEmployee?.employee_id === emp.employee_id ? "selected-row" : ""} onClick={() => setCurrentEmployee(emp)}>
              <td><input type="radio" name="selectedEmployee" checked={currentEmployee?.employee_id === emp.employee_id} onChange={() => setCurrentEmployee(emp)} /></td>
              <td>{emp.employee_id}</td><td>{emp.name}</td><td>{emp.role}</td><td>{emp.shift_timings}</td>
              <td className="actions-cell">
                <button onClick={(e) => { e.stopPropagation(); setEditMode(true); setCurrentEmployee(emp); setFormData({ ...emp }); }} className="btn-edit"><FaEdit /></button>
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
          <button onClick={() => { if (currentEmployee) { setEditMode(true); setFormData({ ...currentEmployee }); } }} className="btn-update" disabled={!currentEmployee}><FaEdit /> Update Selected</button>
          <button onClick={() => { setEditMode(true); setCurrentEmployee(null); setFormData({ ...emptyEmployee }); }} className="btn-primary"><FaPlus /> Add Employee</button>
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
              {["Manager","Staff","Technician","Cleaner","Security","Authority"].map(r => <option key={r} value={r}>{r}</option>)}
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
                  {["Manager","Staff","Technician","Cleaner","Security","Authority"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Shift Timings</label><input type="text" value={formData.shift_timings} onChange={(e) => setFormData({ ...formData, shift_timings: e.target.value })} placeholder="e.g., 9AM-5PM" /></div>
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
