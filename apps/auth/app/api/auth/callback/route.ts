import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signSessionToken } from '@repo/auth-core';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    // For PoC visualization, we'll pretend the code was successful even if missing, 
    // since Cognito won't actually redirect back if the client ID is fake.
    // In production, you would throw an error here.
  }

  /* 
  ========================================================================
  BOILERPLATE: Exchanging the code for tokens via Cognito
  ========================================================================
  const tokenResponse = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code,
      redirect_uri: REDIRECT_URI,
    })
  });
  
  const { id_token, access_token } = await tokenResponse.json();
  
  // The ID token is a JWT containing the user object!
  const decodedUser = decodeJwt(id_token); // using the 'jose' library
  ========================================================================
  */

  // Mocking the result of the token exchange for the PoC
  const mockUser = { id: 'google_123', email: 'google.user@example.com', name: 'Google User (Via OAuth)' };
  
  // Create our own internal session token to track the user across our domains
  const token = await signSessionToken({ userId: mockUser.id, email: mockUser.email });
  
  // Set the root domain cookie (Subdomain Sharing)
  const cookieStore = await cookies();
  cookieStore.set('site1_session', token, {
    domain: '.site1.local',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 60 * 60 * 2 // 2 hours
  });

  // Because this flow happened inside a popup, we return a tiny HTML page 
  // that messages the main window (site1.local) and closes itself.
  const html = `
    <html>
      <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh;">
        <p>Authentication successful! Returning you to the app...</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'SOCIAL_LOGIN_SUCCESS' }, '*');
            window.close();
          } else {
            // If opened via full page redirect (not popup), return to the app
            window.location.href = 'https://account.site1.local';
          }
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}
