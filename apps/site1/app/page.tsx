'use client';

import { useState, useEffect } from 'react';

export default function Site1Page() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('demo@site1.local');
  const [password, setPassword] = useState('password123');

  useEffect(() => {
    fetch('/api/auth/session').then(res => res.json()).then(data => {
      if (data.authenticated) setSession(data.user);
    });
  }, []);

  const login = async (e: React.FormEvent) => {
    console.log('click');
    e.preventDefault();
    console.log('fetch to api', email, password);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    console.log('fetch to api res', res);
    if (res.ok) {
      const data = await res.json();
      setSession(data.user);
    } else {
      alert('Login failed');
    }
  };

  const logout = async () => {
    // In a full implementation, you'd call an API to clear the cookie.
    document.cookie = 'site1_session=; domain=.site1.local; Max-Age=0; path=/';
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
        <div style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px', marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Inline Login</h3>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '10px' }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '10px' }} />
          <button type="button" onClick={login} style={{ padding: '10px', background: 'black', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '4px' }}>Sign In</button>
        </div>
      )}
    </div>
  );
}
