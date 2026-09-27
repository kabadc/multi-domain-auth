'use client';

import { useState, useEffect } from 'react';

export default function Site1Page() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/session').then(res => res.json()).then(data => {
      if (data.authenticated) setSession(data.user);
    });
  }, []);

  const openCentralLogin = () => {
    const popup = window.open('https://auth.site1.local/sso/popup', 'sso', 'width=500,height=650');
    
    const messageHandler = (event: MessageEvent) => {
      // Listen for ticket OR social login success
      if (event.data?.type === 'SSO_TICKET' || event.data?.type === 'SOCIAL_LOGIN_SUCCESS') {
        window.removeEventListener('message', messageHandler);
        // Refresh local session state
        fetch('/api/auth/session').then(res => res.json()).then(data => {
          if (data.authenticated) setSession(data.user);
        });
      }
    };
    window.addEventListener('message', messageHandler);
  };

  const logout = async () => {
    // We MUST call the backend to clear the cookie because it is HttpOnly!
    // Client-side JavaScript cannot delete an HttpOnly cookie.
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
  };

  const ssoToSite2 = async () => {
    const res = await fetch('/api/auth/ticket', { method: 'POST' });
    if (res.ok) {
      const { ticket } = await res.json();
      window.location.href = `https://site2.local/api/auth/callback?ticket=${ticket}`;
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Welcome to Site1 (Public)</h1>
      <p>This is a public site. No redirects happen here.</p>

      {session ? (
        <div style={{ padding: '20px', border: '1px solid green', marginTop: '20px' }}>
          <h2>Logged in as {session.name}</h2>
          <button onClick={ssoToSite2} style={{ padding: '10px', background: 'blue', color: 'white', marginRight: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Go to Site 2 (Cross-Domain Link)
          </button>
          <a href="https://account.site1.local" style={{ padding: '10px', background: 'green', color: 'white', textDecoration: 'none', marginRight: '10px', borderRadius: '4px', display: 'inline-block' }}>
            Go to Account (Same-Domain)
          </a>
          <button onClick={logout} style={{ padding: '10px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px' }}>Logout</button>
        </div>
      ) : (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px dashed #999', borderRadius: '8px', width: '300px' }}>
          <p style={{ textAlign: 'center' }}>No active session found.</p>
          <button type="button" onClick={openCentralLogin} style={{ padding: '10px', background: 'black', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '4px', width: '100%', fontWeight: 'bold' }}>
            Open Central Login
          </button>
        </div>
      )}
    </div>
  );
}
