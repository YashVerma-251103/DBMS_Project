import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import { MdPeople, MdBusiness, MdEvent, MdFeedback, MdAttachMoney, MdInventory, MdSchedule } from 'react-icons/md';
import { dash, useIsMobile } from '../styles/ds';

interface FieldDef { name: string; type: string; editable: boolean; options?: string[]; }
interface SchemaDef { fields: FieldDef[]; endpoint: string; }

const entityIcons: Record<string, React.ReactElement> = {
  facility: <MdBusiness />, employees: <MdPeople />, bookings: <MdEvent />,
  feedback: <MdFeedback />, revenue: <MdAttachMoney />, inventory: <MdInventory />, staff_schedule: <MdSchedule />,
};

const entityLabels: Record<string, string> = {
  facility: 'Facility', employees: 'Employees', bookings: 'Bookings',
  feedback: 'Feedback', revenue: 'Revenue', inventory: 'Inventory', staff_schedule: 'Staff Schedule',
};

const entitySchemas: Record<string, SchemaDef> = {
  facility:       { fields: [{ name: 'Facility_Id', type: 'number', editable: false }, { name: 'Name', type: 'text', editable: true }, { name: 'Type', type: 'select', options: ['Gym','Lounge','Restaurant','Shop','Other'], editable: true }, { name: 'Location', type: 'text', editable: true }, { name: 'Contact_No', type: 'tel', editable: true }, { name: 'Opening_Hours', type: 'text', editable: true }, { name: 'Manager_Id', type: 'number', editable: false }], endpoint: 'facilities/search' },
  employees:      { fields: [{ name: 'Employee_Id', type: 'number', editable: false }, { name: 'Name', type: 'text', editable: true }, { name: 'Role', type: 'select', options: ['Staff','Technician','Cleaner','Security'], editable: true }, { name: 'Shift_Timings', type: 'text', editable: true }], endpoint: 'employees/search' },
  bookings:       { fields: [{ name: 'Booking_Id', type: 'number', editable: false }, { name: 'Facility_Id', type: 'number', editable: false }, { name: 'Aadhaar_No', type: 'text', editable: false }, { name: 'Employee_Id', type: 'number', editable: true }, { name: 'Date_Time', type: 'datetime-local', editable: true }, { name: 'Payment_Status', type: 'select', options: ['Pending','Completed','Cancelled'], editable: true }], endpoint: 'bookings/search' },
  feedback:       { fields: [{ name: 'Feedback_Id', type: 'number', editable: false }, { name: 'Facility_Id', type: 'number', editable: false }, { name: 'Aadhaar_No', type: 'text', editable: false }, { name: 'Manager_Id', type: 'number', editable: false }, { name: 'Date_Time', type: 'datetime-local', editable: false }, { name: 'Rating', type: 'number', editable: false }, { name: 'Comments', type: 'text', editable: false }], endpoint: 'feedback/search' },
  revenue:        { fields: [{ name: 'Financial_Year', type: 'number', editable: false }, { name: 'Facility_Id', type: 'number', editable: false }, { name: 'Avg_Revenue', type: 'number', editable: false }], endpoint: 'revenue/calculate_avg' },
  staff_schedule: { fields: [{ name: 'Schedule_Id', type: 'number', editable: false }, { name: 'Employee_Id', type: 'number', editable: true }, { name: 'Facility_Id', type: 'number', editable: false }, { name: 'Shift_Date', type: 'date', editable: true }, { name: 'Shift_Start', type: 'time', editable: true }, { name: 'Shift_End', type: 'time', editable: true }, { name: 'Task_Description', type: 'text', editable: true }], endpoint: 'staff_schedule/search' },
};

const ManagerHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState('facility');
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
        setData(await res.json());
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleEdit = (item: any) => { setEditMode(true); setCurrentItem(item); setFormData({ ...item }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = entitySchemas[activeTab];
    if (!schema) return;
    const base = schema.endpoint.split('/')[0];
    const params = new URLSearchParams(formData).toString();
    const method = currentItem ? 'PUT' : 'POST';
    const action = currentItem ? 'update' : 'insert';
    try {
      const res = await fetch(`http://localhost:5000/${base}/${action}?${params}`, { method });
      if (res.ok) { fetchData(); setEditMode(false); }
    } catch (err) { console.error(err); }
  };

  const renderForm = () => {
    const schema = entitySchemas[activeTab];
    if (!schema) return null;
    return (
      <div className="form-modal">
        <div className="form-content">
          <h2>{currentItem ? 'Edit' : 'Create'} {entityLabels[activeTab] || activeTab}</h2>
          <form onSubmit={handleSubmit}>
            {schema.fields.map(field => {
              if (!field.editable && !currentItem) return null;
              return (
                <div key={field.name} className="form-group">
                  <label>{field.name.replace(/_/g, ' ')}</label>
                  {field.type === 'select' ? (
                    <select name={field.name} value={formData[field.name] || ''} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })} disabled={!field.editable}>
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} name={field.name} value={formData[field.name] || ''} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })} disabled={!field.editable} />
                  )}
                </div>
              );
            })}
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading data...</p></div>;
    const schema = entitySchemas[activeTab];
    if (!schema) return null;
    if (data.length === 0) return <div className="empty-state"><p>No {entityLabels[activeTab] || activeTab} data available.</p></div>;
    return (
      <div className="table-container">
        <div className="table-header">
          <h3>{(entityLabels[activeTab] || activeTab).toUpperCase()} MANAGEMENT</h3>
          {activeTab !== 'revenue' && activeTab !== 'facility' && activeTab !== 'feedback' && (
            <button onClick={() => { setEditMode(true); setCurrentItem(null); setFormData({}); }} className="btn-primary">Create New</button>
          )}
        </div>
        <div className="table-responsive">
          <table>
            <thead><tr>{schema.fields.map(f => <th key={f.name}>{f.name.replace(/_/g, ' ')}</th>)}{activeTab !== 'revenue' && <th>Actions</th>}</tr></thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={i}>
                  {schema.fields.map(f => <td key={f.name}>{f.type === 'datetime-local' ? new Date(item[f.name.toLowerCase()]).toLocaleString() : item[f.name.toLowerCase()]}</td>)}
                  {activeTab !== 'revenue' && <td className="actions-cell"><button onClick={() => handleEdit(item)} className="btn-edit"><FaEdit /></button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div style={dash.wrapper}>
      {isMobile && (
        <header style={dash.mobileHeader}>
          <button style={dash.menuBtn} onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
            {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          <h1 style={dash.mobileTitle}>{entityLabels[activeTab] || activeTab}</h1>
        </header>
      )}

      {isMobile && sidebarOpen && (
        <div style={dash.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <nav style={dash.sidebar(isMobile, sidebarOpen)}>
        <div style={dash.sidebarHead}>
          <h2 style={dash.sidebarH2}>Manager Portal</h2>
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
              <div style={dash.avatar}><MdPeople size={22} /></div>
              <div style={dash.profileMeta}>
                <span style={dash.profileName}>Manager User</span>
                <span style={dash.profileRole}>Facility Manager</span>
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
        {renderTable()}
      </main>

      {editMode && renderForm()}
    </div>
  );
};

export default ManagerHome;
