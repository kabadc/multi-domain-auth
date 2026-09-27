'use client';

import { useEffect, useState } from 'react';

export default function SSOPopup() {
  const [status, setStatus] = useState('Checking session...');
  const [needsLogin, setNeedsLogin] = useState(false);
  const [email, setEmail] = useState('demo@site1.local');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const sendTicketAndClose = async () => {
    try {
      const ticketRes = await fetch('/api/auth/ticket', { method: 'POST' });
      if (!ticketRes.ok) {
        setStatus('Failed to generate ticket.');
        setNeedsLogin(false);
        return;
      }

      const { ticket } = await ticketRes.json();
      
      if (window.opener) {
        window.opener.postMessage({ type: 'SSO_TICKET', ticket }, '*');
        setStatus('Authentication successful! Returning...');
        setNeedsLogin(false);
        setTimeout(() => window.close(), 500);
      } else {
        setStatus('No opener found. You can close this window.');
        setNeedsLogin(false);
      }
    } catch (err) {
      setStatus('Error generating ticket.');
      setNeedsLogin(false);
    }
  };

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          // No session found, prompt login
          setNeedsLogin(true);
          setStatus('');
          return;
        }

        // Session exists!
        setStatus('Session found! Generating ticket...');
        await sendTicketAndClose();
      } catch (err) {
        setStatus('Error checking session.');
      }
    }

    checkSession();
  }, []);

  const handleLogin = async () => {
    setError('');
    setStatus('Logging in...');
    setNeedsLogin(false);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        setStatus('Login successful! Generating ticket...');
        await sendTicketAndClose();
      } else {
        setError('Invalid credentials');
        setNeedsLogin(true);
        setStatus('');
      }
    } catch (err) {
      setError('An error occurred during login');
      setNeedsLogin(true);
      setStatus('');
    }
  };

  if (needsLogin) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', padding: '20px' }}>
        <form style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '15px' }}>
          <h3 style={{ textAlign: 'center', margin: 0 }}>Sign In</h3>
          <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginTop: 0 }}>No active session found. Please log in to continue to Site 2.</p>
          
          {error && <div style={{ color: 'red', textAlign: 'center', fontSize: '14px' }}>{error}</div>}
          
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Email"
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Password"
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
          <button 
            type="button" 
            onClick={handleLogin} 
            style={{ padding: '10px', background: 'purple', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
            Sign In & Connect
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p>{status}</p>
    </div>
  );
}
