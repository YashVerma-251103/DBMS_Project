import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import { FaBars, FaTimes, FaUser, FaCalendarAlt, FaBoxOpen, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import { MdBusiness } from 'react-icons/md';
import "./EmployeeHome.css"; // Import the CSS file

const EmployeeHome = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const employeeId = 'EMPLOYEE_ID'; // Replace with actual employee identification (e.g., from context or local storage)

  const entityIcons = {
    profile: <FaUser />,
    facility: <MdBusiness />,
    bookings: <FaCalendarAlt />,
    inventory: <FaBoxOpen />,
  };

  const entitySchemas = {
    profile: {
      fields: [
        { name: 'Employee_Id', type: 'number', editable: false },
        { name: 'Name', type: 'text', editable: true },
        { name: 'Role', type: 'text', editable: false },
        { name: 'Shift_Timings', type: 'text', editable: true },
        { name: 'Facility_Id', type: 'number', editable: false },
        // Add other profile fields as needed
      ],
      endpoint: `employees/${employeeId}`
    },
    facility: {
      fields: [
        { name: 'Facility_Id', type: 'number', editable: false },
        { name: 'Name', type: 'text', editable: false },
        { name: 'Type', type: 'text', editable: false },
        { name: 'Location', type: 'text', editable: false },
        { name: 'Contact_No', type: 'tel', editable: false },
        { name: 'Opening_Hours', type: 'text', editable: false },
        { name: 'Manager_Id', type: 'number', editable: false }
      ],
      endpoint: `employees/${employeeId}/facility` // Assuming an endpoint to get the employee's facility
    },
    bookings: {
      fields: [
        { name: 'Booking_Id', type: 'number', editable: false },
        { name: 'Facility_Id', type: 'number', editable: false },
        { name: 'Aadhaar_No', type: 'text', editable: false },
        { name: 'Date_Time', type: 'datetime-local', editable: false },
        { name: 'Payment_Status', type: 'text', editable: false }
      ],
      endpoint: `bookings?Employee_Id=${employeeId}` // Filter bookings assigned to the employee
    },
    inventory: {
      fields: [
        { name: 'Inventory_Id', type: 'number', editable: false },
        { name: 'Item_Name', type: 'text', editable: false },
        { name: 'Quantity', type: 'number', editable: false },
        { name: 'Supplier', type: 'text', editable: false }
      ],
      endpoint: `employees/${employeeId}/inventory` // Assuming an endpoint to get inventory of the employee's facility
    },
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const schema = entitySchemas[activeTab];
      if (schema && schema.endpoint) {
        const response = await fetch(`http://localhost:5000/${schema.endpoint}`);
        const result = await response.json();
        setData(Array.isArray(result) ? result : [result]); // Handle single object responses
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

  const handleEdit = () => {
    setEditMode(true);
    setCurrentItem(data[0] || {}); // Assuming profile is a single object
    setFormData(data[0] || {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const schema = entitySchemas[activeTab];
      if (!schema || !schema.endpoint) return;
      const url = `http://localhost:5000/${schema.endpoint}`;
      const method = 'PUT'; // Assuming profile update uses PUT

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
        console.error('Error saving profile');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navigate = useNavigate();

  const renderForm = () => {
    const schema = entitySchemas[activeTab];
    if (!schema) return null;
    return (
      <div className="form-modal">
        <div className="form-content">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            {schema.fields.map((field) => {
              if (!field.editable) return null;
              return (
                <div key={field.name} className="form-group">
                  <label>{field.name.replace('_', ' ')}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                  />
                </div>
              );
            })}
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Save
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

  const renderTable = () => {
    if (loading) return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading data...</p>
      </div>
    );

    if (data.length === 0) return (
      <div className="empty-state">
        <p>No {activeTab.replace('_', ' ')} data available.</p>
      </div>
    );

    const schema = entitySchemas[activeTab];
    if (!schema) return null;

    return (
      <div className="table-container">
        <div className="table-header">
          <h3>{activeTab.replace('_', ' ').toUpperCase()}</h3>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                {schema.fields.map(field => (
                  <th key={field.name}>{field.name.replace('_', ' ')}</th>
                ))}
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
        <p>Loading profile...</p>
      </div>
    );

    if (data.length === 0) return (
      <div className="empty-state">
        <p>Could not load profile information.</p>
      </div>
    );

    const profileData = data[0];
    const schema = entitySchemas.profile;

    return (
      <div className="profile-container">
        <div className="profile-header">
          <h3>Your Profile</h3>
          <button className="btn-edit" onClick={handleEdit}>
            <FaEdit /> Edit Profile
          </button>
        </div>
        <div className="profile-details">
          {schema.fields.map(field => (
            <div key={field.name} className="profile-item">
              <label>{field.name.replace('_', ' ')}:</label>
              <span>{profileData[field.name]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfile();
      case 'facility':
        return renderTable();
      case 'bookings':
        return renderTable();
      case 'inventory':
        return renderTable();
      default:
        return <div>Select an option from the sidebar.</div>;
    }
  };

  return (
    <div className={`employee-dashboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
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
          <h2>Employee Portal</h2>
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
                <FaUser size={24} />
              </div>
              <div className="profile-details">
                <span className="profile-name">Employee User</span> {/* Replace with actual name */}
                <span className="profile-role">Staff</span> {/* Replace with actual role */}
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
        {renderContent()}
      </div>

      {/* Form Modal */}
      {editMode && activeTab === 'profile' && renderForm()}
    </div>
  );
};

export default EmployeeHome;