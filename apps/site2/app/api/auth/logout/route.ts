import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // To implement perfect SLO, we would ALSO do a server-to-server POST to 
  // auth.site1.local/revoke passing the site2_refresh token to burn it in the central DB.
  
  // Destroy local cookies
  cookieStore.delete('site2_session');
  cookieStore.delete('site2_refresh');
  
  return NextResponse.json({ success: true });
}
