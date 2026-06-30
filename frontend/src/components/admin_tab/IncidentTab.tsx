import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Incident } from "../../types";

const API = "http://localhost:5000";
const STATUSES = ["Reported","In Progress","Resolved"];

const IncidentTab: React.FC = () => {
  const [searchParams, setSearchParams] = useState({ incident_id: "", facility_id: "", reported_by: "", status: "" });
  const [searchResults, setSearchResults] = useState<Incident[]>([]);
  const [data, setData] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const [formData, setFormData] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    try { const res = await fetch(`${API}/incidents/search`); setData(await res.json()); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); setSearchError("");
    const filtered = Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== ""));
    try { const res = await axios.get(`${API}/incidents/search`, { params: filtered }); setSearchResults(res.data); setShowSearchResults(true); }
    catch { setSearchError("Error fetching incident data."); setShowSearchResults(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = !!currentIncident;
    const url = isUpdate ? `${API}/incidents/update` : `${API}/incidents/insert`;
    const method = isUpdate ? "PUT" : "POST";
    const params = new URLSearchParams(formData).toString();
    try {
      const res = await fetch(`${url}?${params}`, { method });
      if (res.ok) { alert(`Incident ${isUpdate ? "updated" : "created"}!`); fetchData(); setEditMode(false); setCurrentIncident(null); }
      else { const err = await res.json(); alert(`Error: ${err.error}`); }
    } catch { alert("Failed."); }
  };

  const handleDelete = async (inc: Incident) => {
    if (!window.confirm("Delete this incident?")) return;
    await fetch(`${API}/incidents/delete?incident_id=${inc.incident_id}`, { method: "DELETE" });
    fetchData();
  };

  const renderTable = (incidents: Incident[]) => (
    <div className="table-responsive">
      <table>
        <thead><tr><th>Select</th><th>ID</th><th>Facility ID</th><th>Reported By</th><th>Description</th><th>Status</th><th>Reported At</th><th>Resolved At</th><th>Actions</th></tr></thead>
        <tbody>
          {incidents.map((inc, i) => (
            <tr key={i} className={currentIncident?.incident_id === inc.incident_id ? "selected-row" : ""} onClick={() => setCurrentIncident(inc)}>
              <td><input type="radio" name="selectedIncident" checked={currentIncident?.incident_id === inc.incident_id} onChange={() => setCurrentIncident(inc)} /></td>
              <td>{inc.incident_id}</td><td>{inc.facility_id}</td><td>{inc.reported_by}</td>
              <td className="description-cell">{inc.description}</td><td>{inc.status}</td>
              <td>{new Date(inc.reported_at).toLocaleString()}</td>
              <td>{inc.resolved_at ? new Date(inc.resolved_at).toLocaleString() : "N/A"}</td>
              <td className="actions-cell">
                <button onClick={(e) => { e.stopPropagation(); setEditMode(true); setCurrentIncident(inc); setFormData({ ...inc, reported_at: inc.reported_at?.slice(0,16), resolved_at: inc.resolved_at?.slice(0,16) ?? "" }); }} className="btn-edit"><FaEdit /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(inc); }} className="btn-delete"><FaTrash /></button>
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
        <h3>INCIDENT MANAGEMENT</h3>
        <div className="action-buttons">
          <button onClick={() => { if (currentIncident) { setEditMode(true); setFormData({ ...currentIncident, reported_at: currentIncident.reported_at?.slice(0,16), resolved_at: currentIncident.resolved_at?.slice(0,16) ?? "" }); } }} className="btn-update" disabled={!currentIncident}><FaEdit /> Update Selected</button>
          <button onClick={() => { setEditMode(true); setCurrentIncident(null); setFormData({ facility_id: "", reported_by: "", description: "", status: "Reported", reported_at: new Date().toISOString().slice(0,16), resolved_at: "" }); }} className="btn-primary"><FaPlus /> Add Incident</button>
        </div>
      </div>

      <div className="search-incidents-container">
        <h4>Search Incidents</h4>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group"><label>Incident ID:</label><input type="text" value={searchParams.incident_id} onChange={(e) => setSearchParams({ ...searchParams, incident_id: e.target.value })} /></div>
          <div className="form-group"><label>Facility ID:</label><input type="text" value={searchParams.facility_id} onChange={(e) => setSearchParams({ ...searchParams, facility_id: e.target.value })} /></div>
          <div className="form-group"><label>Reported By (Employee ID):</label><input type="text" value={searchParams.reported_by} onChange={(e) => setSearchParams({ ...searchParams, reported_by: e.target.value })} /></div>
          <div className="form-group">
            <label>Status:</label>
            <select value={searchParams.status} onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}>
              <option value="">--Select--</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <button type="submit" className="btn-primary">Search</button>
            {showSearchResults && <button type="button" onClick={() => setShowSearchResults(false)} className="btn-secondary">Show All</button>}
          </div>
        </form>
        {searchError && <p className="error-message">{searchError}</p>}
      </div>

      {showSearchResults ? (
        <>{<h4>Results:</h4>}{searchResults.length > 0 ? renderTable(searchResults) : <p>No incidents found.</p>}</>
      ) : loading ? (
        <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>
      ) : data.length > 0 ? renderTable(data) : <p>No incidents available.</p>}

      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentIncident ? "Edit Incident" : "Create Incident"}</h2>
            <form onSubmit={handleSubmit}>
              {currentIncident && <div className="form-group"><label>Incident ID</label><input type="text" value={formData.incident_id} disabled /></div>}
              <div className="form-group"><label>Facility ID</label><input type="text" value={formData.facility_id} onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })} required /></div>
              <div className="form-group"><label>Reported By (Employee ID)</label><input type="text" value={formData.reported_by} onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })} required /></div>
              <div className="form-group"><label>Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required /></div>
              <div className="form-group"><label>Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} required>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="form-group"><label>Reported At</label><input type="datetime-local" value={formData.reported_at} onChange={(e) => setFormData({ ...formData, reported_at: e.target.value })} required /></div>
              <div className="form-group"><label>Resolved At</label><input type="datetime-local" value={formData.resolved_at} onChange={(e) => setFormData({ ...formData, resolved_at: e.target.value })} disabled={formData.status !== "Resolved"} /></div>
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

export default IncidentTab;
