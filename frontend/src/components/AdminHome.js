import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { MdPeople } from 'react-icons/md';
import "./AdminHome.css";

// Import your tab components (for now, we include flights as an example)
// You can add more imports once you build those components.
import FlightsTab from './admin_tab/FlightsTab';
import FacilityTab from './admin_tab/FacilityTab';
import BookingsTab from './admin_tab/BookingsTab';
import IncidentTab from './admin_tab/IncidentTab';
import RevenueTab from './admin_tab/RevenueTab';
// import EmployeesTab from './EmployeesTab';

const tabComponents = {
  flights: FlightsTab,
  facility: FacilityTab,
  bookings: BookingsTab,
  incidents: IncidentTab,
  revenue: RevenueTab,
  // employees: EmployeesTab,
  // Add additional tab mappings here
};

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState('flights');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderTabContent = () => {
    const ActiveTabComponent = tabComponents[activeTab];
    return ActiveTabComponent ? <ActiveTabComponent /> : <div>Tab content not available</div>;
  };

  return (
    <div className={`admin-dashboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
        <h1 className="mobile-title">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h1>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Airport Admin</h2>
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
            {Object.keys(tabComponents).map(tab => (
              <li
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => {
                  setActiveTab(tab);
                  setSidebarOpen(false);
                }}
              >
                <span className="entity-name">
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
              </li>
            ))}
          </ul>
          {/* Profile and Logout Section */}
          <div className="sidebar-footer">
            <div className="profile-info">
              <div className="profile-icon">
                <MdPeople size={24} />
              </div>
              <div className="profile-details">
                <span className="profile-name">Admin User</span>
                <span className="profile-role">Administrator</span>
              </div>
            </div>
            <button
              className="logout-btn"
              onClick={() => navigate("/LoginSignUp", { replace: true })}
            >
              <FaSignOutAlt size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminHome;
