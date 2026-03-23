import React, { useState, useEffect, useRef, useCallback } from 'react';
import Gallery from './components/gallery';
import HomePage from './components/HomePage';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import AboutMePage from './components/AboutMePage';
import ReservationPage from './components/ReservationPage';
import ContactPage from './components/ContactPage';
import InfoPage from './components/InfoPage';
import { getCurrentSession, signOut, getUserGroups } from './services/auth';
import './App.css';

const INACTIVITY_MS = 10 * 60 * 1000;

function App() {
  const [session,   setSession]   = useState(null);
  const [checking,  setChecking]  = useState(true);
  const [view,      setView]      = useState('home');
  const [category,  setCategory]  = useState(null);
  const [isAdmin,   setIsAdmin]   = useState(false);
  const inactivityTimer = useRef(null);

  const handleSignOut = useCallback(() => {
    signOut();
    setSession(null);
    setView('home');
    setCategory(null);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(handleSignOut, INACTIVITY_MS);
  }, [handleSignOut]);

  useEffect(() => {
    getCurrentSession()
      .then(sess => {
        setSession(sess);
        getUserGroups().then(groups => setIsAdmin(groups.includes('Admin')));
      })
      .catch(() => setSession(null))
      .finally(() => setChecking(false));
  }, []);

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
  if (!session)  return <LoginPage onLogin={setSession} />;

  // Shared navigation object passed to every page
  const nav = {
    onHome:        () => { setView('home'); setCategory(null); },
    onAbout:       () => setView('about'),
    onInfo:        () => setView('info'),
    onReservation: () => setView('reservation'),
    onContact:     () => setView('contact'),
    onViewGallery: (cat) => { setCategory(cat || null); setView('gallery'); },
    onAdmin:       () => setView('admin'),
    onSignOut:     handleSignOut,
  };

  if (view === 'admin' && isAdmin) {
    return <AdminPage onHome={nav.onHome} onSignOut={handleSignOut} />;
  }

  if (view === 'gallery') {
    return (
      <Gallery
        category={category}
        onSignOut={handleSignOut}
        onHome={nav.onHome}
        {...nav}
        isAdmin={isAdmin}
      />
    );
  }

  if (view === 'about')       return <AboutMePage       {...nav} isAdmin={isAdmin} />;
  if (view === 'reservation') return <ReservationPage   {...nav} isAdmin={isAdmin} />;
  if (view === 'contact')     return <ContactPage       {...nav} isAdmin={isAdmin} />;
  if (view === 'info')        return <InfoPage          {...nav} isAdmin={isAdmin} />;

  return (
    <HomePage
      {...nav}
      isAdmin={isAdmin}
    />
  );
}

export default App;
