import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const FeedbackTab = () => {
  // Search parameters
  const [searchParams, setSearchParams] = useState({
    feedback_id: '',
    facility_id: '',
    aadhaar_no: '',
    manager_id: '',
    rating: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch all feedback using the search endpoint
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/feedback/search');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle feedback search
  const handleSearchFeedback = async (e) => {
    e.preventDefault();
    setSearchError('');
    
    // Create a filtered params object that only includes non-empty values
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value !== '')
    );
  
    try {
      const response = await axios.get('http://localhost:5000/feedback/search', {
        params: filteredParams,
      });
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Error fetching feedback data:', err);
      setSearchError('Error fetching feedback data. Please try again later.');
      setShowSearchResults(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  // Initialize form for creating new feedback
  const handleCreate = () => {
    setEditMode(true);
    setCurrentFeedback(null);
    setFormData({
      facility_id: '',
      aadhaar_no: '',
      manager_id: '',
      rating: 3,
      comments: '',
      date_time: new Date().toISOString().slice(0, 16)
    });
  };

  // Populate form for editing existing feedback
  const handleEdit = (feedback) => {
    setEditMode(true);
    setCurrentFeedback(feedback);
    setFormData({ 
      ...feedback,
      date_time: feedback.date_time ? feedback.date_time.slice(0, 16) : ''
    });
  };

  // Submit form to either create or update feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    let baseURL = '';
    let method = '';

    if (currentFeedback) {
      // Update existing feedback
      baseURL = 'http://localhost:5000/feedback/update';
      method = 'PUT';
    } else {
      // Create new feedback
      baseURL = 'http://localhost:5000/feedback/insert';
      method = 'POST';
    }

    // Convert formData into a URL query string since backend uses request.args
    const params = new URLSearchParams(formData).toString();
    const url = `${baseURL}?${params}`;

    try {
      const response = await fetch(url, { method: method });
      if (response.ok) {
        const result = await response.json();
        console.log(`${currentFeedback ? 'Update' : 'Creation'} successful:`, result);
        alert(`${currentFeedback ? 'Feedback updated' : 'Feedback created'} successfully!`);
        fetchData();
        setEditMode(false);
        setCurrentFeedback(null);
      } else {
        const errorData = await response.json();
        console.error(`Error ${currentFeedback ? 'updating' : 'creating'} feedback:`, errorData);
        alert(`Error ${currentFeedback ? 'updating' : 'creating'} feedback: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process feedback action. Please check console for details.');
    }
  };

  // Delete feedback using the delete endpoint
  const handleDelete = async (feedback) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        const url = `http://localhost:5000/feedback/delete?feedback_id=${feedback.feedback_id}&facility_id=${feedback.facility_id}&aadhaar_no=${feedback.aadhaar_no}&manager_id=${feedback.manager_id}`;
        const response = await fetch(url, { method: 'DELETE' });
        if (response.ok) {
          fetchData();
        } else {
          console.error('Error deleting feedback');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // Render the feedback table
  const renderFeedbackTable = (feedbackData) => {
    return (
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Feedback ID</th>
              <th>Facility ID</th>
              <th>Aadhaar No</th>
              <th>Manager ID</th>
              <th>Date Time</th>
              <th>Rating</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedbackData.map((feedback, index) => (
              <tr
                key={index}
                className={currentFeedback?.feedback_id === feedback.feedback_id ? 'selected-row' : ''}
                onClick={() => setCurrentFeedback(feedback)}
              >
                <td>
                  <input
                    type="radio"
                    name="selectedFeedback"
                    checked={currentFeedback?.feedback_id === feedback.feedback_id}
                    onChange={() => setCurrentFeedback(feedback)}
                  />
                </td>
                <td>{feedback.feedback_id}</td>
                <td>{feedback.facility_id}</td>
                <td>{feedback.aadhaar_no}</td>
                <td>{feedback.manager_id}</td>
                <td>{new Date(feedback.date_time).toLocaleString()}</td>
                <td>{feedback.rating}</td>
                <td className="comments-cell">{feedback.comments}</td>
                <td className="actions-cell">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(feedback);
                    }}
                    className="btn-edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(feedback);
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
        <h3>FEEDBACK MANAGEMENT</h3>
        <div className="action-buttons">
          <button
            onClick={() => handleEdit(currentFeedback)}
            className="btn-update"
            disabled={!currentFeedback}
          >
            <FaEdit /> Update Selected Feedback
          </button>
          <button onClick={handleCreate} className="btn-primary">
            <FaPlus /> Create New Feedback
          </button>
        </div>
      </div>

      {/* Search Feedback Form */}
      <div className="search-feedback-container">
        <h4>Search Feedback</h4>
        <form onSubmit={handleSearchFeedback} className="search-form">
          <div className="form-group">
            <label htmlFor="feedback_id">Feedback ID:</label>
            <input
              type="text"
              id="feedback_id"
              name="feedback_id"
              value={searchParams.feedback_id}
              onChange={handleSearchChange}
              placeholder="e.g., 123"
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
            <label htmlFor="aadhaar_no">Aadhaar No:</label>
            <input
              type="text"
              id="aadhaar_no"
              name="aadhaar_no"
              value={searchParams.aadhaar_no}
              onChange={handleSearchChange}
              placeholder="e.g., 123456789012"
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
            <label htmlFor="rating">Rating:</label>
            <select
              id="rating"
              name="rating"
              value={searchParams.rating}
              onChange={handleSearchChange}
            >
              <option value="">--Select--</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
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
                Show All Feedback
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
            renderFeedbackTable(searchResults)
          ) : (
            <p>No feedback found matching your criteria.</p>
          )}
        </>
      ) : loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading feedback...</p>
        </div>
      ) : data.length > 0 ? (
        renderFeedbackTable(data)
      ) : (
        <p>No feedback available.</p>
      )}

      {/* Form Modal for Editing/Creating */}
      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentFeedback ? 'Edit Feedback' : 'Create Feedback'}</h2>
            <form onSubmit={handleSubmit}>
              {currentFeedback && (
                <div className="form-group">
                  <label>Feedback ID</label>
                  <input
                    type="text"
                    name="feedback_id"
                    value={formData.feedback_id}
                    onChange={(e) =>
                      setFormData({ ...formData, feedback_id: e.target.value })
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
                <label>Aadhaar No</label>
                <input
                  type="text"
                  name="aadhaar_no"
                  value={formData.aadhaar_no}
                  onChange={(e) =>
                    setFormData({ ...formData, aadhaar_no: e.target.value })
                  }
                  required
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
              <div className="form-group">
                <label>Rating</label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                  required
                >
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date Time</label>
                <input
                  type="datetime-local"
                  name="date_time"
                  value={formData.date_time}
                  onChange={(e) =>
                    setFormData({ ...formData, date_time: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Comments</label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={(e) =>
                    setFormData({ ...formData, comments: e.target.value })
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

export default FeedbackTab;