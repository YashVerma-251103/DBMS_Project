import { CSSProperties, useState, useEffect, useRef, RefObject } from 'react';

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

export const useScrolled = (threshold = 40) => {
  const [scrolled, set] = useState(() => window.scrollY > threshold);
  useEffect(() => {
    const h = () => set(window.scrollY > threshold);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, [threshold]);
  return scrolled;
};

export const useReducedMotion = () => {
  const [reduced, set] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const h = () => set(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return reduced;
};

// Scroll-reveal via native IntersectionObserver — no animation library needed.
// Toggles both ways (fades OUT scrolling past/away, not just in once) so it reads as a
// real fade in/out on every pass, not a one-shot reveal you only see the first time.
// Respects prefers-reduced-motion by skipping straight to visible and staying there.
export const useReveal = <T extends HTMLElement>(): [RefObject<T | null>, boolean] => {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVisible(true); return; }
    // rootMargin pulls the trigger line up from the very bottom edge, so the fade
    // plays while the section is still scrolling into the lower part of the viewport
    // (where you're actually looking) instead of finishing before you get there.
    const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.1,
      rootMargin: '0px 0px -12% 0px',
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

export const colors = {
  primary: '#1e88e5',
  primaryDark: '#0d47a1',
  primaryLight: '#42a5f5',
  accent: '#f97316',
  accentDark: '#c2410c',
  teal: '#0891b2',
  violet: '#7c3aed',
  // Fixed pixel stops, not percentages — the page grows taller as sections stack, and a
  // percentage-based gradient would stretch the dark hero zone across the whole (variable)
  // page height instead of staying put behind the header + hero. Last stop is a visibly
  // blue tone, not a barely-there tint — a previous, subtler attempt (#eaf4fd) still read
  // as "pure white" once real content (white cards, white nav) sat on top of it.
  bg: 'linear-gradient(180deg, #0a3d91 0px, #1565c0 260px, #4f9eea 480px, #bfe0fb 750px, #d2e9fb 1100px)',
  ink: '#0d1b2a',
  inkMuted: '#4a5d7e',
  glassBg: 'rgba(255,255,255,0.78)',
  glassBgStrong: 'rgba(255,255,255,0.92)',
  glassBorder: 'rgba(255,255,255,0.6)',
  success: '#2e7d32',
  warning: '#ed6c02',
  danger: '#dc3545',
};

export const elevation = {
  sm: '0 2px 8px rgba(13,27,42,0.07)',
  md: '0 8px 24px rgba(13,27,42,0.10)',
  lg: '0 16px 40px rgba(13,27,42,0.14)',
};

// Soft blurred color shapes — decoration only (pointer-events: none), and the reason
// glassmorphism actually reads as "glass": a frosted panel needs something colorful
// behind it to blur, otherwise it's just a translucent white box.
export const blob = (color: string, size: number, top: string, left: string): CSSProperties => ({
  position: 'absolute',
  top, left,
  width: size,
  height: size,
  borderRadius: '50%',
  background: color,
  filter: 'blur(80px)',
  pointerEvents: 'none',
  zIndex: 0,
});

export const iconBadge = (color: string): CSSProperties => ({
  width: 46,
  height: 46,
  borderRadius: 13,
  background: `${color}22`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color,
  flexShrink: 0,
});

export const landing = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    // 'clip', not 'hidden' — setting only overflow-x to a non-visible value makes the
    // UA compute overflow-y as auto too (CSS spec), which turns this div into its own
    // scroll container and breaks position:sticky for the header inside it. 'clip'
    // clips horizontally without creating a scroll container.
    overflowX: 'clip',
    background: colors.bg,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: colors.ink,
  } as CSSProperties,

  // Floating, detached from the edges (not a full-bleed bar) — glass at all times,
  // strengthening into a stronger shadow/opacity once scrolled. `fixed` (not `sticky`)
  // since a floating pill needs to be positioned independent of the document edge.
  header: (scrolled: boolean, mobile: boolean): CSSProperties => ({
    position: 'fixed',
    top: mobile ? 12 : 20,
    left: '50%',
    transform: 'translateX(-50%)',
    width: `calc(100% - ${mobile ? 24 : 40}px)`,
    maxWidth: 1240,
    zIndex: 500,
    borderRadius: mobile ? 16 : 20,
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    background: scrolled ? colors.glassBgStrong : 'rgba(255,255,255,0.14)',
    border: `1px solid ${scrolled ? 'rgba(13,71,161,0.10)' : 'rgba(255,255,255,0.22)'}`,
    boxShadow: scrolled ? elevation.md : '0 8px 32px rgba(6,20,55,0.18)',
    transition: 'background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
  }),

  headerInner: (mobile: boolean): CSSProperties => ({
    margin: '0 auto',
    padding: mobile ? '10px 16px' : '12px 26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),

  logo: (scrolled: boolean): CSSProperties => ({
    margin: 0,
    fontWeight: 700,
    fontSize: '1.15rem',
    color: scrolled ? colors.primaryDark : '#ffffff',
    letterSpacing: '0.3px',
    transition: 'color 0.25s ease',
  }),

  navLinks: (mobile: boolean): CSSProperties => ({
    display: mobile ? 'none' : 'flex',
    gap: 28,
    listStyle: 'none',
    margin: 0,
    padding: 0,
  }),

  // Background/hover handled by the .nav-link-pill CSS class (inline styles can't express
  // :hover) — this only owns the part that's genuinely dynamic (light vs. dark text).
  navLink: (light = false): CSSProperties => ({
    color: light ? 'rgba(255,255,255,0.92)' : colors.inkMuted,
    fontSize: '0.92rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    transition: 'color 0.25s ease',
  }),

  authArea: { display: 'flex', alignItems: 'center', gap: 12 } as CSSProperties,

  // Anchored on the darker end of the orange range (not the lighter #fb923c stop) —
  // paired with a toned-down glow, so it reads as confident rather than neon.
  ctaPrimary: (hovered: boolean): CSSProperties => ({
    padding: '11px 24px',
    borderRadius: 10,
    border: 'none',
    background: hovered
      ? `linear-gradient(135deg, #a3390a, ${colors.accentDark})`
      : `linear-gradient(135deg, ${colors.accentDark}, ${colors.accent})`,
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.92rem',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    transform: hovered ? 'translateY(-2px)' : 'none',
    boxShadow: hovered ? '0 8px 20px rgba(194,65,12,0.38)' : '0 3px 10px rgba(194,65,12,0.24)',
  }),

  // light=true: the ghost button variant used over the dark, unscrolled hero header.
  // Given a visible fill + border at rest (not just on hover) so it doesn't wash out
  // next to ctaPrimary — the two are meant to read as "equally present, different weight."
  ctaGhost: (hovered: boolean, light = false): CSSProperties => ({
    padding: '10px 20px',
    borderRadius: 10,
    border: `1.5px solid ${light ? (hovered ? '#fff' : 'rgba(255,255,255,0.75)') : (hovered ? colors.primary : 'rgba(13,71,161,0.4)')}`,
    background: light
      ? (hovered ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.16)')
      : (hovered ? 'rgba(30,136,229,0.14)' : 'rgba(30,136,229,0.06)'),
    color: light ? '#fff' : colors.primaryDark,
    fontWeight: 600,
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.2s ease, border-color 0.2s ease, color 0.25s ease, transform 0.2s ease',
    transform: hovered ? 'translateY(-1px)' : 'none',
  }),

  // Longhand padding, not shorthand — call sites override just paddingTop/paddingBottom
  // (hero spacing, the overlapping search card), and mixing a `padding` shorthand with
  // longhand overrides in the same style object across re-renders is a React footgun
  // (triggers "conflicting property" warnings and can produce inconsistent CSS output).
  section: (mobile: boolean): CSSProperties => ({
    maxWidth: 1200,
    margin: '0 auto',
    paddingTop: mobile ? 48 : 72,
    paddingBottom: mobile ? 48 : 72,
    paddingLeft: mobile ? 18 : 32,
    paddingRight: mobile ? 18 : 32,
    // The navbar floats (position: fixed) over the top ~90px of the viewport at every
    // scroll position, so anchor-jump targets need clearance or their heading lands
    // tucked behind it.
    scrollMarginTop: mobile ? 90 : 110,
  }),

  // A soft blue wash, not white — layering white over the page's own soft-blue base
  // would cancel it back out to plain white, undoing the point of tinting the page at all.
  // A vertical gradient, not a flat fill — fading in/out at the top and bottom means the
  // tint blends into the sections above/below instead of reading as a hard-edged band
  // (full width fixed the LEFT/RIGHT boxing, this fixes the TOP/BOTTOM one).
  sectionTint: {
    background: 'linear-gradient(180deg, rgba(158,205,247,0) 0%, rgba(158,205,247,0.55) 15%, rgba(158,205,247,0.55) 85%, rgba(158,205,247,0) 100%)',
    position: 'relative',
  } as CSSProperties,

  sectionEyebrow: (color: string): CSSProperties => ({
    display: 'inline-block',
    color,
    fontWeight: 700,
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    marginBottom: 8,
  }),

  sectionHeading: (mobile: boolean): CSSProperties => ({
    fontSize: mobile ? '1.5rem' : '1.85rem',
    fontWeight: 700,
    color: colors.primaryDark,
    margin: '0 0 10px',
  }),

  sectionSubtext: {
    color: colors.inkMuted,
    fontSize: '1rem',
    margin: '0 0 32px',
    maxWidth: 640,
    lineHeight: 1.6,
  } as CSSProperties,

  // Hero text sits directly on the dark gradient (outside the glass card), so it needs
  // light-on-dark contrast instead of the standard dark-on-light section styles. Sized to
  // be THE dominant hero element (TripMate-style), not one competing with the search card.
  heroHeading: (mobile: boolean): CSSProperties => ({
    fontSize: mobile ? '2.4rem' : 'clamp(3rem, 5vw, 4.5rem)',
    fontWeight: 800,
    color: '#fff',
    margin: '0 0 18px',
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    textShadow: '0 4px 28px rgba(0,0,0,0.25)',
  }),

  heroSubtext: (mobile: boolean): CSSProperties => ({
    color: 'rgba(255,255,255,0.88)',
    fontSize: mobile ? '0.95rem' : '1.1rem',
    lineHeight: 1.6,
    margin: '0 0 32px',
    maxWidth: 560,
  }),

  // Glass: for panels floating over the colorful hero/CTA backdrop — high opacity
  // white (not the classic 10-30%) so body text keeps 4.5:1+ contrast.
  glassCard: {
    background: colors.glassBg,
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: 16,
    boxShadow: elevation.md,
  } as CSSProperties,

  // Elevated: for data-dense areas (search results, directory) — solid background,
  // no blur, so scanning many rows of text stays cheap and legible.
  // Hover lift lives in the .elevated-card-hover CSS class (real :hover, not a JS
  // `hovered` prop nothing was ever wired up to set — that param existed but no caller
  // tracked per-card hover state, so the transition never actually fired).
  elevatedCard: (): CSSProperties => ({
    background: '#fff',
    borderRadius: 12,
    border: '1px solid rgba(13,27,42,0.06)',
    boxShadow: elevation.sm,
  }),

  grid: (minWidth: number): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
    gap: 20,
  }),

  footer: {
    borderTop: '1px solid rgba(13,27,42,0.08)',
    padding: '28px 32px',
    textAlign: 'center',
    color: colors.inkMuted,
    fontSize: '0.85rem',
  } as CSSProperties,
};

