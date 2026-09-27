import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByEmail, signSessionToken } from '@repo/auth-core';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = getUserByEmail(email);

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await signSessionToken({ userId: user.id, email: user.email });
    
    // Set cookie on the .site1.local domain!
    const cookieStore = await cookies();
    cookieStore.set('site1_session', token, {
      domain: '.site1.local', // The magic that shares this with site1 and account!
      path: '/',
      httpOnly: true,
      secure: true,      // Requires HTTPS (Caddy)
      sameSite: 'none',  // 'none' is needed if used in cross-site popups/iframes
      maxAge: 60 * 60 * 2 // 2 hours
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
