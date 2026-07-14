import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Facility } from "../../types";
import API from "../../api";

const TYPES = ["Gym","Lounge","Restaurant","Shop","Other"];
const emptyFacility = { facility_id: 0, name: "", type: "Gym", location: "", contact_no: "", opening_hours: "", manager_id: 0 };

const FacilityTab: React.FC = () => {
  const [searchParams, setSearchParams] = useState({ facility_id: "", name: "", type: "", location: "", manager_id: "" });
  const [searchResults, setSearchResults] = useState<Facility[]>([]);
  const [data, setData] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFacility, setCurrentFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState<any>({ ...emptyFacility });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/facilities/search`);
      setData(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    const filtered = Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== ""));
    try {
      const res = await axios.get(`${API}/facilities/search`, { params: filtered });
      setSearchResults(res.data); setShowSearchResults(true);
    } catch { setSearchError("Error fetching facility data."); setShowSearchResults(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = !!currentFacility;
    const url = isUpdate ? `${API}/facilities/update` : `${API}/facilities/insert`;
    const method = isUpdate ? "PUT" : "POST";
    const params = new URLSearchParams(formData).toString();
    try {
      const res = await fetch(`${url}?${params}`, { method });
      if (res.ok) { alert(`Facility ${isUpdate ? "updated" : "created"} successfully!`); fetchData(); setEditMode(false); setCurrentFacility(null); }
      else { const err = await res.json(); alert(`Error: ${err.error}`); }
    } catch { alert("Failed."); }
  };

  const handleDelete = async (f: Facility) => {
    if (!window.confirm("Delete this facility?")) return;
    await fetch(`${API}/facilities/delete?facility_id=${f.facility_id}`, { method: "DELETE" });
    fetchData();
  };

  const renderTable = (facilities: Facility[]) => (
    <div className="table-responsive">
      <table>
        <thead><tr><th>Select</th><th>ID</th><th>Name</th><th>Type</th><th>Location</th><th>Contact No</th><th>Opening Hours</th><th>Manager ID</th><th>Actions</th></tr></thead>
        <tbody>
          {facilities.map((f, i) => (
            <tr key={i} className={currentFacility?.facility_id === f.facility_id ? "selected-row" : ""} onClick={() => setCurrentFacility(f)}>
              <td><input type="radio" name="selectedFacility" checked={currentFacility?.facility_id === f.facility_id} onChange={() => setCurrentFacility(f)} /></td>
              <td>{f.facility_id}</td><td>{f.name}</td><td>{f.type}</td><td>{f.location}</td>
              <td>{f.contact_no}</td><td>{f.opening_hours}</td><td>{f.manager_id}</td>
              <td className="actions-cell">
                <button onClick={(e) => { e.stopPropagation(); setEditMode(true); setCurrentFacility(f); setFormData({ ...f }); }} className="btn-edit"><FaEdit /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(f); }} className="btn-delete"><FaTrash /></button>
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
        <h3>FACILITY MANAGEMENT</h3>
        <div className="action-buttons">
          <button onClick={() => { if (currentFacility) { setEditMode(true); setFormData({ ...currentFacility }); } }} className="btn-update" disabled={!currentFacility}><FaEdit /> Update Selected</button>
          <button onClick={() => { setEditMode(true); setCurrentFacility(null); setFormData({ ...emptyFacility }); }} className="btn-primary"><FaPlus /> Add Facility</button>
        </div>
      </div>

      <div className="search-facilities-container">
        <h4>Search Facilities</h4>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group"><label>Facility ID:</label><input type="text" value={searchParams.facility_id} onChange={(e) => setSearchParams({ ...searchParams, facility_id: e.target.value })} /></div>
          <div className="form-group"><label>Name:</label><input type="text" value={searchParams.name} onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })} /></div>
          <div className="form-group">
            <label>Type:</label>
            <select value={searchParams.type} onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}>
              <option value="">--Select--</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Location:</label><input type="text" value={searchParams.location} onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })} /></div>
          <div className="form-group"><label>Manager ID:</label><input type="text" value={searchParams.manager_id} onChange={(e) => setSearchParams({ ...searchParams, manager_id: e.target.value })} /></div>
          <div className="form-group">
            <button type="submit" className="btn-primary">Search</button>
            {showSearchResults && <button type="button" onClick={() => setShowSearchResults(false)} className="btn-secondary">Show All</button>}
          </div>
        </form>
        {searchError && <p className="error-message">{searchError}</p>}
      </div>

      {showSearchResults ? (
        <>{<h4>Results:</h4>}{searchResults.length > 0 ? renderTable(searchResults) : <p>No facilities found.</p>}</>
      ) : loading ? (
        <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>
      ) : data.length > 0 ? renderTable(data) : <p>No facilities available.</p>}

      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentFacility ? "Edit Facility" : "Create Facility"}</h2>
            <form onSubmit={handleSubmit}>
              {currentFacility && <div className="form-group"><label>Facility ID</label><input type="text" value={formData.facility_id} disabled /></div>}
              <div className="form-group"><label>Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div className="form-group"><label>Type</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="form-group"><label>Location</label><input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required /></div>
              <div className="form-group"><label>Contact No</label><input type="text" value={formData.contact_no} onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })} /></div>
              <div className="form-group"><label>Opening Hours</label><input type="text" value={formData.opening_hours} onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })} placeholder="e.g., 9:00 AM - 10:00 PM" /></div>
              <div className="form-group"><label>Manager ID</label><input type="text" value={formData.manager_id} onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })} required /></div>
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

export default FacilityTab;
