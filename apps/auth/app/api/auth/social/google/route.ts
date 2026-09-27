import { NextResponse } from 'next/server';

export async function GET() {
  // BOILERPLATE: Construct the Cognito OAuth2 URL
  const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN || 'https://my-auth-domain.auth.us-east-1.amazoncognito.com';
  const CLIENT_ID = process.env.COGNITO_CLIENT_ID || 'mock-client-id';
  // The redirect URI must perfectly match what is registered in the Cognito App Client settings
  const REDIRECT_URI = 'https://auth.site1.local/api/auth/callback'; 

  const authorizeUrl = new URL(`${COGNITO_DOMAIN}/oauth2/authorize`);
  
  // 'identity_provider' bypasses the Cognito Hosted UI login screen and forwards directly to Google
  authorizeUrl.searchParams.append('identity_provider', 'Google');
  authorizeUrl.searchParams.append('client_id', CLIENT_ID);
  authorizeUrl.searchParams.append('response_type', 'code'); // Standard OAuth 2.0 Auth Code flow
  authorizeUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authorizeUrl.searchParams.append('scope', 'email openid profile');

  // Redirect the popup window to AWS Cognito
  return NextResponse.redirect(authorizeUrl.toString());
}
