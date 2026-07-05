import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { MdPeople } from 'react-icons/md';
import { dash, useIsMobile } from '../styles/ds';
import { AIRPORT } from '../config/airport';

import FlightsTab from './admin_tab/FlightsTab';
import FacilityTab from './admin_tab/FacilityTab';
import InventoryTab from './admin_tab/InventoryTab';
import BookingsTab from './admin_tab/BookingsTab';
import IncidentTab from './admin_tab/IncidentTab';
import FeedbackTab from './admin_tab/FeedbackTab';
import RevenueTab from './admin_tab/RevenueTab';
import EmployeeTab from './admin_tab/EmployeeTab';
import StaffScheduleTab from './admin_tab/Staff_ScheduleTab';

const tabs: Record<string, { label: string; Component: React.FC }> = {
  flights:        { label: 'Flights',       Component: FlightsTab },
  facility:       { label: 'Facility',       Component: FacilityTab },
  inventory:      { label: 'Inventory',      Component: InventoryTab },
  bookings:       { label: 'Bookings',       Component: BookingsTab },
  incidents:      { label: 'Incidents',      Component: IncidentTab },
  feedback:       { label: 'Feedback',       Component: FeedbackTab },
  revenue:        { label: 'Revenue',        Component: RevenueTab },
  employee:       { label: 'Employee',       Component: EmployeeTab },
  staff_schedule: { label: 'Staff Schedule', Component: StaffScheduleTab },
};

const AdminHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState('flights');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [logoutHov, setLogoutHov] = useState(false);
  const [backHov, setBackHov] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // RequireAuth already guarantees a valid admin session by the time this renders.
  let currentUser: { name?: string } | null = null;
  try { currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch { currentUser = null; }

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/', { replace: true });
  };

  const { Component: Active } = tabs[activeTab];

  return (
    <div style={dash.wrapper}>
      {isMobile && (
        <header style={dash.mobileHeader}>
          <button style={dash.menuBtn} onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <h1 style={dash.mobileTitle}>{tabs[activeTab].label}</h1>
        </header>
      )}

      {isMobile && sidebarOpen && (
        <div style={dash.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <nav style={dash.sidebar(isMobile, sidebarOpen)}>
        <div style={dash.sidebarHead}>
          <h2 style={dash.sidebarH2}>{AIRPORT.adminLabel}</h2>
          <button
            style={dash.backLink(backHov)}
            onMouseEnter={() => setBackHov(true)}
            onMouseLeave={() => setBackHov(false)}
            onClick={() => navigate('/')}
          >
            <FaHome size={13} /> Back to Landing
          </button>
        </div>
        <div style={dash.sidebarBody}>
          <ul style={dash.navList}>
            {Object.entries(tabs).map(([key, { label }]) => (
              <li
                key={key}
                style={dash.navItem(activeTab === key, hovered === key)}
                onClick={() => { setActiveTab(key); setSidebarOpen(false); }}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
              >
                {label}
              </li>
            ))}
          </ul>
          <div style={dash.sidebarFooter}>
            <div style={dash.profileRow}>
              <div style={dash.avatar}><MdPeople size={22} /></div>
              <div style={dash.profileMeta}>
                <span style={dash.profileName}>{currentUser?.name || 'Admin User'}</span>
                <span style={dash.profileRole}>Administrator</span>
              </div>
            </div>
            <button
              style={dash.logoutBtn(logoutHov)}
              onMouseEnter={() => setLogoutHov(true)}
              onMouseLeave={() => setLogoutHov(false)}
              onClick={handleLogout}
            >
              <FaSignOutAlt size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main style={dash.main(isMobile)}>
        <Active />
      </main>
    </div>
  );
};

export default AdminHome;
