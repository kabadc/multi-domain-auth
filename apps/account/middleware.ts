import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Since this is account.site1.local, it automatically receives the site1_session cookie!
  const token = request.cookies.get('site1_session')?.value;

  if (!token) {
    // Redirect to Auth Provider
    const redirectUrl = encodeURIComponent('https://account.site1.local');
    return NextResponse.redirect(`https://auth.site1.local/login?redirect=${redirectUrl}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
