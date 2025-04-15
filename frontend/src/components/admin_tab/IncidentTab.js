import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const IncidentTab = () => {
  // Search parameters
  const [searchParams, setSearchParams] = useState({
    incident_id: '',
    facility_id: '',
    reported_by: '',
    status: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch all incidents using the search endpoint
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/incidents/search');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle incident search
  const handleSearchIncidents = async (e) => {
    e.preventDefault();
    setSearchError('');
    
    // Create a filtered params object that only includes non-empty values
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value !== '')
    );
  
    try {
      const response = await axios.get('http://localhost:5000/incidents/search', {
        params: filteredParams,
      });
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Error fetching incident data:', err);
      setSearchError('Error fetching incident data. Please try again later.');
      setShowSearchResults(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  // Initialize form for creating a new incident
  const handleCreate = () => {
    setEditMode(true);
    setCurrentIncident(null);
    setFormData({
      facility_id: '',
      reported_by: '',
      description: '',
      status: 'Reported',
      reported_at: new Date().toISOString().slice(0, 16),
      resolved_at: ''
    });
  };

  // Populate form for editing an existing incident
  const handleEdit = (incident) => {
    setEditMode(true);
    setCurrentIncident(incident);
    setFormData({ 
      ...incident,
      reported_at: incident.reported_at ? incident.reported_at.slice(0, 16) : '',
      resolved_at: incident.resolved_at ? incident.resolved_at.slice(0, 16) : ''
    });
  };

  // Submit form to either create or update an incident
  const handleSubmit = async (e) => {
    e.preventDefault();
    let baseURL = '';
    let method = '';

    if (currentIncident) {
      // Update existing incident
      baseURL = 'http://localhost:5000/incidents/update';
      method = 'PUT';
    } else {
      // Create new incident
      baseURL = 'http://localhost:5000/incidents/insert';
      method = 'POST';
    }

    // Convert formData into a URL query string since backend uses request.args
    const params = new URLSearchParams(formData).toString();
    const url = `${baseURL}?${params}`;

    try {
      const response = await fetch(url, { method: method });
      if (response.ok) {
        const result = await response.json();
        console.log(`${currentIncident ? 'Update' : 'Creation'} successful:`, result);
        alert(`${currentIncident ? 'Incident updated' : 'Incident created'} successfully!`);
        fetchData();
        setEditMode(false);
        setCurrentIncident(null);
      } else {
        const errorData = await response.json();
        console.error(`Error ${currentIncident ? 'updating' : 'creating'} incident:`, errorData);
        alert(`Error ${currentIncident ? 'updating' : 'creating'} incident: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process incident action. Please check console for details.');
    }
  };

  // Delete incident using the delete endpoint
  const handleDelete = async (incident) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        const url = `http://localhost:5000/incidents/delete?incident_id=${incident.incident_id}`;
        const response = await fetch(url, { method: 'DELETE' });
        if (response.ok) {
          fetchData();
        } else {
          console.error('Error deleting incident');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // Render the incidents table
  const renderIncidentsTable = (incidentsData) => {
    return (
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Incident ID</th>
              <th>Facility ID</th>
              <th>Reported By</th>
              <th>Description</th>
              <th>Status</th>
              <th>Reported At</th>
              <th>Resolved At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidentsData.map((incident, index) => (
              <tr
                key={index}
                className={currentIncident?.incident_id === incident.incident_id ? 'selected-row' : ''}
                onClick={() => setCurrentIncident(incident)}
              >
                <td>
                  <input
                    type="radio"
                    name="selectedIncident"
                    checked={currentIncident?.incident_id === incident.incident_id}
                    onChange={() => setCurrentIncident(incident)}
                  />
                </td>
                <td>{incident.incident_id}</td>
                <td>{incident.facility_id}</td>
                <td>{incident.reported_by}</td>
                <td className="description-cell">{incident.description}</td>
                <td>{incident.status}</td>
                <td>{new Date(incident.reported_at).toLocaleString()}</td>
                <td>{incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : 'N/A'}</td>
                <td className="actions-cell">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(incident);
                    }}
                    className="btn-edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(incident);
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
        <h3>INCIDENT MANAGEMENT</h3>
        <div className="action-buttons">
          <button
            onClick={() => handleEdit(currentIncident)}
            className="btn-update"
            disabled={!currentIncident}
          >
            <FaEdit /> Update Selected Incident
          </button>
          <button onClick={handleCreate} className="btn-primary">
            <FaPlus /> Add an Incident
          </button>
        </div>
      </div>

      {/* Search Incidents Form */}
      <div className="search-incidents-container">
        <h4>Search Incidents</h4>
        <form onSubmit={handleSearchIncidents} className="search-form">
          <div className="form-group">
            <label htmlFor="incident_id">Incident ID:</label>
            <input
              type="text"
              id="incident_id"
              name="incident_id"
              value={searchParams.incident_id}
              onChange={handleSearchChange}
              placeholder="e.g., 12345"
            />
          </div>
          <div className="form-group">
            <label htmlFor="facility_id">Facility ID:</label>
            <input
              type="text"
              id="facility_id"
              name="facility_id"
              value={searchParams.facility_id}
              onChange={handleSearchChange}
              placeholder="e.g., 101"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reported_by">Reported By (Employee ID):</label>
            <input
              type="text"
              id="reported_by"
              name="reported_by"
              value={searchParams.reported_by}
              onChange={handleSearchChange}
              placeholder="e.g., 1001"
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={searchParams.status}
              onChange={handleSearchChange}
            >
              <option value="">--Select--</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div className="form-group">
            <button type="submit" className="btn-primary">
              Search
            </button>
            {showSearchResults && (
              <button
                type="button"
                onClick={() => setShowSearchResults(false)}
                className="btn-secondary"
              >
                Show All Incidents
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
            renderIncidentsTable(searchResults)
          ) : (
            <p>No incidents found matching your criteria.</p>
          )}
        </>
      ) : loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading incidents...</p>
        </div>
      ) : data.length > 0 ? (
        renderIncidentsTable(data)
      ) : (
        <p>No incidents available.</p>
      )}

      {/* Form Modal for Editing/Creating */}
      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentIncident ? 'Edit Incident' : 'Create Incident'}</h2>
            <form onSubmit={handleSubmit}>
              {currentIncident && (
                <div className="form-group">
                  <label>Incident ID</label>
                  <input
                    type="text"
                    name="incident_id"
                    value={formData.incident_id}
                    onChange={(e) =>
                      setFormData({ ...formData, incident_id: e.target.value })
                    }
                    disabled={true}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Facility ID</label>
                <input
                  type="text"
                  name="facility_id"
                  value={formData.facility_id}
                  onChange={(e) =>
                    setFormData({ ...formData, facility_id: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Reported By (Employee ID)</label>
                <input
                  type="text"
                  name="reported_by"
                  value={formData.reported_by}
                  onChange={(e) =>
                    setFormData({ ...formData, reported_by: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
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
                  required
                >
                  <option value="Reported">Reported</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reported At</label>
                <input
                  type="datetime-local"
                  name="reported_at"
                  value={formData.reported_at}
                  onChange={(e) =>
                    setFormData({ ...formData, reported_at: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Resolved At</label>
                <input
                  type="datetime-local"
                  name="resolved_at"
                  value={formData.resolved_at}
                  onChange={(e) =>
                    setFormData({ ...formData, resolved_at: e.target.value })
                  }
                  disabled={formData.status !== 'Resolved'}
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

export default IncidentTab;