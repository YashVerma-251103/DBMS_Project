import React, { useState, useEffect } from 'react';
import { FaExclamationCircle, FaPaperPlane } from 'react-icons/fa';
import { Incident, Facility } from '../../types';
import { colors } from '../../styles/ds';
import API from '../../api';

interface Props { customerId: number; }

const STATUS_COLOR: Record<string, string> = { Reported: colors.warning, 'In Progress': colors.primary, Resolved: colors.success };

const ReportIssue: React.FC<Props> = ({ customerId }) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [facilityId, setFacilityId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${API}/incidents/search?reported_by_customer_id=${customerId}`);
      const data = await res.json();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/facilities/search`).then(res => res.json()).then(data => setFacilities(Array.isArray(data) ? data : [])),
      fetchIncidents(),
    ]).catch(err => console.error(err)).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const facilityName = (id: number) => facilities.find(f => f.facility_id === id)?.name || `Facility #${id}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityId || !description.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `${API}/incidents/insert?facility_id=${facilityId}&reported_by_customer_id=${customerId}&description=${encodeURIComponent(description)}`,
        { method: 'POST' }
      );
      if (res.ok) { setDescription(''); setFacilityId(''); fetchIncidents(); }
      else { const err = await res.json(); alert(`Failed to file report: ${err.error || 'unknown error'}`); }
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  if (loading) return <p className="loading-pulse" style={{ color: colors.inkMuted, fontSize: '0.9rem' }}>Loading…</p>;

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <select
          className="input-focus"
          value={facilityId}
          onChange={e => setFacilityId(e.target.value)}
          required
          style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid rgba(13,71,161,0.18)', fontSize: '0.85rem', fontFamily: 'inherit' }}
        >
          <option value="">Which facility?</option>
          {facilities.map(f => <option key={f.facility_id} value={f.facility_id}>{f.name} ({f.type})</option>)}
        </select>
        <textarea
          className="input-focus"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What went wrong?"
          required
          rows={3}
          style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid rgba(13,71,161,0.18)', fontSize: '0.85rem', fontFamily: 'inherit', resize: 'vertical' }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '9px 16px', borderRadius: 8, border: 'none',
            background: `linear-gradient(135deg, ${colors.teal}, #0ea5c4)`,
            color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 14px rgba(8,145,178,0.32)',
          }}
        >
          <FaPaperPlane size={12} /> {submitting ? 'Submitting…' : 'Report Issue'}
        </button>
      </form>

      {incidents.length === 0 ? (
        <p style={{ color: colors.inkMuted, fontSize: '0.85rem' }}>No past reports.</p>
      ) : (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
          {incidents.map(inc => (
            <div key={inc.incident_id} style={{
              padding: '10px 14px', background: 'rgba(255,255,255,0.6)', borderRadius: 10,
              border: '1px solid rgba(13,27,42,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <FaExclamationCircle color={colors.teal} size={13} />
                <strong style={{ fontSize: '0.85rem' }}>{facilityName(inc.facility_id)}</strong>
                <span style={{ marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700, color: STATUS_COLOR[inc.status] || colors.inkMuted }}>{inc.status}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: colors.inkMuted }}>{inc.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportIssue;
