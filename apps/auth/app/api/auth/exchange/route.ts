import { NextResponse } from 'next/server';
import { consumeSsoTicket, getUserById } from '@repo/auth-core';

// This is called by site2 backend to exchange the short-lived ticket for a user profile
export async function POST(req: Request) {
  try {
    const { ticket } = await req.json();
    if (!ticket) {
      return NextResponse.json({ error: 'Missing ticket' }, { status: 400 });
    }

    const userId = consumeSsoTicket(ticket);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid or expired ticket' }, { status: 401 });
    }

    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