// Mirrors Landing's colors/gradient direction (styles/ds.ts's own `colors`/`landing`
// tokens above) so the dashboards read as the same product, not a bolted-on admin panel.
export const dash = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: 'linear-gradient(180deg, #eaf4fd 0%, #ffffff 480px)',
    position: 'relative',
    overflowX: 'hidden',
  } as CSSProperties,

  mobileHeader: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: 60,
    background: `linear-gradient(135deg, ${colors.primaryDark}, ${colors.primary})`,
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
    background: `linear-gradient(180deg, ${colors.primaryDark}, ${colors.primary})`,
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

  // Every dashboard needs a way back to Landing that isn't "hope the browser back
  // button does the right thing" — this sits right under the portal title.
  backLink: (hovered: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    padding: '6px 0',
    background: 'none',
    border: 'none',
    color: hovered ? '#fff' : 'rgba(255,255,255,0.75)',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'color 0.15s ease',
  }),

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
    // Orange accent against the blue sidebar (same accent/primary pairing as Landing's
    // buttons) reads more clearly than a blue-on-blue active state would.
    borderLeft: active ? `4px solid ${colors.accent}` : '4px solid transparent',
    backgroundColor: active
      ? 'rgba(255,255,255,0.18)'
      : hovered
      ? 'rgba(255,255,255,0.09)'
      : 'transparent',
    fontWeight: active ? 700 : 500,
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
    background: hovered ? 'rgba(255,255,255,0.14)' : 'none',
    border: 'none',
    color: '#fff',
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: 600,
    transition: 'background 0.18s',
    fontFamily: 'inherit',
  }),

  main: (mobile: boolean): CSSProperties => ({
    flex: 1,
    marginLeft: mobile ? 0 : W,
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #eaf4fd 0%, #ffffff 480px)',
    padding: mobile ? '72px 16px 24px' : '28px 30px',
    transition: 'margin-left 0.3s',
    boxSizing: 'border-box',
  }),
};
