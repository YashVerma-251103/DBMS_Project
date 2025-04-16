import React, { useState, useEffect } from 'react';

const Facilities = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Schema for facilities (adjust as needed)
  const schema = {
    fields: [
      { name: 'Facility_Id', type: 'number', editable: false },
      { name: 'Name', type: 'text', editable: false },
      { name: 'Type', type: 'text', editable: false },
      { name: 'Location', type: 'text', editable: false },
      { name: 'Contact_No', type: 'tel', editable: false },
      { name: 'Opening_Hours', type: 'text', editable: false }
    ],
    endpoint: 'facilities'
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/${schema.endpoint}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching facilities data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Open form for edit/create
  const handleEdit = (item) => {
    setEditMode(true);
    setCurrentItem(item);
    setFormData(item);
  };

  const handleCreate = () => {
    setEditMode(true);
    setCurrentItem(null);
    const initialFormData = {};
    schema.fields.forEach(field => {
      if (field.editable) {
        initialFormData[field.name] = '';
      }
    });
    setFormData(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let url = `http://localhost:5000/${schema.endpoint}`;
    let method = 'POST';
    if (currentItem) {
      const primaryKey = schema.fields.find(f => !f.editable);
      if (primaryKey) {
        url += `/${currentItem[primaryKey.name]}`;
        method = 'PUT';
      }
    }
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        fetchData();
        setEditMode(false);
      } else {
        console.error("Error saving facility data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const renderForm = () => (
    <div className="form-modal">
      <div className="form-content">
        <h2>{ currentItem ? 'Edit Facility' : 'Add New Facility' }</h2>
        <form onSubmit={handleSubmit}>
          {schema.fields.map(field => {
            // For create mode, skip non-editable fields
            if (!field.editable && !currentItem) return null;
            return (
              <div key={field.name} className="form-group">
                <label>{field.name.replace('_', ' ')}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || (currentItem ? currentItem[field.name] : '')}
                  onChange={handleInputChange}
                  disabled={!field.editable}
                />
              </div>
            );
          })}
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {currentItem ? 'Update Facility' : 'Save Facility'}
            </button>
            <button type="button" onClick={() => setEditMode(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderTable = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading data...</p>
        </div>
      );
    }
    if (!data || data.length === 0) {
      return (
        <div className="empty-state">
          <p>No facilities available.</p>
          <button onClick={handleCreate} className="btn-primary">Add New Facility</button>
        </div>
      );
    }
    return (
      <div className="table-container">
        <div className="table-header">
          <h3>FACILITIES</h3>
          <button onClick={handleCreate} className="btn-primary">Add New Facility</button>
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
                      {field.type.includes('datetime')
                        ? new Date(item[field.name]).toLocaleString()
                        : item[field.name]}
                    </td>
                  ))}
                  {/* You can add an "Edit" button for facilities if needed */}
                  <td>
                    <button onClick={() => handleEdit(item)} className="btn-edit">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <>
      {editMode && renderForm()}
      {renderTable()}
    </>
  );
};

export default Facilities;
