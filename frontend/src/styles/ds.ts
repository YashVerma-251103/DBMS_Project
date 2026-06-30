import { CSSProperties, useState, useEffect } from 'react';

const W = 280;
const P = '#0056b3';

export const useIsMobile = (bp = 992) => {
  const [v, set] = useState(() => window.innerWidth <= bp);
  useEffect(() => {
    const h = () => set(window.innerWidth <= bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return v;
};

export const dash = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f5f9fc',
    position: 'relative',
    overflowX: 'hidden',
  } as CSSProperties,

  mobileHeader: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: 60,
    backgroundColor: P,
    color: '#fff',
    zIndex: 1000,
    padding: '0 15px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  } as CSSProperties,

  menuBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    marginRight: 14,
    display: 'flex',
    alignItems: 'center',
    padding: 4,
  } as CSSProperties,

  mobileTitle: {
    fontSize: '1.1rem',
    margin: 0,
    fontWeight: 500,
    color: '#fff',
  } as CSSProperties,

  sidebar: (mobile: boolean, open: boolean): CSSProperties => ({
    width: W,
    backgroundColor: '#003366',
    color: '#fff',
    position: 'fixed',
    height: '100vh',
    zIndex: 999,
    overflowY: 'auto',
    transition: 'transform 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    transform: mobile && !open ? 'translateX(-100%)' : 'none',
    boxShadow: mobile && open ? '4px 0 14px rgba(0,0,0,0.3)' : 'none',
  }),

  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 800,
  } as CSSProperties,

  sidebarHead: {
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  } as CSSProperties,

  sidebarH2: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#fff',
  } as CSSProperties,

  sidebarBody: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'auto',
  } as CSSProperties,

  navList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  } as CSSProperties,

  navItem: (active: boolean, hovered: boolean): CSSProperties => ({
    padding: '14px 20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    borderLeft: active ? '4px solid #00a0e9' : '4px solid transparent',
    backgroundColor: active
      ? 'rgba(0,86,179,0.65)'
      : hovered
      ? 'rgba(0,86,179,0.28)'
      : 'transparent',
    fontWeight: active ? 600 : 400,
    color: '#fff',
    fontSize: '0.9rem',
    transition: 'background-color 0.18s',
    userSelect: 'none',
  }),

  sidebarFooter: {
    marginTop: 'auto',
    padding: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  } as CSSProperties,

  profileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  } as CSSProperties,

  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as CSSProperties,

  profileMeta: {
    display: 'flex',
    flexDirection: 'column',
  } as CSSProperties,

  profileName: { fontWeight: 500, fontSize: '0.88rem', color: '#fff' } as CSSProperties,
  profileRole: { fontSize: '0.76rem', opacity: 0.75, color: '#fff' } as CSSProperties,

  logoutBtn: (hovered: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: hovered ? 'rgba(255,255,255,0.12)' : 'none',
    border: 'none',
    color: '#fff',
    width: '100%',
    padding: '10px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: '0.88rem',
    transition: 'background 0.18s',
    fontFamily: 'inherit',
  }),

  main: (mobile: boolean): CSSProperties => ({
    flex: 1,
    marginLeft: mobile ? 0 : W,
    minHeight: '100vh',
    backgroundColor: '#f5f9fc',
    padding: mobile ? '72px 16px 24px' : '28px 30px',
    transition: 'margin-left 0.3s',
    boxSizing: 'border-box',
  }),
};
