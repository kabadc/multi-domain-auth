import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('site2_refresh')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token available' }, { status: 401 });
  }

  // Server-to-server exchange: Trade the refresh token for a new access token
  const res = await fetch('http://localhost:3000/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    // If the Auth Provider rejects the refresh token (e.g. it was revoked globally),
    // we MUST wipe the local cookies and kick the user out!
    cookieStore.delete('site2_session');
    cookieStore.delete('site2_refresh');
    return NextResponse.json({ error: 'Refresh failed - Token revoked' }, { status: 401 });
  }

  const data = await res.json();

  // Success! The Auth Provider gave us a new 15-second Access Token...
  cookieStore.set('site2_session', JSON.stringify(data.user), {
    path: '/', httpOnly: false, secure: true, sameSite: 'lax', maxAge: 15,
  });
  
  // ...and a brand new Rotated Refresh Token!
  cookieStore.set('site2_refresh', data.refreshToken, {
    path: '/', httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60,
  });

  return NextResponse.json({ success: true, user: data.user });
}
