import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaUser, FaCalendarAlt, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import { MdBusiness } from 'react-icons/md';
import { dash, useIsMobile } from '../styles/ds';

const entityIcons: Record<string, React.ReactElement> = {
  profile: <FaUser />, facility: <MdBusiness />, bookings: <FaCalendarAlt />,
};

const entityLabels: Record<string, string> = {
  profile: 'Profile', facility: 'Facility', bookings: 'Bookings',
};

const entitySchemas: Record<string, { fields: { name: string; type: string; editable: boolean }[]; endpoint: string }> = {
  profile:  { fields: [{ name: 'Employee_Id', type: 'number', editable: false }, { name: 'Name', type: 'text', editable: true }, { name: 'Role', type: 'text', editable: false }, { name: 'Shift_Timings', type: 'text', editable: true }], endpoint: 'employees/search' },
  facility: { fields: [{ name: 'Facility_Id', type: 'number', editable: false }, { name: 'Name', type: 'text', editable: false }, { name: 'Type', type: 'text', editable: false }, { name: 'Location', type: 'text', editable: false }, { name: 'Contact_No', type: 'tel', editable: false }, { name: 'Opening_Hours', type: 'text', editable: false }, { name: 'Manager_Id', type: 'number', editable: false }], endpoint: 'facilities/search' },
  bookings: { fields: [{ name: 'Booking_Id', type: 'number', editable: false }, { name: 'Facility_Id', type: 'number', editable: false }, { name: 'Aadhaar_No', type: 'text', editable: false }, { name: 'Date_Time', type: 'datetime-local', editable: false }, { name: 'Payment_Status', type: 'text', editable: false }], endpoint: 'bookings/search' },
};

const EmployeeHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [logoutHov, setLogoutHov] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const schema = entitySchemas[activeTab];
      if (schema?.endpoint) {
        const res = await fetch(`http://localhost:5000/${schema.endpoint}`);
        const result = await res.json();
        setData(Array.isArray(result) ? result : [result]);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleEdit = () => { setEditMode(true); setCurrentItem(data[0] || {}); setFormData({ ...data[0] }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams(formData).toString();
      const res = await fetch(`http://localhost:5000/employees/update?${params}`, { method: 'PUT' });
      if (res.ok) { fetchData(); setEditMode(false); }
    } catch (err) { console.error(err); }
  };

  const renderProfile = () => {
    if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading profile...</p></div>;
    if (data.length === 0) return <div className="empty-state"><p>Could not load profile information.</p></div>;
    const profileData = data[0];
    const schema = entitySchemas.profile;
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h3>Your Profile</h3>
          <button className="btn-edit" onClick={handleEdit}><FaEdit /> Edit Profile</button>
        </div>
        <div className="profile-details">
          {schema.fields.map(field => (
            <div key={field.name} className="profile-item">
              <label>{field.name.replace(/_/g, ' ')}:</label>
              <span>{profileData[field.name.toLowerCase()]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading data...</p></div>;
    const schema = entitySchemas[activeTab];
    if (!schema || data.length === 0) return <div className="empty-state"><p>No {entityLabels[activeTab]} data available.</p></div>;
    return (
      <div className="table-container">
        <div className="table-header"><h3>{entityLabels[activeTab].toUpperCase()}</h3></div>
        <div className="table-responsive">
          <table>
            <thead><tr>{schema.fields.map(f => <th key={f.name}>{f.name.replace(/_/g, ' ')}</th>)}</tr></thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={i}>{schema.fields.map(f => <td key={f.name}>{f.type === 'datetime-local' ? new Date(item[f.name.toLowerCase()]).toLocaleString() : item[f.name.toLowerCase()]}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    const schema = entitySchemas.profile;
    return (
      <div className="form-modal">
        <div className="form-content">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            {schema.fields.filter(f => f.editable).map(field => (
              <div key={field.name} className="form-group">
                <label>{field.name.replace(/_/g, ' ')}</label>
                <input type={field.type} name={field.name} value={formData[field.name] || ''} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })} />
              </div>
            ))}
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':  return renderProfile();
      case 'facility': return renderTable();
      case 'bookings': return renderTable();
      default: return <div>Select an option from the sidebar.</div>;
    }
  };

  return (
    <div style={dash.wrapper}>
      {isMobile && (
        <header style={dash.mobileHeader}>
          <button style={dash.menuBtn} onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <h1 style={dash.mobileTitle}>{entityLabels[activeTab]}</h1>
        </header>
      )}

      {isMobile && sidebarOpen && (
        <div style={dash.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <nav style={dash.sidebar(isMobile, sidebarOpen)}>
        <div style={dash.sidebarHead}>
          <h2 style={dash.sidebarH2}>Employee Portal</h2>
        </div>
        <div style={dash.sidebarBody}>
          <ul style={dash.navList}>
            {Object.keys(entitySchemas).map(key => (
              <li
                key={key}
                style={dash.navItem(activeTab === key, hovered === key)}
                onClick={() => { setActiveTab(key); setSidebarOpen(false); }}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>{entityIcons[key]}</span>
                {entityLabels[key]}
              </li>
            ))}
          </ul>
          <div style={dash.sidebarFooter}>
            <div style={dash.profileRow}>
              <div style={dash.avatar}><FaUser size={20} /></div>
              <div style={dash.profileMeta}>
                <span style={dash.profileName}>Employee User</span>
                <span style={dash.profileRole}>Staff</span>
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
        {renderContent()}
      </main>

      {editMode && activeTab === 'profile' && renderForm()}
    </div>
  );
};

export default EmployeeHome;
