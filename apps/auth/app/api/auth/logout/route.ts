import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: 'site1_session',
    value: '',
    domain: '.site1.local',
    path: '/',
    secure: true,
    sameSite: 'none',
    maxAge: 0,
  });
  return response;
}

// Added GET handler to support Top-Level Redirects for Global Logout (SLO)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const returnTo = url.searchParams.get('returnTo') || 'https://site1.local';

  // Issue the redirect back to the consumer site
  const response = NextResponse.redirect(returnTo);
  
  // Wipe the master cookie!
  response.cookies.set({
    name: 'site1_session',
    value: '',
    domain: '.site1.local',
    path: '/',
    secure: true,
    sameSite: 'none',
    maxAge: 0, 
  });

  return response;
}
