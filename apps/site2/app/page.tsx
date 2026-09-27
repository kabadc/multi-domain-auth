'use client';

import { useState, useEffect } from 'react';

export default function Site2Page() {
  const [user, setUser] = useState<any>(null);
  
  // Quick way to check cookie on client (for PoC)
  useEffect(() => {
    const match = document.cookie.match(/(^| )site2_session=([^;]+)/);
    if (match) {
      try {
        setUser(JSON.parse(decodeURIComponent(match[2])));
      } catch(e) {}
    }
  }, []);

  const recoverSession = () => {
    // Open the silent SSO popup
    const popup = window.open('https://auth.site1.local/sso/popup', 'sso', 'width=400,height=500');

    const messageHandler = (event: MessageEvent) => {
      // In production, restrict origin!
      if (event.data?.type === 'SSO_TICKET') {
        window.removeEventListener('message', messageHandler);
        // We have the ticket, exchange it
        window.location.href = `/api/auth/callback?ticket=${event.data.ticket}`;
      }
    };

    window.addEventListener('message', messageHandler);
  };

  const logout = () => {
    document.cookie = 'site2_session=; Max-Age=0; path=/';
    setUser(null);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Welcome to Site2 (Cross-Domain)</h1>
      <p>This is a completely different domain.</p>

      {user ? (
        <div style={{ padding: '20px', border: '1px solid purple', marginTop: '20px', borderRadius: '8px' }}>
          <h2>Logged in as {user.name} on Site 2!</h2>
          <p>Email: {user.email}</p>
          <button onClick={logout} style={{ padding: '10px', marginTop: '10px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px' }}>Logout of Site 2</button>
        </div>
      ) : (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px dashed #999', borderRadius: '8px' }}>
          <p>No active session found on Site 2.</p>
          <button onClick={recoverSession} style={{ padding: '10px', background: 'purple', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '4px' }}>
            Sign In with Auth Provider
          </button>
        </div>
      )}
    </div>
  );
}
