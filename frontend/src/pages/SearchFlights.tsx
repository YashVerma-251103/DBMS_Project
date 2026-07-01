import React, { useState } from 'react';
import axios from 'axios';
import { FaSearch, FaPlaneDeparture } from 'react-icons/fa';
import { Flight } from '../types';
import { landing, colors } from '../styles/ds';

const API = 'http://localhost:5000';

const statusColor = (status: string) => {
  if (status === 'On Time' || status === 'Arrived') return colors.success;
  if (status === 'Delayed') return colors.warning;
  if (status === 'Cancelled') return colors.danger;
  return colors.inkMuted;
};

interface Props { customerId?: number | null; }

const SearchFlights: React.FC<Props> = ({ customerId }) => {
  const [searchParams, setSearchParams] = useState({ flight_number: '', airline: '', origin: '', destination: '', departure_date: '' });
  const [results, setResults] = useState<Flight[]>([]);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      const response = await axios.get(`${API}/flights/search`, { params: searchParams });
      setResults(response.data);
      setSearched(true);
    } catch (err) { console.error(err); setError('Error fetching flight data. Please try again later.'); }
  };

  const bookFlight = async (flightId: number) => {
    if (!customerId) return;
    setBookingId(String(flightId));
    try {
      const res = await fetch(`${API}/bookings/create?flight_id=${flightId}&customer_id=${customerId}`, { method: 'POST' });
      if (res.ok) alert('Flight booked! Check My Bookings below.');
      else { const err = await res.json(); alert(`Booking failed: ${err.error || 'unknown error'}`); }
    } catch (err) { console.error(err); } finally { setBookingId(null); }
  };

  // Explicit height (not just padding-driven) — native <input type="date"> reserves
  // extra vertical space for its own calendar-icon/spinner chrome in Chrome, so its
  // auto-height differs from a plain text input's by a couple of px even with identical
  // padding. An explicit height forces every field (and the button beside them) to match.
  const inputStyle: React.CSSProperties = {
    height: 44, padding: '0 14px', borderRadius: 8, border: '1.5px solid rgba(13,71,161,0.18)',
    fontSize: '0.88rem', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ ...landing.grid(160), marginBottom: 20, alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: colors.inkMuted, marginBottom: 6 }}>Flight Number</label>
          <input className="input-focus" style={inputStyle} type="text" name="flight_number" value={searchParams.flight_number} onChange={handleChange} placeholder="e.g., 6E202" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: colors.inkMuted, marginBottom: 6 }}>Airline</label>
          <input className="input-focus" style={inputStyle} type="text" name="airline" value={searchParams.airline} onChange={handleChange} placeholder="e.g., Indigo" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: colors.inkMuted, marginBottom: 6 }}>From</label>
          <input className="input-focus" style={inputStyle} type="text" name="origin" value={searchParams.origin} onChange={handleChange} placeholder="e.g., Delhi" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: colors.inkMuted, marginBottom: 6 }}>To</label>
          <input className="input-focus" style={inputStyle} type="text" name="destination" value={searchParams.destination} onChange={handleChange} placeholder="e.g., Mumbai" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: colors.inkMuted, marginBottom: 6 }}>Departure Date</label>
          <input className="input-focus" style={inputStyle} type="date" name="departure_date" value={searchParams.departure_date} onChange={handleChange} />
        </div>
        <div>
          {/* Invisible label matching the sibling fields' structure exactly, so the button
              lines up with the input row instead of relying on cross-element height parity
              between <button> and <input> (which browsers don't guarantee are identical). */}
          <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: 6, visibility: 'hidden' }}>Search</label>
          <button type="submit" style={{
            height: 44, padding: '0 20px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
            color: '#fff', width: '100%', boxSizing: 'border-box',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem',
            boxShadow: '0 4px 14px rgba(30,136,229,0.32)', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}>
            <FaSearch size={13} /> Search
          </button>
        </div>
      </form>

      {error && <p style={{ color: colors.danger, fontSize: '0.85rem' }}>{error}</p>}

      {searched && (
        results.length === 0 ? (
          <p style={{ color: colors.inkMuted }}>No flights found matching your search.</p>
        ) : (
          <div className="fade-in" style={landing.grid(280)}>
            {results.map((flight, i) => (
              <div key={i} className="elevated-card-hover" style={{ ...landing.elevatedCard(), padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <FaPlaneDeparture color={colors.primary} size={16} />
                  <strong>{flight.flight_number}</strong>
                  <span style={{ color: colors.inkMuted, fontSize: '0.85rem' }}>{flight.airline}</span>
                </div>
                {(flight.origin || flight.destination) && (
                  <p style={{ margin: '0 0 6px', fontSize: '0.85rem' }}>{flight.origin} → {flight.destination}</p>
                )}
                <p style={{ margin: '0 0 6px', fontSize: '0.82rem', color: colors.inkMuted }}>
                  Departs {new Date(flight.departure_time).toLocaleString()}
                </p>
                <p style={{ margin: '0 0 12px', fontSize: '0.82rem', fontWeight: 600, color: statusColor(flight.status) }}>
                  {flight.status}
                </p>
                {customerId ? (
                  <button
                    onClick={() => bookFlight(flight.flight_id)}
                    disabled={bookingId === String(flight.flight_id)}
                    style={{
                      padding: '9px 18px', borderRadius: 8, border: 'none',
                      background: `linear-gradient(135deg, ${colors.accent}, #fb923c)`,
                      color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
                      boxShadow: '0 4px 14px rgba(249,115,22,0.32)', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                  >
                    {bookingId === String(flight.flight_id) ? 'Booking…' : 'Book This Flight'}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: colors.inkMuted, fontStyle: 'italic' }}>Sign in to book</span>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default SearchFlights;
