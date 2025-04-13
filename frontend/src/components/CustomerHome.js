import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import { FaBars, FaTimes, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import { MdBusiness, MdEvent, MdReportProblem, MdPerson } from 'react-icons/md';
import "./CustomerHome.css";

const CustomerHome = () => {
  const [activeTab, setActiveTab] = useState('facilities');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const customerId = 'CUSTOMER_AADHAAR'; // Replace with actual customer identification

  const entityIcons = {
    facilities: <MdBusiness />,
    bookings: <MdEvent />,
    incidents: <MdReportProblem />,
    profile: <MdPerson />,
  };

  const entitySchemas = {
    facilities: {
      fields: [
        { name: 'Facility_Id', type: 'number', editable: false },
        { name: 'Name', type: 'text', editable: false },
        { name: 'Type', type: 'text', editable: false },
        { name: 'Location', type: 'text', editable: false },
        { name: 'Contact_No', type: 'tel', editable: false },
        { name: 'Opening_Hours', type: 'text', editable: false },
      ],
      endpoint: 'facilities'
    },
    bookings: {
      fields: [
        { name: 'Booking_Id', type: 'number', editable: false },
        { name: 'Facility_Id', type: 'number', editable: false },
        { name: 'Date_Time', type: 'datetime-local', editable: true },
        { name: 'Payment_Status', type: 'select', options: ['Pending', 'Completed', 'Cancelled'], editable: true }
      ],
      endpoint: `bookings?Aadhaar_No=${customerId}` // Filter bookings by customer
    },
    incidents: {
      fields: [
        { name: 'Incident_Id', type: 'number', editable: false },
        { name: 'Facility_Id', type: 'number', editable: true },
        { name: 'Description', type: 'text', editable: true },
        { name: 'Reported_At', type: 'datetime-local', editable: false },
        { name: 'Status', type: 'select', options: ['Reported', 'In Progress', 'Resolved'], editable: false },
        { name: 'Resolved_At', type: 'datetime-local', editable: false }
      ],
      endpoint: 'incidents'
    },
    profile: {
      fields: [
        { name: 'Aadhaar_No', type: 'text', editable: true },
        { name: 'Customer_Name', type: 'text', editable: true },
        { name: 'Age', type: 'number', editable: true },
        { name: 'Contact_No', type: 'tel', editable: true }
      ],
      endpoint: `customers/${customerId}` // Fetch specific customer data
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = entitySchemas[activeTab]?.endpoint;
      if (endpoint) {
        const response = await fetch(`http://localhost:5000/${endpoint}`);
        const result = await response.json();
        setData(result);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setCurrentItem(item);
    setFormData(item);
  };

  const handleCreate = () => {
    setEditMode(true);
    setCurrentItem(null);
    const initialFormData = {};
    entitySchemas[activeTab].fields.forEach(field => {
      if (field.editable) {
        initialFormData[field.name] = '';
      }
    });
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = entitySchemas[activeTab].endpoint.split('?')[0]; // Remove query parameters for submission
      let url = `http://localhost:5000/${endpoint}`;
      let method = 'POST';

      if (currentItem) {
        const primaryKeys = entitySchemas[activeTab].fields.filter(f => !f.editable);
        if (primaryKeys.length === 1) {
          url += `/${currentItem[primaryKeys[0].name]}`;
          method = 'PUT';
        } else {
          console.error('Composite primary keys not fully implemented');
          return;
        }
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchData();
        setEditMode(false);
      } else {
        console.error('Error saving data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const primaryKeys = entitySchemas[activeTab].fields.filter(f => !f.editable);
        if (primaryKeys.length === 1) {
          const endpoint = entitySchemas[activeTab].endpoint.split('?')[0];
          const response = await fetch(`http://localhost:5000/${endpoint}/${item[primaryKeys[0].name]}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            fetchData();
          } else {
            console.error('Error deleting data');
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderForm = () => {
    const schema = entitySchemas[activeTab];
    return (
      <div className="form-modal">
        <div className="form-content">
          <h2>{currentItem ? 'Edit' : 'Report'} {activeTab.replace('_', ' ')}</h2>
          <form onSubmit={handleSubmit}>
            {schema.fields.map((field) => {
              if (!field.editable && !currentItem && activeTab !== 'incidents' && activeTab !== 'profile') return null;
              if (activeTab === 'profile' && !field.editable) return (
                <div key={field.name} className="form-group">
                  <label>{field.name.replace('_', ' ')}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    disabled
                  />
                </div>
              );

              if (field.type === 'select') {
                return (
                  <div key={field.name} className="form-group">
                    <label>{field.name.replace('_', ' ')}</label>
                    <select
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      disabled={!field.editable}
                    >
                      {field.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                );
              } else {
                return (
                  <div key={field.name} className="form-group">
                    <label>{field.name.replace('_', ' ')}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      disabled={!field.editable}
                    />
                  </div>
                );
              }
            })}
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {currentItem ? 'Save' : activeTab === 'incidents' ? 'Report Incident' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const navigate = useNavigate();

  const renderTable = () => {
    if (loading) return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading data...</p>
      </div>
    );

    if (data.length === 0 && activeTab !== 'facilities') return (
      <div className="empty-state">
        <p>No {activeTab.replace('_', ' ')} available.</p>
        {activeTab === 'incidents' && (
          <button onClick={handleCreate} className="btn-primary">
            Report New Incident
          </button>
        )}
      </div>
    );

    const schema = entitySchemas[activeTab];
    return (
      <div className="table-container">
        <div className="table-header">
          <h3>{activeTab.replace('_', ' ').toUpperCase()}</h3>
          {activeTab === 'incidents' && (
            <button onClick={handleCreate} className="btn-primary">
              Report New Incident
            </button>
          )}
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                {schema.fields.map(field => (
                  <th key={field.name}>{field.name.replace('_', ' ')}</th>
                ))}
                {activeTab === 'bookings' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  {schema.fields.map(field => (
                    <td key={`${index}-${field.name}`}>
                      {field.type === 'datetime-local' || field.type === 'date' || field.type === 'time'
                        ? new Date(item[field.name]).toLocaleString()
                        : item[field.name]}
                    </td>
                  ))}
                  {activeTab === 'bookings' && (
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn-edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="btn-delete"
                      >
                        <FaTimes />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    if (loading) return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile data...</p>
      </div>
    );

    if (!data) return <div className="empty-state"><p>Could not load profile information.</p></div>;

    const schema = entitySchemas.profile;
    return (
      <div className="profile-container">
        <h2>Your Profile</h2>
        <form onSubmit={handleSubmit}>
          {schema.fields.map(field => (
            <div key={field.name} className="form-group">
              <label>{field.name.replace('_', ' ')}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || data[field.name] || ''}
                onChange={handleInputChange}
                disabled={!field.editable}
              />
            </div>
          ))}
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className={`customer-dashboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        <h1 className="mobile-title">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}
        </h1>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Customer Portal</h2>
          <button
            className="sidebar-close"
            onClick={toggleSidebar}
            style={{ display: 'none' }}
          >
            <FaTimes />
          </button>
        </div>

        <div className="sidebar-content">
          <ul>
            {Object.keys(entitySchemas).map(entity => (
              <li
                key={entity}
                className={activeTab === entity ? 'active' : ''}
                onClick={() => {
                  setActiveTab(entity);
                  setSidebarOpen(false);
                  if (entity === 'profile') {
                    fetchData(); // Fetch profile data when profile tab is clicked
                  }
                }}
              >
                <span className="entity-icon">{entityIcons[entity]}</span>
                <span className="entity-name">
                  {entity.charAt(0).toUpperCase() + entity.slice(1).replace('_', ' ')}
                </span>
              </li>
            ))}
          </ul>

          {/* Profile and Logout */}
          <div className="sidebar-footer">
            <div className="profile-info">
              <div className="profile-icon">
                <MdPerson size={24} />
              </div>
              <div className="profile-details">
                <span className="profile-name">Customer User</span> {/* Replace with actual name */}
                <span className="profile-role">Guest</span>
              </div>
            </div>
            <button className="logout-btn" onClick={() => navigate("/LoginSignUp", { replace: true })}>
              <FaSignOutAlt size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'profile' ? renderProfile() : renderTable()}
      </div>

      {/* Form Modal */}
      {editMode && renderForm()}
    </div>
  );
};

export default CustomerHome;