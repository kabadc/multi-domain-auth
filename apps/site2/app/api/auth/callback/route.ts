import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ticket = url.searchParams.get('ticket');

  if (!ticket) {
    return NextResponse.json({ error: 'Missing ticket' }, { status: 400 });
  }

  // Server-to-server exchange with auth provider
  const res = await fetch('http://localhost:3000/api/auth/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Exchange failed' }, { status: 401 });
  }

  const { user } = await res.json();

  // Set local site2 cookie
  const cookieStore = await cookies();
  cookieStore.set('site2_session', JSON.stringify(user), {
    path: '/',
    httpOnly: false, // Set to false so we can read it easily on the client for the PoC
    secure: true,
    sameSite: 'lax',
  });

  return NextResponse.redirect('https://site2.local');
}
