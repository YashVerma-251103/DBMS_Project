import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Booking } from "../../types";

const API = "http://localhost:5000";

const BookingsTab: React.FC = () => {
  const [searchParams, setSearchParams] = useState({ booking_id: "", facility_id: "", payment_status: "" });
  const [searchResults, setSearchResults] = useState<Booking[]>([]);
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<any>({});

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = currentUser?.role === "customer"
        ? `${API}/bookings/search?aadhaar_no=${currentUser.aadhaar_no}`
        : `${API}/bookings/search`;
      const res = await fetch(url);
      setData(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); setSearchError("");
    try {
      const res = await axios.get(`${API}/bookings/search`, { params: searchParams });
      setSearchResults(res.data); setShowSearchResults(true);
    } catch { setSearchError("Error fetching booking data. Please try again."); setShowSearchResults(false); }
  };

  const handleCreate = () => {
    setEditMode(true); setCurrentBooking(null);
    setFormData({ facility_id: "", aadhaar_no: currentUser?.role === "customer" ? currentUser.aadhaar_no : "", employee_id: "", date_time: "", payment_status: "Pending" });
  };

  const handleEdit = (booking: Booking) => { setEditMode(true); setCurrentBooking(booking); setFormData({ ...booking }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const baseURL = currentBooking ? `${API}/bookings/update_customer` : `${API}/bookings/create`;
    const method = currentBooking ? "PUT" : "POST";
    const params = new URLSearchParams(formData).toString();
    try {
      const res = await fetch(`${baseURL}?${params}`, { method });
      if (res.ok) {
        alert(`Booking ${currentBooking ? "updated" : "created"} successfully!`);
        fetchData(); setEditMode(false); setCurrentBooking(null);
      } else {
        const err = await res.json();
        alert(`Error: ${err.message || "Unknown error"}`);
      }
    } catch { alert("Failed to process booking action."); }
  };

  const handleDelete = async (booking: Booking) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await fetch(`${API}/bookings/delete_customer?booking_id=${booking.booking_id}`, { method: "DELETE" });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const renderTable = (bookings: Booking[]) => (
    <div className="table-responsive">
      <table>
        <thead><tr><th>Select</th><th>Booking ID</th><th>Facility ID</th><th>Aadhar No</th><th>Employee ID</th><th>Date Time</th><th>Payment Status</th><th>Actions</th></tr></thead>
        <tbody>
          {bookings.map((booking, i) => (
            <tr key={i} className={currentBooking?.booking_id === booking.booking_id ? "selected-row" : ""} onClick={() => setCurrentBooking(booking)}>
              <td><input type="radio" name="selectedBooking" checked={currentBooking?.booking_id === booking.booking_id} onChange={() => setCurrentBooking(booking)} /></td>
              <td>{booking.booking_id}</td><td>{booking.facility_id}</td><td>{booking.aadhaar_no}</td>
              <td>{booking.employee_id}</td><td>{new Date(booking.date_time).toLocaleString()}</td>
              <td>{booking.payment_status}</td>
              <td className="actions-cell">
                {(currentUser?.role !== "customer" || booking.aadhaar_no === currentUser.aadhaar_no) && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(booking); }} className="btn-edit"><FaEdit /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(booking); }} className="btn-delete"><FaTrash /></button>
                  </>
                )}
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
        <h3>BOOKING SEARCH & MANAGEMENT</h3>
        <div className="action-buttons">
          <button onClick={() => currentBooking && handleEdit(currentBooking)} className="btn-update" disabled={!currentBooking}><FaEdit /> Update Selected Booking</button>
          <button onClick={handleCreate} className="btn-primary"><FaPlus /> Add a New Booking</button>
        </div>
      </div>

      <div className="search-bookings-container">
        <h4>Search Bookings</h4>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group"><label>Booking ID:</label><input type="text" name="booking_id" value={searchParams.booking_id} onChange={(e) => setSearchParams({ ...searchParams, booking_id: e.target.value })} placeholder="e.g., 12345" /></div>
          <div className="form-group"><label>Facility ID:</label><input type="text" name="facility_id" value={searchParams.facility_id} onChange={(e) => setSearchParams({ ...searchParams, facility_id: e.target.value })} placeholder="e.g., 101" /></div>
          <div className="form-group">
            <label>Payment Status:</label>
            <select name="payment_status" value={searchParams.payment_status} onChange={(e) => setSearchParams({ ...searchParams, payment_status: e.target.value })}>
              <option value="">--Select--</option>
              <option value="Pending">Pending</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <button type="submit" className="btn-primary">Search</button>
            {showSearchResults && <button type="button" onClick={() => setShowSearchResults(false)} className="btn-secondary">Show All Bookings</button>}
          </div>
        </form>
        {searchError && <p className="error-message">{searchError}</p>}
      </div>

      {showSearchResults ? (
        <>{<h4>Search Results:</h4>}{searchResults.length > 0 ? renderTable(searchResults) : <p>No bookings found matching your criteria.</p>}</>
      ) : loading ? (
        <div className="loading-container"><div className="loading-spinner"></div><p>Loading bookings...</p></div>
      ) : data.length > 0 ? renderTable(data) : <p>No bookings available.</p>}

      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentBooking ? "Edit Booking" : "Create Booking"}</h2>
            <form onSubmit={handleSubmit}>
              {currentBooking && <div className="form-group"><label>Booking ID</label><input type="text" value={formData.booking_id} disabled /></div>}
              <div className="form-group"><label>Facility ID</label><input type="text" value={formData.facility_id} onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })} /></div>
              <div className="form-group"><label>Aadhar No</label><input type="text" value={formData.aadhaar_no} onChange={(e) => setFormData({ ...formData, aadhaar_no: e.target.value })} /></div>
              <div className="form-group"><label>Employee ID</label><input type="text" value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} disabled={currentUser?.role === "customer"} /></div>
              <div className="form-group"><label>Date Time</label><input type="datetime-local" value={formData.date_time} onChange={(e) => setFormData({ ...formData, date_time: e.target.value })} /></div>
              <div className="form-group">
                <label>Payment Status</label>
                <select value={formData.payment_status} onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}>
                  <option value="Pending">Pending</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option>
                </select>
              </div>
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

export default BookingsTab;
