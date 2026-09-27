import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken, generateSsoTicket } from '@repo/auth-core';

// This is called by site1 or account to generate a ticket to pass to site2.
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('site1_session')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ticket = generateSsoTicket(payload.userId as string);
  return NextResponse.json({ ticket });
}
