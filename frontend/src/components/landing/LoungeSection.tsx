import React, { useState, useEffect } from 'react';
import { FaCouch } from 'react-icons/fa';
import { Facility } from '../../types';
import { landing, colors } from '../../styles/ds';

const API = 'http://localhost:5000';

interface Props { customerId?: number | null; }

const LoungeSection: React.FC<Props> = ({ customerId }) => {
  const [lounges, setLounges] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API}/facilities/search?type=Lounge`)
      .then(res => res.json())
      .then(data => setLounges(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const bookLounge = async (facilityId: number) => {
    if (!customerId) return;
    setBookingId(facilityId);
    try {
      const res = await fetch(
        `${API}/bookings/create?facility_id=${facilityId}&customer_id=${customerId}`,
        { method: 'POST' }
      );
      if (res.ok) alert('Lounge booked! Check My Bookings below.');
      else { const err = await res.json(); alert(`Booking failed: ${err.error || 'unknown error'}`); }
    } catch (err) { console.error(err); } finally { setBookingId(null); }
  };

  if (loading) return <p className="loading-pulse" style={{ color: colors.inkMuted }}>Loading lounges…</p>;
  if (lounges.length === 0) return <p style={{ color: colors.inkMuted }}>No lounges available right now — check back soon.</p>;

  return (
    <div className="fade-in" style={landing.grid(280)}>
      {lounges.map(l => (
        <div key={l.facility_id} className="glass-card-hover" style={{ ...landing.glassCard, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <FaCouch color={colors.primary} size={20} />
            <h4 style={{ margin: 0, color: colors.primaryDark, fontSize: '1.05rem' }}>{l.name}</h4>
          </div>
          <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: colors.inkMuted }}>{l.location}</p>
          {l.description && <p style={{ margin: '0 0 14px', fontSize: '0.9rem', lineHeight: 1.5 }}>{l.description}</p>}
          <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: colors.inkMuted }}>Open {l.opening_hours}</p>
          {customerId ? (
            <button
              onClick={() => bookLounge(l.facility_id)}
              disabled={bookingId === l.facility_id}
              style={{
                padding: '9px 18px', borderRadius: 8, border: 'none',
                background: `linear-gradient(135deg, ${colors.accent}, #fb923c)`, color: '#fff', fontWeight: 700,
                fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 14px rgba(249,115,22,0.32)', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              {bookingId === l.facility_id ? 'Booking…' : 'Book This Lounge'}
            </button>
          ) : (
            <span style={{ fontSize: '0.8rem', color: colors.inkMuted, fontStyle: 'italic' }}>Sign in to book</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default LoungeSection;
