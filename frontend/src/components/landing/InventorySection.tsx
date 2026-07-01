import React, { useState } from 'react';
import { FaSearch, FaStore } from 'react-icons/fa';
import { Inventory } from '../../types';
import { landing, colors } from '../../styles/ds';

const API = 'http://localhost:5000';

const InventorySection: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Inventory[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/inventory/search?item_name=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 24, maxWidth: 480 }}>
        <input
          type="text"
          className="input-focus"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for a product across every store…"
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 10, border: '1.5px solid rgba(13,71,161,0.18)',
            fontSize: '0.92rem', fontFamily: 'inherit',
          }}
        />
        <button type="submit" style={{
          padding: '12px 20px', borderRadius: 10, border: 'none',
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'inherit', fontWeight: 700, boxShadow: '0 4px 14px rgba(30,136,229,0.32)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}>
          <FaSearch size={14} /> Search
        </button>
      </form>

      {searched && (
        results.length === 0 ? (
          <p style={{ color: colors.inkMuted }}>No products found matching "{query}".</p>
        ) : (
          <div className="fade-in" style={landing.grid(260)}>
            {results.map(item => (
              <div key={item.inventory_id} className="elevated-card-hover" style={{ ...landing.elevatedCard(), padding: 16 }}>
                <strong style={{ fontSize: '0.92rem' }}>{item.item_name}</strong>
                {item.price != null && (
                  <p style={{ margin: '6px 0 0', color: colors.accent, fontWeight: 700, fontSize: '0.95rem' }}>
                    ₹{item.price}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: colors.inkMuted, fontSize: '0.8rem' }}>
                  <FaStore size={12} />
                  <span>{item.facility_name} — {item.facility_location}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default InventorySection;
