import { SignJWT, jwtVerify } from 'jose';

// Secret key should be environment variable in production.
const SECRET_KEY = new TextEncoder().encode("super-secret-key-for-poc-only-do-not-use-in-production");

export async function signSessionToken(payload: { userId: string, email: string }) {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(SECRET_KEY);
  return jwt;
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (err) {
    return null;
  }
}
