import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Feedback } from "../../types";

const API = "http://localhost:5000";

const FeedbackTab: React.FC = () => {
  const [searchParams, setSearchParams] = useState({ feedback_id: "", facility_id: "", aadhaar_no: "", manager_id: "", rating: "" });
  const [searchResults, setSearchResults] = useState<Feedback[]>([]);
  const [data, setData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [formData, setFormData] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    try { const res = await fetch(`${API}/feedback/search`); setData(await res.json()); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); setSearchError("");
    const filtered = Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== ""));
    try { const res = await axios.get(`${API}/feedback/search`, { params: filtered }); setSearchResults(res.data); setShowSearchResults(true); }
    catch { setSearchError("Error fetching feedback data."); setShowSearchResults(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = !!currentFeedback;
    const url = isUpdate ? `${API}/feedback/update` : `${API}/feedback/insert`;
    const method = isUpdate ? "PUT" : "POST";
    const params = new URLSearchParams(formData).toString();
    try {
      const res = await fetch(`${url}?${params}`, { method });
      if (res.ok) { alert(`Feedback ${isUpdate ? "updated" : "created"}!`); fetchData(); setEditMode(false); setCurrentFeedback(null); }
      else { const err = await res.json(); alert(`Error: ${err.error}`); }
    } catch { alert("Failed."); }
  };

  const handleDelete = async (fb: Feedback) => {
    if (!window.confirm("Delete this feedback?")) return;
    await fetch(`${API}/feedback/delete?feedback_id=${fb.feedback_id}`, { method: "DELETE" });
    fetchData();
  };

  const renderTable = (feedbacks: Feedback[]) => (
    <div className="table-responsive">
      <table>
        <thead><tr><th>Select</th><th>ID</th><th>Facility ID</th><th>Aadhaar No</th><th>Manager ID</th><th>Date Time</th><th>Rating</th><th>Comments</th><th>Actions</th></tr></thead>
        <tbody>
          {feedbacks.map((fb, i) => (
            <tr key={i} className={currentFeedback?.feedback_id === fb.feedback_id ? "selected-row" : ""} onClick={() => setCurrentFeedback(fb)}>
              <td><input type="radio" name="selectedFeedback" checked={currentFeedback?.feedback_id === fb.feedback_id} onChange={() => setCurrentFeedback(fb)} /></td>
              <td>{fb.feedback_id}</td><td>{fb.facility_id}</td><td>{fb.aadhaar_no}</td><td>{fb.manager_id}</td>
              <td>{new Date(fb.date_time).toLocaleString()}</td><td>{fb.rating}</td>
              <td className="comments-cell">{fb.comments}</td>
              <td className="actions-cell">
                <button onClick={(e) => { e.stopPropagation(); setEditMode(true); setCurrentFeedback(fb); setFormData({ ...fb, date_time: fb.date_time?.slice(0,16) }); }} className="btn-edit"><FaEdit /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(fb); }} className="btn-delete"><FaTrash /></button>
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
        <h3>FEEDBACK MANAGEMENT</h3>
        <div className="action-buttons">
          <button onClick={() => { if (currentFeedback) { setEditMode(true); setFormData({ ...currentFeedback, date_time: currentFeedback.date_time?.slice(0,16) }); } }} className="btn-update" disabled={!currentFeedback}><FaEdit /> Update Selected</button>
          <button onClick={() => { setEditMode(true); setCurrentFeedback(null); setFormData({ facility_id: "", aadhaar_no: "", manager_id: "", rating: 3, comments: "", date_time: new Date().toISOString().slice(0,16) }); }} className="btn-primary"><FaPlus /> Add Feedback</button>
        </div>
      </div>

      <div className="search-feedback-container">
        <h4>Search Feedback</h4>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group"><label>Feedback ID:</label><input type="text" value={searchParams.feedback_id} onChange={(e) => setSearchParams({ ...searchParams, feedback_id: e.target.value })} /></div>
          <div className="form-group"><label>Facility ID:</label><input type="text" value={searchParams.facility_id} onChange={(e) => setSearchParams({ ...searchParams, facility_id: e.target.value })} /></div>
          <div className="form-group"><label>Aadhaar No:</label><input type="text" value={searchParams.aadhaar_no} onChange={(e) => setSearchParams({ ...searchParams, aadhaar_no: e.target.value })} /></div>
          <div className="form-group"><label>Manager ID:</label><input type="text" value={searchParams.manager_id} onChange={(e) => setSearchParams({ ...searchParams, manager_id: e.target.value })} /></div>
          <div className="form-group">
            <label>Rating:</label>
            <select value={searchParams.rating} onChange={(e) => setSearchParams({ ...searchParams, rating: e.target.value })}>
              <option value="">--Select--</option>
              {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>)}
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
        <>{<h4>Results:</h4>}{searchResults.length > 0 ? renderTable(searchResults) : <p>No feedback found.</p>}</>
      ) : loading ? (
        <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>
      ) : data.length > 0 ? renderTable(data) : <p>No feedback available.</p>}

      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentFeedback ? "Edit Feedback" : "Create Feedback"}</h2>
            <form onSubmit={handleSubmit}>
              {currentFeedback && <div className="form-group"><label>Feedback ID</label><input type="text" value={formData.feedback_id} disabled /></div>}
              <div className="form-group"><label>Facility ID</label><input type="text" value={formData.facility_id} onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })} required /></div>
              <div className="form-group"><label>Aadhaar No</label><input type="text" value={formData.aadhaar_no} onChange={(e) => setFormData({ ...formData, aadhaar_no: e.target.value })} required /></div>
              <div className="form-group"><label>Manager ID</label><input type="text" value={formData.manager_id} onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })} required /></div>
              <div className="form-group">
                <label>Rating</label>
                <select value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} required>
                  {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Date Time</label><input type="datetime-local" value={formData.date_time} onChange={(e) => setFormData({ ...formData, date_time: e.target.value })} required /></div>
              <div className="form-group"><label>Comments</label><textarea value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} /></div>
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

export default FeedbackTab;
