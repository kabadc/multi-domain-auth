'use client';

import { useState, useEffect } from 'react';

export default function Site3Page() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const checkCookieAndRenew = async () => {
      const match = document.cookie.match(/(^| )site3_session=([^;]+)/);
      if (match) {
        try {
          setUser(JSON.parse(decodeURIComponent(match[2])));
        } catch(e) {}
      } else {
        const res = await fetch('/api/auth/refresh', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      }
    };
    
    checkCookieAndRenew();
  }, []);

  const recoverSession = () => {
    const popup = window.open('https://auth.site1.local/sso/popup', 'sso', 'width=400,height=500');

    const messageHandler = (event: MessageEvent) => {
      if (event.data?.type === 'SSO_TICKET') {
        window.removeEventListener('message', messageHandler);
        window.location.href = `/api/auth/callback?ticket=${event.data.ticket}`;
      }
    };
    window.addEventListener('message', messageHandler);
  };

  const logout = async () => {
    // 1. Hit local backend to clear site3 cookies
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    const data = await res.json();
    
    // 2. Perform Top-Level Redirect to Auth Provider to achieve Global Logout (SLO)
    if (data.redirect) {
      window.location.href = data.redirect;
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Welcome to Site3 (Cross-Domain SLO Demo)</h1>
      <p>This is a completely different domain.</p>

      {user ? (
        <div style={{ padding: '20px', border: '1px solid purple', marginTop: '20px', borderRadius: '8px' }}>
          <h2>Logged in as {user.name} on Site 3!</h2>
          <p>Email: {user.email}</p>
          <button onClick={logout} style={{ padding: '10px', marginTop: '10px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px' }}>
            Logout Globally (SLO)
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px dashed #999', borderRadius: '8px' }}>
          <p>No active session found on Site 3.</p>
          <button onClick={recoverSession} style={{ padding: '10px', background: 'purple', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '4px' }}>
            Sign In with Auth Provider
          </button>
        </div>
      )}
    </div>
  );
}
