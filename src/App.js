import React, { useState, useEffect, useRef, useCallback } from 'react';
import Gallery from './components/gallery';
import HomePage from './components/HomePage';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import AboutMePage from './components/AboutMePage';
import ReservationPage from './components/ReservationPage';
import ContactPage from './components/ContactPage';
import InfoPage from './components/InfoPage';
import PortfolioPage from './components/PortfolioPage';
import { getCurrentSession, signOut, getUserGroups } from './services/auth';
import './App.css';

const INACTIVITY_MS = 10 * 60 * 1000;
const IS_ADMIN_PATH = window.location.pathname.replace(/\/$/, '') === '/admin';

/* ─── Admin sub-app ─────────────────────────────────────── */
function AdminApp() {
  const [session,  setSession]  = useState(null);
  const [checking, setChecking] = useState(true);
  const [denied,   setDenied]   = useState(false);
  const inactivityTimer = useRef(null);

  const handleSignOut = useCallback(() => {
    signOut();
    setSession(null);
    setIsAdmin(false);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(handleSignOut, INACTIVITY_MS);
  }, [handleSignOut]);

  const verifyAdmin = useCallback(async (sess) => {
    const groups = await getUserGroups();
    if (groups.includes('Admin')) {
      setSession(sess);
    } else {
      signOut();
      setDenied(true);
    }
  }, []);

  useEffect(() => {
    getCurrentSession()
      .then(sess => verifyAdmin(sess))
      .catch(() => setSession(null))
      .finally(() => setChecking(false));
  }, [verifyAdmin]);

  useEffect(() => {
    if (!session) return;
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [session, resetTimer]);

  useEffect(() => {
    const handler = () => handleSignOut();
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, [handleSignOut]);

  if (checking) return null;

  if (denied) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'Montserrat,sans-serif', gap:16 }}>
      <div style={{ fontSize:10, letterSpacing:'0.38em', textTransform:'uppercase', color:'#a89e92' }}>Access Denied</div>
      <div style={{ fontSize:13, fontWeight:300, color:'#6b6155' }}>Admin access required.</div>
      <button onClick={() => setDenied(false)} style={{ marginTop:8, fontSize:9, letterSpacing:'0.28em', textTransform:'uppercase', background:'#111', color:'#fff', border:'none', padding:'10px 24px', cursor:'pointer' }}>Try Again</button>
    </div>
  );

  if (!session) {
    return (
      <LoginPage onLogin={(sess) => {
        setChecking(true);
        verifyAdmin(sess).finally(() => setChecking(false));
      }} />
    );
  }

  return (
    <AdminPage
      onHome={() => { window.location.href = '/'; }}
      onSignOut={handleSignOut}
    />
  );
}

/* ─── Public site ───────────────────────────────────────── */
function PublicApp() {
  const [view,     setView]     = useState('home');
  const [category, setCategory] = useState(null);

  const nav = {
    onHome:        () => { setView('home'); setCategory(null); },
    onAbout:       () => setView('about'),
    onInfo:        () => setView('info'),
    onReservation: () => setView('reservation'),
    onContact:     () => setView('contact'),
    onPortfolio:   () => { setView('portfolio'); setCategory(null); },
    onViewGallery: (cat) => { setCategory(cat || null); setView('gallery'); },
  };

  if (view === 'portfolio')   return <PortfolioPage   {...nav} />;
  if (view === 'about')       return <AboutMePage     {...nav} />;
  if (view === 'reservation') return <ReservationPage {...nav} />;
  if (view === 'contact')     return <ContactPage     {...nav} />;
  if (view === 'info')        return <InfoPage        {...nav} />;
  if (view === 'gallery') {
    return (
      <Gallery
        category={category}
        onHome={nav.onHome}
        onPortfolio={nav.onPortfolio}
        onContact={nav.onContact}
      />
    );
  }

  return <HomePage {...nav} />;
}

/* ─── Root ──────────────────────────────────────────────── */
function App() {
  return IS_ADMIN_PATH ? <AdminApp /> : <PublicApp />;
}

export default App;
