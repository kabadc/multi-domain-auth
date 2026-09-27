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
    body: JSON.stringify({ 
      ticket,
      clientSecret: process.env.AUTH_CLIENT_SECRET || 'super_secret_site2_key'
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Exchange failed' }, { status: 401 });
  }

  const { user, refreshToken } = await res.json();

  // Set local site2 access cookie (15 SECONDS for PoC testing so you can watch it expire!)
  const cookieStore = await cookies();
  cookieStore.set('site2_session', JSON.stringify(user), {
    path: '/',
    httpOnly: false, 
    secure: true,
    sameSite: 'lax',
    maxAge: 15 * 60,
  });

  // Set local site2 refresh cookie (7 DAYS, HttpOnly so JS cannot steal it)
  if (refreshToken) {
    cookieStore.set('site2_refresh', refreshToken, {
      path: '/',
      httpOnly: true, 
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  return NextResponse.redirect('https://site2.local');
}
