import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlaneDeparture, FaCouch, FaMapMarkedAlt, FaStore, FaCalendarCheck, FaClipboardList, FaCommentDots, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import SearchFlights from './SearchFlights';
import LoungeSection from '../components/landing/LoungeSection';
import NavigationSection from '../components/landing/NavigationSection';
import InventorySection from '../components/landing/InventorySection';
import MyBookings from '../components/landing/MyBookings';
import ReportIssue from '../components/landing/ReportIssue';
import { landing, colors, blob, iconBadge, useIsMobile, useScrolled, useReveal } from '../styles/ds';
import { AIRPORT } from '../config/airport';

interface CurrentUser { name: string; role: string; customerId?: number | null; }

const Reveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const [ref, visible] = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''}`}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

const SectionHeading: React.FC<{ icon: React.ReactNode; color: string; eyebrow: string; title: string; mobile: boolean }> = ({ icon, color, eyebrow, title, mobile }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
    <div style={iconBadge(color)}>{icon}</div>
    <div>
      <span style={landing.sectionEyebrow(color)}>{eyebrow}</span>
      <h2 style={{ ...landing.sectionHeading(mobile), margin: 0 }}>{title}</h2>
    </div>
  </div>
);

const NAV_ITEMS = [
  { id: 'flights', label: 'Flights' },
  { id: 'lounges', label: 'Lounges' },
  { id: 'navigation', label: 'Directory' },
  { id: 'inventory', label: 'Shop' },
];

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const scrolled = useScrolled();
  const light = !scrolled;
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loginHov, setLoginHov] = useState(false);
  const [signupHov, setSignupHov] = useState(false);
  const [logoutHov, setLogoutHov] = useState(false);

  useEffect(() => {
    try { setCurrentUser(JSON.parse(localStorage.getItem('currentUser') || 'null')); }
    catch { setCurrentUser(null); }
  }, []);

  const isCustomer = currentUser?.role === 'customer';

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const whatYouGet = [
    { icon: <FaCalendarCheck size={24} />, color: colors.primary, title: 'Book flights & lounges', body: 'Reserve a seat or a lounge slot in a couple of clicks, no counter visit needed.' },
    { icon: <FaClipboardList size={24} />, color: colors.accent, title: 'Online check-in', body: 'Check in for your flight from anywhere once booking is confirmed.' },
    { icon: <FaCommentDots size={24} />, color: colors.teal, title: 'Report an issue', body: 'Something not right at a facility? File it directly and track resolution.' },
  ];

  return (
    <div style={landing.page}>
      {/* Header */}
      <header style={landing.header(scrolled, isMobile)}>
        <div style={landing.headerInner(isMobile)}>
          <h1 style={landing.logo(scrolled)}>
            <FaPlaneDeparture style={{ marginRight: 10, verticalAlign: 'middle' }} />
            {isMobile ? AIRPORT.shortName : AIRPORT.name}
          </h1>

          <ul style={landing.navLinks(isMobile)}>
            {NAV_ITEMS.map(item => (
              <li key={item.id}>
                <button
                  className={`nav-link-pill ${light ? 'nav-link-light' : ''}`}
                  style={landing.navLink(light)}
                  onClick={() => scrollTo(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div style={landing.authArea}>
            {currentUser ? (
              <>
                <button
                  className={`nav-link-pill ${light ? 'nav-link-light' : ''}`}
                  style={{ ...landing.navLink(light), display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => navigate('/profile')}
                  aria-label="View profile"
                >
                  <FaUserCircle size={18} /> {!isMobile && `Hi, ${currentUser.name}`}
                </button>
                <button
                  onMouseEnter={() => setLogoutHov(true)}
                  onMouseLeave={() => setLogoutHov(false)}
                  onClick={handleLogout}
                  style={landing.ctaGhost(logoutHov, light)}
                >
                  <FaSignOutAlt style={{ marginRight: 6, verticalAlign: 'middle' }} />Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onMouseEnter={() => setLoginHov(true)}
                  onMouseLeave={() => setLoginHov(false)}
                  onClick={() => navigate('/login')}
                  style={landing.ctaGhost(loginHov, light)}
                >
                  Login
                </button>
                <button
                  onMouseEnter={() => setSignupHov(true)}
                  onMouseLeave={() => setSignupHov(false)}
                  onClick={() => navigate('/login')}
                  style={landing.ctaPrimary(signupHov)}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero — sits directly on the page's own gradient (dark blue at the top), no
          separate background layer needed. Blobs give it depth without a media asset. */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: isMobile ? 480 : 520 }}>
        <div className="float-blob" style={blob('rgba(30,136,229,0.35)', 380, '-140px', '68%')} />
        <div className="float-blob-slow" style={blob('rgba(249,115,22,0.22)', 260, '120px', '-60px')} />

        {/* paddingTop clears the floating fixed navbar (~70px tall + its own top offset),
            since a fixed header no longer pushes this content down the way sticky did. */}
        <section style={{ ...landing.section(isMobile), position: 'relative', zIndex: 2, paddingTop: isMobile ? 110 : 150, paddingBottom: 0 }}>
          <Reveal>
            <div style={{ maxWidth: 780, marginBottom: isMobile ? 32 : 48 }}>
              <span style={landing.sectionEyebrow('rgba(255,255,255,0.85)')}>{AIRPORT.name}</span>
              <h2 style={landing.heroHeading(isMobile)}>Your next flight, all in one place.</h2>
              <p style={landing.heroSubtext(isMobile)}>
                Search flights, browse lounges, find your way around, and shop every store —
                all without a counter visit. Sign in to book, check in, and manage it all from here.
              </p>
            </div>
          </Reveal>
        </section>
      </div>

      {/* Search card — plain document flow, generous spacing from the hero text above.
          (Previously pulled up with a negative margin for an "overlap" effect, but that
          fought directly against having real breathing room here — picked one, not both.) */}
      <section id="flights" style={{ ...landing.section(isMobile), position: 'relative', zIndex: 3, paddingTop: 0 }}>
        <Reveal>
          <div style={{ ...landing.glassCard, padding: isMobile ? 22 : 36, position: 'relative' }}>
            <SectionHeading icon={<FaPlaneDeparture size={20} />} color={colors.primary} eyebrow="Live search" title="Search flights" mobile={isMobile} />
            <p style={{ ...landing.sectionSubtext, marginTop: 8 }}>
              Check live status, plan ahead, or find your next flight — search by number, airline, route, or date.
            </p>
            <SearchFlights customerId={currentUser?.customerId} />
          </div>
        </Reveal>
      </section>

      {/* Lounges — tint lives on this full-width outer section so it spans edge to edge;
          the inner div (landing.section) constrains just the CONTENT to maxWidth 1200.
          Tinting the same element that carries maxWidth+margin:auto boxed the color into
          a centered rectangle instead of a full-bleed band. */}
      <section id="lounges" style={{ ...landing.sectionTint, scrollMarginTop: isMobile ? 90 : 110 }}>
        <div className="float-blob" style={blob('rgba(249,115,22,0.14)', 300, '10%', '85%')} />
        <div style={landing.section(isMobile)}>
          <Reveal>
            <SectionHeading icon={<FaCouch size={20} />} color={colors.accent} eyebrow="Relax" title="Lounges" mobile={isMobile} />
            <p style={{ ...landing.sectionSubtext, marginTop: 8 }}>Relax before your flight — browse every lounge and what's included.</p>
            <LoungeSection customerId={currentUser?.customerId} />
          </Reveal>
        </div>
      </section>

      {/* Navigation / directory */}
      <section id="navigation" style={{ ...landing.section(isMobile), position: 'relative' }}>
        <div className="float-blob" style={blob('rgba(8,145,178,0.14)', 340, '5%', '80%')} />
        <Reveal>
          <SectionHeading icon={<FaMapMarkedAlt size={20} />} color={colors.teal} eyebrow="Get around" title="Find your way" mobile={isMobile} />
          <p style={{ ...landing.sectionSubtext, marginTop: 8 }}>{AIRPORT.facilitiesDescription}</p>
          <NavigationSection />
        </Reveal>
      </section>

      {/* Inventory / shop search — same full-width-tint / inner-content split as Lounges */}
      <section id="inventory" style={{ ...landing.sectionTint, scrollMarginTop: isMobile ? 90 : 110 }}>
        <div className="float-blob-slow" style={blob('rgba(124,58,237,0.12)', 320, '20%', '-80px')} />
        <div style={landing.section(isMobile)}>
          <Reveal>
            <SectionHeading icon={<FaStore size={20} />} color={colors.violet} eyebrow="Shop" title={AIRPORT.shopTitle} mobile={isMobile} />
            <p style={{ ...landing.sectionSubtext, marginTop: 8 }}>Looking for something specific? Search every store at once.</p>
            <InventorySection />
          </Reveal>
        </div>
      </section>

      {/* What you get */}
      <section id="account" style={{ ...landing.section(isMobile), position: 'relative' }}>
        <div className="float-blob-slow" style={blob('rgba(30,136,229,0.10)', 340, '10%', '82%')} />
        <Reveal>
          <h2 style={{ ...landing.sectionHeading(isMobile), textAlign: 'center' }}>
            {isCustomer ? 'Your account' : 'What you get when you sign in'}
          </h2>
          <p style={{ ...landing.sectionSubtext, textAlign: 'center', margin: '0 auto 32px' }}>
            {isCustomer
              ? 'Manage your bookings, check in, and reach out if something needs attention.'
              : 'Create a free account to book flights and lounges, check in online, and report issues directly.'}
          </p>

          {isCustomer ? (
            <div style={landing.grid(300)}>
              <Reveal delay={0}>
                <div style={{ ...landing.glassCard, padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={iconBadge(colors.primary)}><FaCalendarCheck size={20} /></div>
                    <h4 style={{ margin: 0 }}>My Bookings</h4>
                  </div>
                  {currentUser?.customerId ? <MyBookings customerId={currentUser.customerId} /> : null}
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div style={{ ...landing.glassCard, padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={iconBadge(colors.teal)}><FaCommentDots size={20} /></div>
                    <h4 style={{ margin: 0 }}>Report an Issue</h4>
                  </div>
                  {currentUser?.customerId ? <ReportIssue customerId={currentUser.customerId} /> : null}
                </div>
              </Reveal>
            </div>
          ) : (
            <div style={landing.grid(280)}>
              {whatYouGet.map((card, i) => (
                <Reveal key={card.title} delay={i * 120}>
                  <div className="glass-card-hover" style={{ ...landing.glassCard, padding: 26, textAlign: 'center' }}>
                    <div style={{ ...iconBadge(card.color), margin: '0 auto 16px' }}>{card.icon}</div>
                    <h4 style={{ margin: '0 0 8px' }}>{card.title}</h4>
                    <p style={{ margin: '0 0 18px', fontSize: '0.88rem', color: colors.inkMuted, lineHeight: 1.5 }}>{card.body}</p>
                    <button onClick={() => navigate('/login')} className="cta-primary-hover" style={landing.ctaPrimary(false)}>Sign In</button>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </Reveal>
      </section>

      <footer style={landing.footer}>
        &copy; {new Date().getFullYear()} {AIRPORT.footerText}
      </footer>
    </div>
  );
};

export default Landing;
