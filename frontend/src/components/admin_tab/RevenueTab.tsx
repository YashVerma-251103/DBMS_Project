import React, { useState, useEffect } from "react";
import axios from "axios";
import { Revenue } from "../../types";
import API from "../../api";

const RevenueTab: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    facility_id: "", start_date: "", end_date: "",
    revenue_type: "monthly", aggregation: "average",
    min_revenue: "", max_revenue: "",
  });
  const [searchResults, setSearchResults] = useState<Revenue[]>([]);
  const [data, setData] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try { const res = await fetch(`${API}/revenue/calculate_avg`); setData(await res.json()); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); setSearchError("");
    try {
      const res = await axios.get(`${API}/revenue/calculate_avg`, { params: searchParams });
      setSearchResults(res.data); setShowSearchResults(true);
    } catch { setSearchError("Error fetching revenue data."); setShowSearchResults(false); }
  };

  const renderTable = (results: Revenue[]) => (
    <div className="table-responsive">
      <table>
        <thead>
          <tr>
            <th>Facility ID</th><th>Facility Name</th>
            <th>{searchParams.aggregation === "total" ? "Total Revenue" : "Average Revenue"}</th>
            <th>Financial Year</th>
          </tr>
        </thead>
        <tbody>
          {results.map((item, i) => (
            <tr key={i}>
              <td>{item.facility_id}</td><td>{item.facility_name}</td>
              <td>{searchParams.aggregation === "total" ? item.total_revenue : item.avg_revenue}</td>
              <td>{item.financial_year}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding: "1rem" }}>
      <div className="table-header"><h3>REVENUE ANALYSIS</h3></div>

      <div className="search-revenue-container">
        <h4>Analyze Revenue</h4>
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group"><label>Facility ID:</label><input type="text" value={searchParams.facility_id} onChange={(e) => setSearchParams({ ...searchParams, facility_id: e.target.value })} placeholder="e.g., 101" /></div>
          <div className="form-group"><label>Start Date:</label><input type="date" value={searchParams.start_date} onChange={(e) => setSearchParams({ ...searchParams, start_date: e.target.value })} /></div>
          <div className="form-group"><label>End Date:</label><input type="date" value={searchParams.end_date} onChange={(e) => setSearchParams({ ...searchParams, end_date: e.target.value })} /></div>
          <div className="form-group">
            <label>Revenue Type:</label>
            <select value={searchParams.revenue_type} onChange={(e) => setSearchParams({ ...searchParams, revenue_type: e.target.value })}>
              <option value="monthly">Monthly</option><option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="form-group">
            <label>Aggregation:</label>
            <select value={searchParams.aggregation} onChange={(e) => setSearchParams({ ...searchParams, aggregation: e.target.value })}>
              <option value="average">Average</option><option value="total">Total</option>
            </select>
          </div>
          <div className="form-group"><label>Min Revenue:</label><input type="number" value={searchParams.min_revenue} onChange={(e) => setSearchParams({ ...searchParams, min_revenue: e.target.value })} placeholder="e.g., 10000" /></div>
          <div className="form-group"><label>Max Revenue:</label><input type="number" value={searchParams.max_revenue} onChange={(e) => setSearchParams({ ...searchParams, max_revenue: e.target.value })} placeholder="e.g., 100000" /></div>
          <div className="form-group">
            <button type="submit" className="btn-primary">Analyze Revenue</button>
            {showSearchResults && <button type="button" onClick={() => setShowSearchResults(false)} className="btn-secondary">Show All</button>}
          </div>
        </form>
        {searchError && <p className="error-message">{searchError}</p>}
      </div>

      {showSearchResults ? (
        <>{<h4>Results:</h4>}{searchResults.length > 0 ? renderTable(searchResults) : <p>No revenue data found.</p>}</>
      ) : loading ? (
        <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>
      ) : data.length > 0 ? renderTable(data) : <p>No revenue data available.</p>}
    </div>
  );
};

export default RevenueTab;
