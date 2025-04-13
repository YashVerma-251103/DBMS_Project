import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import { FaBars, FaTimes, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import { MdPeople, MdBusiness, MdEvent, MdFeedback,
  MdAttachMoney, MdInventory, MdSchedule } from 'react-icons/md';
import "./ManagerHome.css"; // Import the CSS file

const ManagerHome = () => {
  const [activeTab, setActiveTab] = useState('facility');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const managerId = 'MANAGER_EMPLOYEE_ID'; // Replace with actual manager identification

  const entityIcons = {
    facility: <MdBusiness />,
    employees: <MdPeople />,
    bookings: <MdEvent />,
    feedback: <MdFeedback />,
    revenue: <MdAttachMoney />,
    inventory: <MdInventory />,
    staff_schedule: <MdSchedule />,
  };

  const entitySchemas = {
    facility: {
      fields: [
        { name: 'Facility_Id', type: 'number', editable: false },
        { name: 'Name', type: 'text', editable: true },
        { name: 'Type', type: 'select', options: ['Gym', 'Lounge', 'Restaurant', 'Shop', 'Other'], editable: true },
        { name: 'Location', type: 'text', editable: true },
        { name: 'Contact_No', type: 'tel', editable: true },
        { name: 'Opening_Hours', type: 'text', editable: true },
        { name: 'Manager_Id', type: 'number', editable: false }, // Manager ID is read-only here
      ],
      endpoint: `facilities?Manager_Id=${managerId}` // Filter by manager
    },
    employees: {
      fields: [
        { name: 'Employee_Id', type: 'number', editable: false },
        { name: 'Name', type: 'text', editable: true },
        { name: 'Role', type: 'select', options: ['Staff', 'Technician', 'Cleaner', 'Security'], editable: true },
        { name: 'Shift_Timings', type: 'text', editable: true },
        { name: 'Facility_Id', type: 'number', editable: false }, // Facility ID is read-only
      ],
      endpoint: 'employees'
    },
    bookings: {
      fields: [
        { name: 'Booking_Id', type: 'number', editable: false },
        { name: 'Facility_Id', type: 'number', editable: false },
        { name: 'Aadhaar_No', type: 'text', editable: false },
        { name: 'Employee_Id', type: 'number', editable: true },
        { name: 'Date_Time', type: 'datetime-local', editable: true },
        { name: 'Payment_Status', type: 'select', options: ['Pending', 'Completed', 'Cancelled'], editable: true }
      ],
      endpoint: 'bookings'
    },
    feedback: {
      fields: [
        { name: 'Feedback_Id', type: 'number', editable: false },
        { name: 'Facility_Id', type: 'number', editable: false },
        { name: 'Aadhaar_No', type: 'text', editable: false },
        { name: 'Manager_Id', type: 'number', editable: false },
        { name: 'Date_Time', type: 'datetime-local', editable: false },
        { name: 'Rating', type: 'number', editable: false },
        { name: 'Comments', type: 'text', editable: false },
        { name: 'Response', type: 'text', editable: true }, // Managers can respond
      ],
      endpoint: 'feedback'
    },
    revenue: {
      fields: [
        { name: 'Financial_Year', type: 'number', editable: false },
        { name: 'Facility_Id', type: 'number', editable: false },
        { name: 'Monthly_Revenue', type: 'number', editable: false },
        { name: 'Yearly_Revenue', type: 'number', editable: false }
      ],
      endpoint: 'revenue'
    },
    inventory: {
      fields: [
        { name: 'Inventory_Id', type: 'number', editable: false },
        { name: 'Facility_Id', type: 'number', editable: false },
        { name: 'Item_Name', type: 'text', editable: true },
        { name: 'Quantity', type: 'number', editable: true },
        { name: 'Supplier', type: 'text', editable: true }
      ],
      endpoint: 'inventory'
    },
    staff_schedule: {
      fields: [
        { name: 'Schedule_Id', type: 'number', editable: false },
        { name: 'Employee_Id', type: 'number', editable: true },
        { name: 'Facility_Id', type: 'number', editable: false },
        { name: 'Shift_Date', type: 'date', editable: true },
        { name: 'Shift_Start', type: 'time', editable: true },
        { name: 'Shift_End', type: 'time', editable: true },
        { name: 'Task_Description', type: 'text', editable: true },
        { name: 'Created_At', type: 'datetime-local', editable: false }
      ],
      endpoint: 'staff_schedule'
    },
  };

  const [managerFacilityId, setManagerFacilityId] = useState(null);

  useEffect(() => {
    // Fetch the manager's facility ID on component mount
    const fetchManagerFacility = async () => {
      try {
        const response = await fetch(`http://localhost:5000/facilities?Manager_Id=${managerId}`);
        const result = await response.json();
        if (result && result.length > 0) {
          setManagerFacilityId(result[0].Facility_Id); // Assuming one manager per facility
        } else {
          console.log("No facility found for this manager.");
          // Optionally handle the case where no facility is assigned
        }
      } catch (error) {
        console.error("Error fetching manager's facility:", error);
      }
    };

    fetchManagerFacility();
  }, [managerId]);

  useEffect(() => {
    if (managerFacilityId) {
      fetchData();
    }
  }, [activeTab, managerFacilityId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const schema = entitySchemas[activeTab];
      if (schema && schema.endpoint) {
        let endpoint = schema.endpoint;
        // Replace placeholders with the actual facility ID
        endpoint = endpoint.replace('/* Fetch Facility ID of the manager */', managerFacilityId);
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
    // Set Facility_Id for new employees, bookings, inventory, staff_schedule if applicable
    if (['employees', 'bookings', 'inventory', 'staff_schedule'].includes(activeTab)) {
      initialFormData.Facility_Id = managerFacilityId;
    }
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const schema = entitySchemas[activeTab];
      if (!schema || !schema.endpoint) return;
      let endpoint = schema.endpoint.split('?')[0]; // Remove query parameters for submission
      let url = `http://localhost:5000/${endpoint}`;
      let method = 'POST';

      if (currentItem) {
        const primaryKeys = schema.fields.filter(f => !f.editable);
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
          <h2>{currentItem ? 'Edit' : 'Create'} {activeTab.replace('_', ' ')}</h2>
          <form onSubmit={handleSubmit}>
            {schema.fields.map((field) => {
              if (!field.editable && !currentItem && activeTab !== 'facility') return null;
              if (activeTab === 'facility' && field.name === 'Manager_Id') return null; // Don't allow editing Manager_Id

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
        {activeTab !== 'revenue' && activeTab !== 'facility' && (
          <button onClick={handleCreate} className="btn-primary">
            Create New
          </button>
        )}
      </div>
    );

    const schema = entitySchemas[activeTab];
    if (!schema) return null;

    return (
      <div className="table-container">
        <div className="table-header">
          <h3>{activeTab.replace('_', ' ').toUpperCase()} MANAGEMENT</h3>
          {activeTab !== 'revenue' && activeTab !== 'facility' && (
            <button onClick={handleCreate} className="btn-primary">
              Create New
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
                {activeTab !== 'revenue' && <th>Actions</th>}
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
                  {activeTab !== 'revenue' && (
                    <td className="actions-cell">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn-edit"
                      >
                        <FaEdit />
                      </button>
                      {activeTab !== 'facility' && (
                        // Optionally add delete functionality where appropriate
                        // <button
                        //   onClick={() => handleDelete(item)}
                        //   className="btn-delete"
                        // >
                        //   <FaTrash />
                        // </button>
                        null
                      )}
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

  return (
    <div className={`manager-dashboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
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
          <h2>Manager Portal</h2>
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
                <MdPeople size={24} />
              </div>
              <div className="profile-details">
                <span className="profile-name">Manager User</span> {/* Replace with actual name */}
                <span className="profile-role">Facility Manager</span>
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
        {renderTable()}
      </div>

      {/* Form Modal */}
      {editMode && renderForm()}
    </div>
  );
};

export default ManagerHome;