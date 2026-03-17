import React, { useState, useEffect, useRef, useCallback } from 'react';
import Gallery from './components/gallery';
import LoginPage from './components/LoginPage';
import { getCurrentSession, signOut } from './services/auth';
import './App.css';

const INACTIVITY_MS = 10 * 60 * 1000; // 10 minutes

function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const inactivityTimer = useRef(null);

  const handleSignOut = useCallback(() => {
    signOut();
    setSession(null);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  }, []);

  // Reset inactivity timer on user activity
  const resetTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(handleSignOut, INACTIVITY_MS);
  }, [handleSignOut]);

  useEffect(() => {
    getCurrentSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setChecking(false));
  }, []);

  // Start inactivity timer when session is active
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

  // Listen for 401 from API interceptor
  useEffect(() => {
    const handler = () => handleSignOut();
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, [handleSignOut]);

  if (checking) return null;

  if (!session) {
    return <LoginPage onLogin={setSession} />;
  }

  return (
    <div className="App">
      <Gallery onSignOut={handleSignOut} session={session} />
    </div>
  );
}

export default App;
