import React, { useState, useEffect } from 'react';
import { Facility } from '../../types';

const API = "http://localhost:5000";

const Facilities: React.FC = () => {
  const [data, setData] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/facilities/search`);
      setData(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading data...</p></div>;
  if (!data || data.length === 0) return <div className="empty-state"><p>No facilities available.</p></div>;

  return (
    <div className="table-container">
      <div className="table-header"><h3>FACILITIES</h3></div>
      <div className="table-responsive">
        <table>
          <thead>
            <tr><th>Facility ID</th><th>Name</th><th>Type</th><th>Location</th><th>Contact No</th><th>Opening Hours</th></tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                <td>{item.facility_id}</td><td>{item.name}</td><td>{item.type}</td>
                <td>{item.location}</td><td>{item.contact_no}</td><td>{item.opening_hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Facilities;
