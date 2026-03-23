import React, { useState, useEffect, useRef, useCallback } from 'react';
import Gallery from './components/gallery';
import HomePage from './components/HomePage';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import { getCurrentSession, signOut, getUserGroups } from './services/auth';
import './App.css';

const INACTIVITY_MS = 10 * 60 * 1000; // 10 minutes

function App() {
  const [session,   setSession]   = useState(null);
  const [checking,  setChecking]  = useState(true);
  const [view,      setView]      = useState('home');      // 'home' | 'gallery' | 'admin'
  const [category,  setCategory]  = useState(null);       // active gallery category
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

  // Inactivity timer
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

  // 401 → sign out
  useEffect(() => {
    const handler = () => handleSignOut();
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, [handleSignOut]);

  if (checking) return null;
  if (!session)  return <LoginPage onLogin={setSession} />;

  if (view === 'admin' && isAdmin) {
    return (
      <AdminPage
        onHome={() => setView('home')}
        onSignOut={handleSignOut}
      />
    );
  }

  if (view === 'gallery') {
    return (
      <Gallery
        category={category}
        onSignOut={handleSignOut}
        onHome={() => { setView('home'); setCategory(null); }}
      />
    );
  }

  return (
    <HomePage
      onSignOut={handleSignOut}
      onViewGallery={(cat) => { setCategory(cat || null); setView('gallery'); }}
      onAdmin={() => setView('admin')}
      isAdmin={isAdmin}
    />
  );
}

export default App;
