import crypto from 'crypto';

// In-memory store for PoC (This would be a database like DynamoDB or Redis in production)
const refreshTokens = new Map<string, string>();

export function createRefreshToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  refreshTokens.set(token, userId);
  return token;
}

export function validateAndRotateRefreshToken(token: string): { valid: boolean, userId?: string, newToken?: string } {
  const userId = refreshTokens.get(token);
  if (!userId) return { valid: false };
  
  // Refresh Token Rotation (RTR): Burn the old token, issue a new one
  refreshTokens.delete(token);
  const newToken = createRefreshToken(userId);
  return { valid: true, userId, newToken };
}

export function revokeRefreshToken(token: string) {
  refreshTokens.delete(token);
}
