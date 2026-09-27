'use client';

import { useEffect, useState } from 'react';

export default function SSOPopup() {
  const [status, setStatus] = useState('Checking session...');

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          setStatus('No active session. Please log in on site1 first.');
          return;
        }

        const ticketRes = await fetch('/api/auth/ticket', { method: 'POST' });
        if (!ticketRes.ok) {
          setStatus('Failed to generate ticket.');
          return;
        }

        const { ticket } = await ticketRes.json();
        
        // Post the ticket back to the opener (site2.local)
        if (window.opener) {
          window.opener.postMessage({ type: 'SSO_TICKET', ticket }, '*'); // In production, restrict targetOrigin!
          setStatus('Session found! Returning...');
          setTimeout(() => window.close(), 500);
        } else {
          setStatus('No opener found. You can close this window.');
        }
      } catch (err) {
        setStatus('Error checking session.');
      }
    }

    checkSession();
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <p>{status}</p>
    </div>
  );
}
