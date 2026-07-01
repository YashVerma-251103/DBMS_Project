import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaWalking } from 'react-icons/fa';
import { Facility } from '../../types';
import { landing, colors } from '../../styles/ds';

const API = 'http://localhost:5000';

const NavigationSection: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/facilities/search`)
      .then(res => res.json())
      .then(data => setFacilities(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const grouped = facilities.reduce<Record<string, Facility[]>>((acc, f) => {
    (acc[f.type] ||= []).push(f);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ ...landing.glassCard, padding: 24, marginBottom: 28, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <FaWalking color={colors.primary} size={22} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <h4 style={{ margin: '0 0 8px', color: colors.primaryDark }}>Getting to and from the airport</h4>
          <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6, color: colors.inkMuted }}>
            The airport is served by metro, taxi ranks, and pre-paid cab counters at every terminal's arrivals
            level. Inside, moving walkways and signage connect all terminals to security, gates, lounges, and
            stores — allow at least 45 minutes from the main entrance to your gate during peak hours.
          </p>
        </div>
      </div>

      {loading ? <p className="loading-pulse" style={{ color: colors.inkMuted }}>Loading directory…</p> : facilities.length === 0 ? (
        <p style={{ color: colors.inkMuted }}>Directory is unavailable right now — check back soon.</p>
      ) : (
        <div className="fade-in">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type} style={{ marginBottom: 24 }}>
              <h4 style={{ color: colors.primaryDark, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                {type}
              </h4>
              <div style={landing.grid(240)}>
                {items.map(f => (
                  <div key={f.facility_id} className="elevated-card-hover" style={{ ...landing.elevatedCard(), padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <FaMapMarkerAlt color={colors.accent} size={14} />
                      <strong style={{ fontSize: '0.9rem' }}>{f.name}</strong>
                    </div>
                    <p style={{ margin: '0 0 4px', fontSize: '0.82rem', color: colors.inkMuted }}>{f.location}</p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: colors.inkMuted }}>{f.opening_hours}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavigationSection;
