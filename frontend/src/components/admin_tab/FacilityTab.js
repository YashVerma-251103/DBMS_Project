import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const FacilityTab = () => {
  // Search parameters
  const [searchParams, setSearchParams] = useState({
    facility_id: '',
    name: '',
    type: '',
    location: '',
    manager_id: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [currentFacility, setCurrentFacility] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch all facilities using the search endpoint
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/facilities/search');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle facility search
  const handleSearchFacilities = async (e) => {
    e.preventDefault();
    setSearchError('');
    
    // Create a filtered params object that only includes non-empty values
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value !== '')
    );
  
    try {
      const response = await axios.get('http://localhost:5000/facilities/search', {
        params: filteredParams,
      });
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Error fetching facility data:', err);
      setSearchError('Error fetching facility data. Please try again later.');
      setShowSearchResults(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  // Initialize form for creating a new facility
  const handleCreate = () => {
    setEditMode(true);
    setCurrentFacility(null);
    setFormData({
      name: '',
      type: 'Gym',
      location: '',
      contact_no: '',
      opening_hours: '',
      manager_id: ''
    });
  };

  // Populate form for editing an existing facility
  const handleEdit = (facility) => {
    setEditMode(true);
    setCurrentFacility(facility);
    setFormData({ 
      ...facility
    });
  };

  // Submit form to either create or update a facility
  const handleSubmit = async (e) => {
    e.preventDefault();
    let baseURL = '';
    let method = '';

    if (currentFacility) {
      // Update existing facility
      baseURL = 'http://localhost:5000/facilities/update';
      method = 'PUT';
    } else {
      // Create new facility
      baseURL = 'http://localhost:5000/facilities/insert';
      method = 'POST';
    }

    // Convert formData into a URL query string since backend uses request.args
    const params = new URLSearchParams(formData).toString();
    const url = `${baseURL}?${params}`;

    try {
      const response = await fetch(url, { method: method });
      if (response.ok) {
        const result = await response.json();
        console.log(`${currentFacility ? 'Update' : 'Creation'} successful:`, result);
        alert(`${currentFacility ? 'Facility updated' : 'Facility created'} successfully!`);
        fetchData();
        setEditMode(false);
        setCurrentFacility(null);
      } else {
        const errorData = await response.json();
        console.error(`Error ${currentFacility ? 'updating' : 'creating'} facility:`, errorData);
        alert(`Error ${currentFacility ? 'updating' : 'creating'} facility: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process facility action. Please check console for details.');
    }
  };

  // Delete facility using the delete endpoint
  const handleDelete = async (facility) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        const url = `http://localhost:5000/facilities/delete?facility_id=${facility.facility_id}`;
        const response = await fetch(url, { method: 'DELETE' });
        if (response.ok) {
          fetchData();
        } else {
          console.error('Error deleting facility');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // Render the facilities table
  const renderFacilitiesTable = (facilitiesData) => {
    return (
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Facility ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Contact No</th>
              <th>Opening Hours</th>
              <th>Manager ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {facilitiesData.map((facility, index) => (
              <tr
                key={index}
                className={currentFacility?.facility_id === facility.facility_id ? 'selected-row' : ''}
                onClick={() => setCurrentFacility(facility)}
              >
                <td>
                  <input
                    type="radio"
                    name="selectedFacility"
                    checked={currentFacility?.facility_id === facility.facility_id}
                    onChange={() => setCurrentFacility(facility)}
                  />
                </td>
                <td>{facility.facility_id}</td>
                <td>{facility.name}</td>
                <td>{facility.type}</td>
                <td>{facility.location}</td>
                <td>{facility.contact_no}</td>
                <td>{facility.opening_hours}</td>
                <td>{facility.manager_id}</td>
                <td className="actions-cell">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(facility);
                    }}
                    className="btn-edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(facility);
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
        <h3>FACILITY MANAGEMENT</h3>
        <div className="action-buttons">
          <button
            onClick={() => handleEdit(currentFacility)}
            className="btn-update"
            disabled={!currentFacility}
          >
            <FaEdit /> Update Selected Facility
          </button>
          <button onClick={handleCreate} className="btn-primary">
            <FaPlus /> Create a New Facility
          </button>
        </div>
      </div>

      {/* Search Facilities Form */}
      <div className="search-facilities-container">
        <h4>Search Facilities</h4>
        <form onSubmit={handleSearchFacilities} className="search-form">
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
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={searchParams.name}
              onChange={handleSearchChange}
              placeholder="e.g., Main Gym"
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Type:</label>
            <select
              id="type"
              name="type"
              value={searchParams.type}
              onChange={handleSearchChange}
            >
              <option value="">--Select--</option>
              <option value="Gym">Gym</option>
              <option value="Lounge">Lounge</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Shop">Shop</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={searchParams.location}
              onChange={handleSearchChange}
              placeholder="e.g., Building A, Floor 1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="manager_id">Manager ID:</label>
            <input
              type="text"
              id="manager_id"
              name="manager_id"
              value={searchParams.manager_id}
              onChange={handleSearchChange}
              placeholder="e.g., 1001"
            />
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
                Show All Facilities
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
            renderFacilitiesTable(searchResults)
          ) : (
            <p>No facilities found matching your criteria.</p>
          )}
        </>
      ) : loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading facilities...</p>
        </div>
      ) : data.length > 0 ? (
        renderFacilitiesTable(data)
      ) : (
        <p>No facilities available.</p>
      )}

      {/* Form Modal for Editing/Creating */}
      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentFacility ? 'Edit Facility' : 'Create Facility'}</h2>
            <form onSubmit={handleSubmit}>
              {currentFacility && (
                <div className="form-group">
                  <label>Facility ID</label>
                  <input
                    type="text"
                    name="facility_id"
                    value={formData.facility_id}
                    onChange={(e) =>
                      setFormData({ ...formData, facility_id: e.target.value })
                    }
                    disabled={true}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                >
                  <option value="Gym">Gym</option>
                  <option value="Lounge">Lounge</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Shop">Shop</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  name="contact_no"
                  value={formData.contact_no}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_no: e.target.value })
                  }
                  required
                  pattern="[0-9]+"
                  title="Please enter only numbers"
                />
              </div>
              <div className="form-group">
                <label>Opening Hours</label>
                <input
                  type="text"
                  name="opening_hours"
                  value={formData.opening_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, opening_hours: e.target.value })
                  }
                  required
                  placeholder="e.g., 9:00 AM - 10:00 PM"
                />
              </div>
              <div className="form-group">
                <label>Manager ID</label>
                <input
                  type="text"
                  name="manager_id"
                  value={formData.manager_id}
                  onChange={(e) =>
                    setFormData({ ...formData, manager_id: e.target.value })
                  }
                  required
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

export default FacilityTab;