import React, { useState, useEffect } from 'react';
import { FaTrash, FaCalendarCheck, FaClipboardCheck } from 'react-icons/fa';
import { Booking } from '../../types';
import { colors } from '../../styles/ds';

const API = 'http://localhost:5000';

interface Props { customerId: number; }

const MyBookings: React.FC<Props> = ({ customerId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkinId, setCheckinId] = useState<number | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/bookings/search?customer_id=${customerId}`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [customerId]);

  const cancelBooking = async (bookingId: number) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await fetch(`${API}/bookings/delete?booking_id=${bookingId}`, { method: 'DELETE' });
      fetchBookings();
    } catch (err) { console.error(err); }
  };

  const checkIn = async (bookingId: number) => {
    setCheckinId(bookingId);
    try {
      const res = await fetch(`${API}/bookings/checkin?booking_id=${bookingId}`, { method: 'PUT' });
      if (res.ok) fetchBookings();
      else { const err = await res.json(); alert(`Check-in failed: ${err.error || 'unknown error'}`); }
    } catch (err) { console.error(err); } finally { setCheckinId(null); }
  };

  if (loading) return <p className="loading-pulse" style={{ color: '#4a5d7e', fontSize: '0.9rem' }}>Loading your bookings…</p>;
  if (bookings.length === 0) return <p style={{ color: '#4a5d7e', fontSize: '0.9rem' }}>No bookings yet — search flights or lounges above to get started.</p>;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 280, overflowY: 'auto' }}>
      {bookings.map(b => (
        <div key={b.booking_id} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', background: 'rgba(255,255,255,0.6)', borderRadius: 10,
          border: '1px solid rgba(13,27,42,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FaCalendarCheck color={colors.primary} />
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                {b.flight_id ? `Flight booking #${b.flight_id}` : `Lounge booking #${b.facility_id}`}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#4a5d7e' }}>
                {new Date(b.date_time).toLocaleString()} · {b.payment_status}
                {b.flight_id && (b.checked_in ? ' · Checked in' : ' · Not checked in')}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {b.flight_id && !b.checked_in && (
              <button
                onClick={() => checkIn(b.booking_id)}
                disabled={checkinId === b.booking_id}
                style={{
                  padding: '7px 14px', borderRadius: 8, border: 'none',
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
                  color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 3px 10px rgba(30,136,229,0.28)',
                }}
              >
                <FaClipboardCheck size={12} /> {checkinId === b.booking_id ? 'Checking in…' : 'Check In'}
              </button>
            )}
            <button
              onClick={() => cancelBooking(b.booking_id)}
              aria-label="Cancel booking"
              className="icon-btn-hover"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', padding: 8 }}
            >
              <FaTrash size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBookings;
