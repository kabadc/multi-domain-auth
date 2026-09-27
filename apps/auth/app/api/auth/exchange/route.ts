import { NextResponse } from 'next/server';
import { consumeSsoTicket, getUserById, createRefreshToken } from '@repo/auth-core';

// This is called by site2 backend to exchange the short-lived ticket for a user profile
export async function POST(req: Request) {
  try {
    const { ticket, clientSecret } = await req.json();
    
    // Validate that the request came from our trusted backend (Site 2), not a random hacker
    if (clientSecret !== (process.env.EXPECTED_CLIENT_SECRET || 'super_secret_site2_key')) {
      return NextResponse.json({ error: 'Unauthorized client - Invalid Secret' }, { status: 401 });
    }

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

    // Generate a long-lived refresh token for this specific client session
    const refreshToken = createRefreshToken(user.id);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      refreshToken
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
