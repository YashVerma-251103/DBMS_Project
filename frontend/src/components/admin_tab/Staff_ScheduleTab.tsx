import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { StaffSchedule } from "../../types";
import API from "../../api";

const StaffScheduleTab: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    schedule_id: "", employee_id: "", facility_id: "",
    shift_date: "", shift_start: "", shift_end: "", task_description: "",
  });
  const [searchResults, setSearchResults] = useState<StaffSchedule[]>([]);
  const [data, setData] = useState<StaffSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<StaffSchedule | null>(null);
  const [formData, setFormData] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    try { const res = await fetch(`${API}/staff_schedule/search`); setData(await res.json()); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); setSearchError("");
    const filtered = Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== ""));
    try { const res = await axios.get(`${API}/staff_schedule/search`, { params: filtered }); setSearchResults(res.data); setShowSearchResults(true); }
    catch { setSearchError("Error fetching schedule data."); setShowSearchResults(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = !!currentSchedule;
    const url = isUpdate ? `${API}/staff_schedule/update` : `${API}/staff_schedule/insert`;
    const method = isUpdate ? "PUT" : "POST";
    const params = new URLSearchParams(formData).toString();
    try {
      const res = await fetch(`${url}?${params}`, { method });
      if (res.ok) { alert(`Schedule ${isUpdate ? "updated" : "created"}!`); fetchData(); setEditMode(false); setCurrentSchedule(null); }
      else { const err = await res.json(); alert(`Error: ${err.error}`); }
    } catch { alert("Failed."); }
  };

  const handleDelete = async (s: StaffSchedule) => {
    if (!window.confirm("Delete this schedule?")) return;
    await fetch(`${API}/staff_schedule/delete?schedule_id=${s.schedule_id}`, { method: "DELETE" });
    fetchData();
  };

  const renderTable = (schedules: StaffSchedule[]) => (
    <div className="table-responsive">
      <table>
        <thead><tr><th>Select</th><th>ID</th><th>Employee ID</th><th>Facility ID</th><th>Date</th><th>Start</th><th>End</th><th>Task</th><th>Created At</th><th>Actions</th></tr></thead>
        <tbody>
          {schedules.map((s, i) => (
            <tr key={i} className={currentSchedule?.schedule_id === s.schedule_id ? "selected-row" : ""} onClick={() => setCurrentSchedule(s)}>
              <td><input type="radio" name="selectedSchedule" checked={currentSchedule?.schedule_id === s.schedule_id} onChange={() => setCurrentSchedule(s)} /></td>
              <td>{s.schedule_id}</td><td>{s.employee_id}</td><td>{s.facility_id}</td>
              <td>{s.shift_date}</td><td>{s.shift_start}</td><td>{s.shift_end}</td>
              <td>{s.task_description}</td><td>{s.created_at}</td>
              <td className="actions-cell">
                <button onClick={(e) => { e.stopPropagation(); setEditMode(true); setCurrentSchedule(s); setFormData({ ...s }); }} className="btn-edit"><FaEdit /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(s); }} className="btn-delete"><FaTrash /></button>
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
        <h3>STAFF SCHEDULE MANAGEMENT</h3>
        <div className="action-buttons">
          <button onClick={() => { if (currentSchedule) { setEditMode(true); setFormData({ ...currentSchedule }); } }} className="btn-update" disabled={!currentSchedule}><FaEdit /> Update Selected</button>
          <button onClick={() => { setEditMode(true); setCurrentSchedule(null); setFormData({ employee_id: "", facility_id: "", shift_date: "", shift_start: "", shift_end: "", task_description: "" }); }} className="btn-primary"><FaPlus /> Add Schedule</button>
        </div>
      </div>

      <div className="search-schedules-container">
        <h4>Search Schedules</h4>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group"><label>Schedule ID:</label><input type="text" value={searchParams.schedule_id} onChange={(e) => setSearchParams({ ...searchParams, schedule_id: e.target.value })} /></div>
          <div className="form-group"><label>Employee ID:</label><input type="text" value={searchParams.employee_id} onChange={(e) => setSearchParams({ ...searchParams, employee_id: e.target.value })} /></div>
          <div className="form-group"><label>Facility ID:</label><input type="text" value={searchParams.facility_id} onChange={(e) => setSearchParams({ ...searchParams, facility_id: e.target.value })} /></div>
          <div className="form-group"><label>Shift Date:</label><input type="date" value={searchParams.shift_date} onChange={(e) => setSearchParams({ ...searchParams, shift_date: e.target.value })} /></div>
          <div className="form-group"><label>Task Description:</label><input type="text" value={searchParams.task_description} onChange={(e) => setSearchParams({ ...searchParams, task_description: e.target.value })} /></div>
          <div className="form-group">
            <button type="submit" className="btn-primary">Search</button>
            {showSearchResults && <button type="button" onClick={() => setShowSearchResults(false)} className="btn-secondary">Show All</button>}
          </div>
        </form>
        {searchError && <p className="error-message">{searchError}</p>}
      </div>

      {showSearchResults ? (
        <>{<h4>Results:</h4>}{searchResults.length > 0 ? renderTable(searchResults) : <p>No schedules found.</p>}</>
      ) : loading ? (
        <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>
      ) : data.length > 0 ? renderTable(data) : <p>No schedules available.</p>}

      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentSchedule ? "Edit Schedule" : "Create Schedule"}</h2>
            <form onSubmit={handleSubmit}>
              {currentSchedule && <div className="form-group"><label>Schedule ID</label><input type="text" value={formData.schedule_id} disabled /></div>}
              <div className="form-group"><label>Employee ID</label><input type="number" value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} required /></div>
              <div className="form-group"><label>Facility ID</label><input type="number" value={formData.facility_id} onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })} required /></div>
              <div className="form-group"><label>Shift Date</label><input type="date" value={formData.shift_date} onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })} required /></div>
              <div className="form-group"><label>Shift Start Time</label><input type="time" value={formData.shift_start} onChange={(e) => setFormData({ ...formData, shift_start: e.target.value })} required /></div>
              <div className="form-group"><label>Shift End Time</label><input type="time" value={formData.shift_end} onChange={(e) => setFormData({ ...formData, shift_end: e.target.value })} required /></div>
              <div className="form-group"><label>Task Description</label><textarea value={formData.task_description} onChange={(e) => setFormData({ ...formData, task_description: e.target.value })} /></div>
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

export default StaffScheduleTab;
