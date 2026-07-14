import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Booking } from "../../types";
import API from "../../api";

const emptyBooking: Omit<Booking, "booking_id"> & { booking_id: string } = {
  booking_id: "",
  facility_id: 0,
  flight_id: null,
  customer_id: 0,
  employee_id: 0,
  date_time: "",
  payment_status: "Pending",
  checked_in: false,
};

const BookingsTab: React.FC = () => {
  const [searchParams, setSearchParams] = useState({ booking_id: "", facility_id: "", payment_status: "" });
  const [searchResults, setSearchResults] = useState<Booking[]>([]);
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<any>({ ...emptyBooking });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/bookings/search`);
      setData(await res.json());
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    try {
      const filtered = Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== ""));
      const res = await axios.get(`${API}/bookings/search`, { params: filtered });
      setSearchResults(res.data);
      setShowSearchResults(true);
    } catch {
      setSearchError("Error fetching booking data.");
      setShowSearchResults(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = !!currentBooking;
    const url = isUpdate ? `${API}/bookings/update` : `${API}/bookings/create`;
    const method = isUpdate ? "PUT" : "POST";
    const cleaned = Object.fromEntries(Object.entries(formData).filter(([, v]) => v !== null && v !== undefined));
    const params = new URLSearchParams(cleaned as Record<string, string>).toString();

    try {
      const res = await fetch(`${url}?${params}`, { method });
      if (res.ok) {
        alert(`Booking ${isUpdate ? "updated" : "created"} successfully!`);
        fetchData();
        setEditMode(false);
        setCurrentBooking(null);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Unknown error"}`);
      }
    } catch {
      alert("Failed to process booking action.");
    }
  };

  const handleDelete = async (booking: Booking) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      const res = await fetch(`${API}/bookings/delete?booking_id=${booking.booking_id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };

  const renderTable = (bookings: Booking[]) => (
    <div className="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Select</th><th>Booking ID</th><th>Facility ID</th><th>Customer ID</th>
            <th>Employee ID</th><th>Date Time</th><th>Payment Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, i) => (
            <tr key={i} className={currentBooking?.booking_id === b.booking_id ? "selected-row" : ""}
              onClick={() => setCurrentBooking(b)}>
              <td><input type="radio" name="selectedBooking" checked={currentBooking?.booking_id === b.booking_id} onChange={() => setCurrentBooking(b)} /></td>
              <td>{b.booking_id}</td><td>{b.facility_id}</td><td>{b.customer_id}</td>
              <td>{b.employee_id}</td><td>{new Date(b.date_time).toLocaleString()}</td>
              <td>{b.payment_status}</td>
              <td className="actions-cell">
                <button onClick={(e) => { e.stopPropagation(); setEditMode(true); setCurrentBooking(b); setFormData({ ...b }); }} className="btn-edit"><FaEdit /></button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(b); }} className="btn-delete"><FaTrash /></button>
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
          <button onClick={() => { if (currentBooking) { setEditMode(true); setFormData({ ...currentBooking }); } }} className="btn-update" disabled={!currentBooking}>
            <FaEdit /> Update Selected Booking
          </button>
          <button onClick={() => { setEditMode(true); setCurrentBooking(null); setFormData({ ...emptyBooking }); }} className="btn-primary">
            <FaPlus /> Add a New Booking
          </button>
        </div>
      </div>

      <div className="search-bookings-container">
        <h4>Search Bookings</h4>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group">
            <label>Booking ID:</label>
            <input type="text" value={searchParams.booking_id} onChange={(e) => setSearchParams({ ...searchParams, booking_id: e.target.value })} placeholder="e.g., 1" />
          </div>
          <div className="form-group">
            <label>Facility ID:</label>
            <input type="text" value={searchParams.facility_id} onChange={(e) => setSearchParams({ ...searchParams, facility_id: e.target.value })} placeholder="e.g., 101" />
          </div>
          <div className="form-group">
            <label>Payment Status:</label>
            <select value={searchParams.payment_status} onChange={(e) => setSearchParams({ ...searchParams, payment_status: e.target.value })}>
              <option value="">--Select--</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
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
        <>{<h4>Search Results:</h4>}{searchResults.length > 0 ? renderTable(searchResults) : <p>No bookings found.</p>}</>
      ) : loading ? (
        <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>
      ) : data.length > 0 ? renderTable(data) : <p>No bookings available.</p>}

      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentBooking ? "Edit Booking" : "Create Booking"}</h2>
            <form onSubmit={handleSubmit}>
              {currentBooking && <div className="form-group"><label>Booking ID</label><input type="text" value={formData.booking_id} disabled /></div>}
              <div className="form-group"><label>Facility ID</label><input type="text" value={formData.facility_id} onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })} required /></div>
              <div className="form-group"><label>Customer ID</label><input type="text" value={formData.customer_id} onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })} required /></div>
              <div className="form-group"><label>Employee ID</label><input type="text" value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} required /></div>
              <div className="form-group"><label>Date Time</label><input type="datetime-local" value={formData.date_time} onChange={(e) => setFormData({ ...formData, date_time: e.target.value })} /></div>
              <div className="form-group">
                <label>Payment Status</label>
                <select value={formData.payment_status} onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
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
