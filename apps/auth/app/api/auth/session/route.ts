import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, getUserById } from '@repo/auth-core';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('site1_session')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = getUserById(payload.userId as string);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: { id: user.id, email: user.email, name: user.name }
  });
}
