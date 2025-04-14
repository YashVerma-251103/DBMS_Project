// Description: This component handles the flight search and management functionality.
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const FlightsTab = () => {
  const [searchParams, setSearchParams] = useState({
    flight_number: '',
    airline: '',
    departure_time_start: '',
    departure_time_end: '',
    arrival_time_start: '',
    arrival_time_end: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFlight, setCurrentFlight] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch flights using the search endpoint. When no parameters are passed, we assume all flights are returned.
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/flights/search');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handles flight search using the backend search endpoint.
  const handleSearchFlights = async (e) => {
    e.preventDefault();
    setSearchError('');
    try {
      // Convert datetime-local inputs to ISO format for the API
      const params = {
        ...searchParams,
        departure_time_start: searchParams.departure_time_start ? new Date(searchParams.departure_time_start).toISOString() : '',
        departure_time_end: searchParams.departure_time_end ? new Date(searchParams.departure_time_end).toISOString() : '',
        arrival_time_start: searchParams.arrival_time_start ? new Date(searchParams.arrival_time_start).toISOString() : '',
        arrival_time_end: searchParams.arrival_time_end ? new Date(searchParams.arrival_time_end).toISOString() : '',
      };

      const response = await axios.get('http://localhost:5000/flights/search', {
        params: params,
      });
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Error fetching flight data:', err);
      setSearchError('Error fetching flight data. Please try again later.');
      setShowSearchResults(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  // Initialize form for creating a new flight.
  const handleCreate = () => {
    setEditMode(true);
    setCurrentFlight(null);
    setFormData({
      flight_number: '',
      airline: '',
      departure_time: '',
      arrival_time: '',
      status: 'On Time',
      gate: '',
      terminal: ''
    });
  };

  // Populate form for editing an existing flight.
  const handleEdit = (flight) => {
    setEditMode(true);
    setCurrentFlight(flight);
    setFormData({ 
      ...flight,
      departure_time: flight.departure_time ? flight.departure_time.slice(0, 16) : '',
      arrival_time: flight.arrival_time ? flight.arrival_time.slice(0, 16) : ''
    });
  };

  // Submit form to either create or update.
  const handleSubmit = async (e) => {
    e.preventDefault();
    let baseURL = '';
    let method = '';

    if (currentFlight) {
      // Update existing flight using the /update endpoint.
      baseURL = 'http://localhost:5000/flights/update';
      method = 'PUT';
    } else {
      // Create new flight using the /create endpoint.
      baseURL = 'http://localhost:5000/flights/create';
      method = 'POST';
    }

    // Convert datetime-local to ISO format for the API
    const submissionData = {
      ...formData,
      departure_time: formData.departure_time ? new Date(formData.departure_time).toISOString() : '',
      arrival_time: formData.arrival_time ? new Date(formData.arrival_time).toISOString() : ''
    };

    // Since the backend is using request.args, convert formData into a query string.
    const params = new URLSearchParams(submissionData).toString();
    const url = `${baseURL}?${params}`;

    try {
      const response = await fetch(url, {
        method: method
      });
      if (response.ok) {
        const result = await response.json();
        console.log(`${currentFlight ? 'Update' : 'Creation'} successful:`, result);
        alert(`${currentFlight ? 'Flight updated' : 'Flight created'} successfully!`);
        fetchData();
        setEditMode(false);
        setCurrentFlight(null);
      } else {
        const errorData = await response.json();
        console.error(`Error ${currentFlight ? 'updating' : 'creating'} flight:`, errorData);
        alert(`Error ${currentFlight ? 'updating' : 'creating'} flight: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process flight action. Please check console for details.');
    }
  };

  // Delete flight record (endpoint remains unchanged).
  const handleDelete = async (flight) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        const response = await fetch(`http://localhost:5000/flights/${flight.flight_number}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchData();
        } else {
          console.error('Error deleting flight');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // Render the flights table.
  const renderFlightsTable = (flightsData) => {
    return (
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
            {flightsData.map((flight, index) => (
              <tr
                key={index}
                className={currentFlight?.flight_number === flight.flight_number ? 'selected-row' : ''}
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
                <td>{new Date(flight.departure_time).toLocaleString()}</td>
                <td>{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString() : 'N/A'}</td>
                <td>{flight.status}</td>
                <td>{flight.gate}</td>
                <td>{flight.terminal}</td>
                <td className="actions-cell">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(flight);
                    }}
                    className="btn-edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(flight);
                    }}
                    className="btn-delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div className="table-header">
        <h3>FLIGHT SEARCH & MANAGEMENT</h3>
        <div className="action-buttons">
          <button
            onClick={() => handleEdit(currentFlight)}
            className="btn-update"
            disabled={!currentFlight}
          >
            <FaEdit /> Update Selected Flight
          </button>
          <button onClick={handleCreate} className="btn-primary">
            <FaPlus /> Create New Flight
          </button>
        </div>
      </div>

      {/* Search Flights Form */}
      <div className="search-flights-container">
        <h4>Search Flights</h4>
        <form onSubmit={handleSearchFlights} className="search-form">
          <div className="form-group">
            <label htmlFor="flight_number">Flight Number:</label>
            <input
              type="text"
              id="flight_number"
              name="flight_number"
              value={searchParams.flight_number}
              onChange={handleSearchChange}
              placeholder="e.g., 6e202"
            />
          </div>
          <div className="form-group">
            <label htmlFor="airline">Airline:</label>
            <input
              type="text"
              id="airline"
              name="airline"
              value={searchParams.airline}
              onChange={handleSearchChange}
              placeholder="e.g., Indigo"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="departure_time_start">Departure Time (From):</label>
            <input
              type="datetime-local"
              id="departure_time_start"
              name="departure_time_start"
              value={searchParams.departure_time_start}
              onChange={handleSearchChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="departure_time_end">Departure Time (To):</label>
            <input
              type="datetime-local"
              id="departure_time_end"
              name="departure_time_end"
              value={searchParams.departure_time_end}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="arrival_time_start">Arrival Time (From):</label>
            <input
              type="datetime-local"
              id="arrival_time_start"
              name="arrival_time_start"
              value={searchParams.arrival_time_start}
              onChange={handleSearchChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="arrival_time_end">Arrival Time (To):</label>
            <input
              type="datetime-local"
              id="arrival_time_end"
              name="arrival_time_end"
              value={searchParams.arrival_time_end}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="form-group">
            <button type="submit" className="btn-primary">Search</button>
            {showSearchResults && (
              <button 
                type="button" 
                onClick={() => setShowSearchResults(false)}
                className="btn-secondary"
              >
                Show All Flights
              </button>
            )}
          </div>
        </form>
        {searchError && <p className="error-message">{searchError}</p>}
      </div>

      {/* Render Search Results or full listing */}
      {showSearchResults ? (
        <>
          <h4>Search Results:</h4>
          {searchResults.length > 0 ? (
            renderFlightsTable(searchResults)
          ) : (
            <p>No flights found matching your criteria.</p>
          )}
        </>
      ) : (
        loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading flights...</p>
          </div>
        ) : (
          data.length > 0 ? (
            renderFlightsTable(data)
          ) : (
            <p>No flights available.</p>
          )
        )
      )}

      {/* Form Modal for Editing/Creating */}
      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentFlight ? 'Edit Flight' : 'Create Flight'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Flight Number</label>
                <input
                  type="text"
                  name="flight_number"
                  value={formData.flight_number}
                  onChange={(e) =>
                    setFormData({ ...formData, flight_number: e.target.value })
                  }
                  disabled={currentFlight ? true : false}
                />
              </div>
              <div className="form-group">
                <label>Airline</label>
                <input
                  type="text"
                  name="airline"
                  value={formData.airline}
                  onChange={(e) =>
                    setFormData({ ...formData, airline: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Departure Time</label>
                <input
                  type="datetime-local"
                  name="departure_time"
                  value={formData.departure_time}
                  onChange={(e) =>
                    setFormData({ ...formData, departure_time: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Arrival Time</label>
                <input
                  type="datetime-local"
                  name="arrival_time"
                  value={formData.arrival_time}
                  onChange={(e) =>
                    setFormData({ ...formData, arrival_time: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="On Time">On Time</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Departed">Departed</option>
                  <option value="Arrived">Arrived</option>
                </select>
              </div>
              <div className="form-group">
                <label>Gate</label>
                <input
                  type="text"
                  name="gate"
                  value={formData.gate}
                  onChange={(e) =>
                    setFormData({ ...formData, gate: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Terminal</label>
                <input
                  type="text"
                  name="terminal"
                  value={formData.terminal}
                  onChange={(e) =>
                    setFormData({ ...formData, terminal: e.target.value })
                  }
                />
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