import React, { useState, useEffect } from 'react';
import Gallery from './components/gallery';
import LoginPage from './components/LoginPage';
import { getCurrentSession, signOut } from './services/auth';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getCurrentSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return null;

  if (!session) {
    return <LoginPage onLogin={setSession} />;
  }

  return (
    <div className="App">
      <Gallery onSignOut={() => { signOut(); setSession(null); }} session={session} />
    </div>
  );
}

export default App;
