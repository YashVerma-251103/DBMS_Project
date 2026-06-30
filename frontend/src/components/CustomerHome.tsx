import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { MdBusiness, MdEvent, MdPerson } from 'react-icons/md';
import { dash, useIsMobile } from '../styles/ds';

import Facilities from './customer_tab/Facilities';
import Bookings from './customer_tab/Booking';
import Profile from './customer_tab/Profile';

const tabs = [
  { key: 'facilities', label: 'Facilities', icon: <MdBusiness size={18} />, Component: Facilities },
  { key: 'bookings',   label: 'Bookings',   icon: <MdEvent    size={18} />, Component: Bookings },
  { key: 'profile',    label: 'Profile',    icon: <MdPerson   size={18} />, Component: Profile },
];

const CustomerHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState('facilities');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [logoutHov, setLogoutHov] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const active = tabs.find(t => t.key === activeTab)!;

  return (
    <div style={dash.wrapper}>
      {isMobile && (
        <header style={dash.mobileHeader}>
          <button style={dash.menuBtn} onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <h1 style={dash.mobileTitle}>{active.label}</h1>
        </header>
      )}

      {isMobile && sidebarOpen && (
        <div style={dash.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <nav style={dash.sidebar(isMobile, sidebarOpen)}>
        <div style={dash.sidebarHead}>
          <h2 style={dash.sidebarH2}>Customer Portal</h2>
        </div>
        <div style={dash.sidebarBody}>
          <ul style={dash.navList}>
            {tabs.map(({ key, label, icon }) => (
              <li
                key={key}
                style={dash.navItem(activeTab === key, hovered === key)}
                onClick={() => { setActiveTab(key); setSidebarOpen(false); }}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
              >
                {icon} {label}
              </li>
            ))}
          </ul>
          <div style={dash.sidebarFooter}>
            <div style={dash.profileRow}>
              <div style={dash.avatar}><MdPerson size={22} /></div>
              <div style={dash.profileMeta}>
                <span style={dash.profileName}>Customer User</span>
                <span style={dash.profileRole}>Guest</span>
              </div>
            </div>
            <button
              style={dash.logoutBtn(logoutHov)}
              onMouseEnter={() => setLogoutHov(true)}
              onMouseLeave={() => setLogoutHov(false)}
              onClick={() => navigate('/LoginSignUp', { replace: true })}
            >
              <FaSignOutAlt size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main style={dash.main(isMobile)}>
        <active.Component />
      </main>
    </div>
  );
};

export default CustomerHome;
