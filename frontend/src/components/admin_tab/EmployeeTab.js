import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const EmployeeTab = () => {
  // Search parameters
  const [searchParams, setSearchParams] = useState({
    employee_id: '',
    name: '',
    role: '',
    shift_timings: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const [editMode, setEditMode] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch all employees using the search endpoint
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/employees/search');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle employee search
  const handleSearchEmployees = async (e) => {
    e.preventDefault();
    setSearchError('');
    
    // Create a filtered params object that only includes non-empty values
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([_, value]) => value !== '')
    );
  
    try {
      const response = await axios.get('http://localhost:5000/employees/search', {
        params: filteredParams,
      });
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setSearchError('Error fetching employee data. Please try again later.');
      setShowSearchResults(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  // Initialize form for creating a new employee
  const handleCreate = () => {
    setEditMode(true);
    setCurrentEmployee(null);
    setFormData({
      name: '',
      role: 'Staff',
      shift_timings: ''
    });
  };

  // Populate form for editing an existing employee
  const handleEdit = (employee) => {
    setEditMode(true);
    setCurrentEmployee(employee);
    setFormData({ 
      ...employee
    });
  };

  // Submit form to either create or update an employee
  const handleSubmit = async (e) => {
    e.preventDefault();
    let baseURL = '';
    let method = '';

    if (currentEmployee) {
      // Update existing employee
      baseURL = 'http://localhost:5000/employees/update';
      method = 'PUT';
    } else {
      // Create new employee
      baseURL = 'http://localhost:5000/employees/insert';
      method = 'POST';
    }

    // Convert formData into a URL query string since backend uses request.args
    const params = new URLSearchParams(formData).toString();
    const url = `${baseURL}?${params}`;

    try {
      const response = await fetch(url, { method: method });
      if (response.ok) {
        const result = await response.json();
        console.log(`${currentEmployee ? 'Update' : 'Creation'} successful:`, result);
        alert(`${currentEmployee ? 'Employee updated' : 'Employee created'} successfully!`);
        fetchData();
        setEditMode(false);
        setCurrentEmployee(null);
      } else {
        const errorData = await response.json();
        console.error(`Error ${currentEmployee ? 'updating' : 'creating'} employee:`, errorData);
        alert(`Error ${currentEmployee ? 'updating' : 'creating'} employee: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process employee action. Please check console for details.');
    }
  };

  // Delete employee using the delete endpoint
  const handleDelete = async (employee) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const url = `http://localhost:5000/employees/delete?employee_id=${employee.employee_id}`;
        const response = await fetch(url, { method: 'DELETE' });
        if (response.ok) {
          fetchData();
        } else {
          console.error('Error deleting employee');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  // Render the employees table
  const renderEmployeesTable = (employeesData) => {
    return (
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Shift Timings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employeesData.map((employee, index) => (
              <tr
                key={index}
                className={currentEmployee?.employee_id === employee.employee_id ? 'selected-row' : ''}
                onClick={() => setCurrentEmployee(employee)}
              >
                <td>
                  <input
                    type="radio"
                    name="selectedEmployee"
                    checked={currentEmployee?.employee_id === employee.employee_id}
                    onChange={() => setCurrentEmployee(employee)}
                  />
                </td>
                <td>{employee.employee_id}</td>
                <td>{employee.name}</td>
                <td>{employee.role}</td>
                <td>{employee.shift_timings}</td>
                <td className="actions-cell">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(employee);
                    }}
                    className="btn-edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(employee);
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
        <h3>EMPLOYEE MANAGEMENT</h3>
        <div className="action-buttons">
          <button
            onClick={() => handleEdit(currentEmployee)}
            className="btn-update"
            disabled={!currentEmployee}
          >
            <FaEdit /> Update Selected Employee
          </button>
          <button onClick={handleCreate} className="btn-primary">
            <FaPlus /> Add a New Employee
          </button>
        </div>
      </div>

      {/* Search Employees Form */}
      <div className="search-employees-container">
        <h4>Search Employees</h4>
        <form onSubmit={handleSearchEmployees} className="search-form">
          <div className="form-group">
            <label htmlFor="employee_id">Employee ID:</label>
            <input
              type="text"
              id="employee_id"
              name="employee_id"
              value={searchParams.employee_id}
              onChange={handleSearchChange}
              placeholder="e.g., 1001"
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
              placeholder="e.g., John Doe"
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              name="role"
              value={searchParams.role}
              onChange={handleSearchChange}
            >
              <option value="">--Select--</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
              <option value="Technician">Technician</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Security">Security</option>
              <option value="Authority">Authority</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="shift_timings">Shift Timings:</label>
            <input
              type="text"
              id="shift_timings"
              name="shift_timings"
              value={searchParams.shift_timings}
              onChange={handleSearchChange}
              placeholder="e.g., 9AM-5PM"
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
                Show All Employees
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
            renderEmployeesTable(searchResults)
          ) : (
            <p>No employees found matching your criteria.</p>
          )}
        </>
      ) : loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading employees...</p>
        </div>
      ) : data.length > 0 ? (
        renderEmployeesTable(data)
      ) : (
        <p>No employees available.</p>
      )}

      {/* Form Modal for Editing/Creating */}
      {editMode && (
        <div className="form-modal">
          <div className="form-content">
            <h2>{currentEmployee ? 'Edit Employee' : 'Create Employee'}</h2>
            <form onSubmit={handleSubmit}>
              {currentEmployee && (
                <div className="form-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={(e) =>
                      setFormData({ ...formData, employee_id: e.target.value })
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
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  required
                >
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                  <option value="Technician">Technician</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Security">Security</option>
                  <option value="Authority">Authority</option>
                </select>
              </div>
              <div className="form-group">
                <label>Shift Timings</label>
                <input
                  type="text"
                  name="shift_timings"
                  value={formData.shift_timings}
                  onChange={(e) =>
                    setFormData({ ...formData, shift_timings: e.target.value })
                  }
                  required
                  placeholder="e.g., 9AM-5PM"
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

export default EmployeeTab;