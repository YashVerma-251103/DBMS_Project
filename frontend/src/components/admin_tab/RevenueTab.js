import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RevenueTab = () => {
  // Revenue search parameters
  const [searchParams, setSearchParams] = useState({
    facility_id: '',
    start_date: '',
    end_date: '',
    revenue_type: 'monthly'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [data, setData] = useState([]); // Default table data if no search is performed
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch all revenue data on load by calling the endpoint with no filtering.
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/revenue/calculate_avg');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
  };

  // When the user submits the form, call the revenue endpoint with parameters.
  const handleSearchRevenue = async (e) => {
    e.preventDefault();
    setSearchError('');
    try {
      const response = await axios.get('http://localhost:5000/revenue/calculate_avg', {
        params: searchParams,
      });
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setSearchError('Error fetching revenue data. Please try again later.');
      setShowSearchResults(false);
    }
  };

  // Renders the revenue results in a table.
  const renderRevenueTable = (results) => {
    return (
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Facility ID</th>
              <th>Facility Name</th>
              <th>
                {searchParams.revenue_type.toLowerCase() === 'yearly'
                  ? 'Avg Yearly Revenue'
                  : 'Avg Monthly Revenue'}
              </th>
              {/* Show revenue month column if provided in the results */}
              {results[0] && results[0].revenue_month && <th>Month</th>}
              <th>Financial Year</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, index) => (
              <tr key={index}>
                <td>{item.facility_id}</td>
                <td>{item.facility_name}</td>
                <td>
                  {searchParams.revenue_type.toLowerCase() === 'yearly'
                    ? item.avg_yearly_revenue
                    : item.avg_monthly_revenue}
                </td>
                {item.revenue_month && <td>{item.revenue_month}</td>}
                <td>{item.financial_year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div className="table-header">
        <h3>REVENUE CALCULATOR</h3>
      </div>

      {/* Revenue Calculator Form */}
      <div className="search-revenue-container">
        <h4>Calculate Revenue</h4>
        <form onSubmit={handleSearchRevenue} className="search-form">
          <div className="form-group">
            <label htmlFor="facility_id">Facility ID:</label>
            <input
              type="text"
              id="facility_id"
              name="facility_id"
              placeholder="e.g., 101"
              value={searchParams.facility_id}
              onChange={handleSearchChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="start_date">Start Date (YYYY-MM-DD):</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={searchParams.start_date}
              onChange={handleSearchChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="end_date">End Date (YYYY-MM-DD):</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={searchParams.end_date}
              onChange={handleSearchChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="revenue_type">Revenue Type:</label>
            <select
              id="revenue_type"
              name="revenue_type"
              value={searchParams.revenue_type}
              onChange={handleSearchChange}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="form-group">
            <button type="submit" className="btn-primary">
              Calculate Revenue
            </button>
            {showSearchResults && (
              <button
                type="button"
                onClick={() => setShowSearchResults(false)}
                className="btn-secondary"
              >
                Show All Revenue Data
              </button>
            )}
          </div>
        </form>
        {searchError && <p className="error-message">{searchError}</p>}
      </div>

      {/* Render the revenue data in a table */}
      {showSearchResults ? (
        <>
          <h4>Search Results:</h4>
          {searchResults.length > 0 ? (
            renderRevenueTable(searchResults)
          ) : (
            <p>No revenue data found for the specified criteria.</p>
          )}
        </>
      ) : loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading revenue data...</p>
        </div>
      ) : data.length > 0 ? (
        renderRevenueTable(data)
      ) : (
        <p>No revenue data available.</p>
      )}
    </div>
  );
};

export default RevenueTab;
