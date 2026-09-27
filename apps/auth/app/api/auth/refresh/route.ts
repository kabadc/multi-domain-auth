import { NextResponse } from 'next/server';
import { validateAndRotateRefreshToken, getUserById } from '@repo/auth-core';

export async function POST(req: Request) {
  const { refreshToken, clientSecret } = await req.json();
  
  if (clientSecret !== (process.env.EXPECTED_CLIENT_SECRET || 'super_secret_site2_key')) {
    return NextResponse.json({ error: 'Unauthorized client - Invalid Secret' }, { status: 401 });
  }

  if (!refreshToken) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  // Check the DB and apply Refresh Token Rotation!
  const { valid, userId, newToken } = validateAndRotateRefreshToken(refreshToken);
  
  if (!valid || !userId) {
    return NextResponse.json({ error: 'Invalid or revoked refresh token' }, { status: 401 });
  }

  const user = getUserById(userId);
  return NextResponse.json({
    user,
    refreshToken: newToken // Issue the new rotated token
  });
}
