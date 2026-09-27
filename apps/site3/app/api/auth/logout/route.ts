import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Site 3 Logout Route (Demonstrating Global Logout / SLO)
export async function POST() {
  const cookieStore = await cookies();
  
  // 1. Destroy local cookies
  cookieStore.delete('site3_session');
  cookieStore.delete('site3_refresh');
  
  // 2. Return the Global Logout URL that the frontend should redirect to!
  return NextResponse.json({ 
    success: true,
    redirect: 'https://auth.site1.local/api/auth/logout?returnTo=https://site3.local'
  });
}
