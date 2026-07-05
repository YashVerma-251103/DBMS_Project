import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { Flight } from "../../types";

const API = "http://localhost:5000";

const emptyFlight: Omit<Flight, "flight_number"> & { flight_number: string } = {
  flight_id: 0,
  flight_number: "",
  airline: "",
  departure_time: "",
  arrival_time: "",
  status: "On Time",
  gate: "",
  terminal: "",
};

const FlightsTab: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    flight_number: "",
    airline: "",
    departure_date: "",
  });
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [data, setData] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFlight, setCurrentFlight] = useState<Flight | null>(null);
  const [formData, setFormData] = useState<Flight>({ ...emptyFlight });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/flights/search`);
      setData(await res.json());
    } catch (err) {
      console.error("Error fetching flights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchFlights = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    try {
      const res = await axios.get(`${API}/flights/search`, { params: searchParams });
      setSearchResults(res.data);
      setShowSearchResults(true);
    } catch {
      setSearchError("Error fetching flight data. Please try again.");
      setShowSearchResults(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdate = !!currentFlight;
    const url = isUpdate ? `${API}/flights/update` : `${API}/flights/create`;
    const method = isUpdate ? "PUT" : "POST";
    const params = new URLSearchParams(formData as any).toString();

    try {
      const res = await fetch(`${url}?${params}`, { method });
      if (res.ok) {
        alert(`Flight ${isUpdate ? "updated" : "created"} successfully!`);
        fetchData();
        setEditMode(false);
        setCurrentFlight(null);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Unknown error"}`);
      }
    } catch {
      alert("Failed to process flight action.");
    }
  };

  const handleDelete = async (flight: Flight) => {
    if (!window.confirm("Are you sure you want to delete this flight?")) return;
    try {
      const res = await fetch(`${API}/flights/${flight.flight_number}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Error deleting flight:", err);
    }
  };

  const handleEdit = (flight: Flight) => {
    setEditMode(true);
    setCurrentFlight(flight);
    setFormData({
      ...flight,
      departure_time: flight.departure_time ? flight.departure_time.slice(0, 16) : "",
      arrival_time: flight.arrival_time ? flight.arrival_time.slice(0, 16) : "",
    });
  };

  const handleCreate = () => {
    setEditMode(true);
    setCurrentFlight(null);
    setFormData({ ...emptyFlight });
  };

  const renderTable = (flights: Flight[]) => (
    <div className="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Flight Number</th>
            <th>Airline</th>
            <th>Departure Time</th>
            <th>Arrival Time</th>
            <th>Status</th>
            <th>Gate</th>
            <th>Terminal</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight, i) => (
            <tr
              key={i}
              className={currentFlight?.flight_number === flight.flight_number ? "selected-row" : ""}
              onClick={() => setCurrentFlight(flight)}
            >
              <td>
                <input
                  type="radio"
                  name="selectedFlight"
                  checked={currentFlight?.flight_number === flight.flight_number}
                  onChange={() => setCurrentFlight(flight)}
                />
              </td>
              <td>{flight.flight_number}</td>
              <td>{flight.airline}</td>
              <td>{flight.departure_time ? new Date(flight.departure_time).toLocaleString() : "N/A"}</td>
              <td>{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : "N/A"}</td>
              <td>{flight.status}</td>
              <td>{flight.gate}</td>
              <td>{flight.terminal}</td>
              <td className="actions-cell">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(flight); }} className="btn-edit">
                  <FaEdit />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(flight); }} className="btn-delete">
                  <FaTrash />
                </button>
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
        <h3>FLIGHT SEARCH & MANAGEMENT</h3>
        <div className="action-buttons">
          <button onClick={() => currentFlight && handleEdit(currentFlight)} className="btn-update" disabled={!currentFlight}>
            <FaEdit /> Update Selected Flight
          </button>
          <button onClick={handleCreate} className="btn-primary">
            <FaPlus /> Add a New Flight
          </button>
        </div>
      </div>

      <div className="search-flights-container">
        <h4>Search Flights</h4>
        <form onSubmit={handleSearchFlights} className="search-form">
          <div className="form-group">
            <label>Flight Number:</label>
            <input type="text" name="flight_number" value={searchParams.flight_number}
              onChange={(e) => setSearchParams({ ...searchParams, flight_number: e.target.value })}
              placeholder="e.g., 6E202" />
          </div>
          <div className="form-group">
            <label>Airline:</label>
            <input type="text" name="airline" value={searchParams.airline}
              onChange={(e) => setSearchParams({ ...searchParams, airline: e.target.value })}
              placeholder="e.g., Indigo" />
          </div>
          <div className="form-group">
            <label>Departure Date:</label>
            <input type="date" name="departure_date" value={searchParams.departure_date}
              onChange={(e) => setSearchParams({ ...searchParams, departure_date: e.target.value })} />
          </div>
          <div className="form-group">
            <button type="submit" className="btn-primary">Search</button>
            {showSearchResults && (
              <button type="button" onClick={() => setShowSearchResults(false)} className="btn-secondary">
                Show All Flights
              </button>
            )}
          </div>
        </form>
        {searchError && <p className="error-message">{searchError}</p>}
      </div>

      {showSearchResults ? (
        <>
          <h4>Search Results:</h4>
          {searchResults.length > 0 ? renderTable(searchResults) : <p>No flights found.</p>}
        </>
      ) : loading ? (
        <div className="loading-container"><div className="loading-spinner"></div><p>Loading flights...</p></div>
      ) : data.length > 0 ? renderTable(data) : <p>No flights available.</p>}

      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentFlight ? "Edit Flight" : "Create Flight"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Flight Number</label>
                <input type="text" value={formData.flight_number}
                  onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                  disabled={!!currentFlight} required />
              </div>
              <div className="form-group">
                <label>Airline</label>
                <input type="text" value={formData.airline}
                  onChange={(e) => setFormData({ ...formData, airline: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Departure Time</label>
                <input type="datetime-local" value={formData.departure_time}
                  onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Arrival Time</label>
                <input type="datetime-local" value={formData.arrival_time}
                  onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="On Time">On Time</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Departed">Departed</option>
                  <option value="Arrived">Arrived</option>
                </select>
              </div>
              <div className="form-group">
                <label>Gate</label>
                <input type="text" value={formData.gate}
                  onChange={(e) => setFormData({ ...formData, gate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Terminal</label>
                <input type="text" value={formData.terminal}
                  onChange={(e) => setFormData({ ...formData, terminal: e.target.value })} />
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

export default FlightsTab;
