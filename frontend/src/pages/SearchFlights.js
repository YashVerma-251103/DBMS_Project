// src/pages/SearchFlights.js
import React, { useState } from 'react';
import axios from 'axios';

function SearchFlights() {
  // Use state to handle search criteria and results.
  const [searchParams, setSearchParams] = useState({
    flight_number: '',
    airline: '',
    departure_date: ''
  });
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  // Update search parameters as the user types.
  const handleChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Axios will append searchParams as query parameters.
      const response = await axios.get('http://localhost:5000/flights/search', {
        params: searchParams
      });
      
      // Update results state with data received from the backend.
      setResults(response.data);
    } catch (err) {
      console.error('Error fetching flight data:', err);
      setError('Error fetching flight data. Please try again later.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Search Flights</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="flight_number">Flight Number: </label>
          <input
            type="text"
            id="flight_number"
            name="flight_number"
            value={searchParams.flight_number}
            onChange={handleChange}
            placeholder="e.g., 6e202"
          />
        </div>
        <div>
          <label htmlFor="airline">Airline: </label>
          <input
            type="text"
            id="airline"
            name="airline"
            value={searchParams.airline}
            onChange={handleChange}
            placeholder="e.g., indigo"
          />
        </div>
        <div>
          <label htmlFor="departure_date">Departure Date: </label>
          <input
            type="date"
            id="departure_date"
            name="departure_date"
            value={searchParams.departure_date}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Search</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <hr />
      <h3>Results:</h3>
      {results.length > 0 ? (
        results.map((flight, index) => (
          <div key={index} style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #ccc' }}>
            {/* Adjust the following fields based on your actual flight tuple structure */}
            <p><strong>Flight Number:</strong> {flight.flight_number}</p>
            <p><strong>Airline:</strong> {flight.airline}</p>
            <p><strong>Departure Time:</strong> {flight.departure_time}</p>
            <p><strong>Status:</strong> {flight.status}</p>
            {/* Include other fields as needed */}
          </div>
        ))
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
}

export default SearchFlights;
