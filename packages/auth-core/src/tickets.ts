// For a PoC, an in-memory Map is sufficient. 
// In production with serverless functions, use Redis (e.g., Upstash) to store tickets.
const ticketStore = new Map<string, { userId: string, expiresAt: number }>();

export function generateSsoTicket(userId: string): string {
  const ticket = crypto.randomUUID(); // Requires Node 19+ or Web Crypto API
  // Ticket expires in 60 seconds to prevent long-lived exposure
  const expiresAt = Date.now() + 60000;
  ticketStore.set(ticket, { userId, expiresAt });
  return ticket;
}

export function consumeSsoTicket(ticket: string): string | null {
  const record = ticketStore.get(ticket);
  
  if (!record) {
    return null; // Invalid or already consumed
  }

  // Always burn the ticket immediately to prevent replay attacks
  ticketStore.delete(ticket);

  if (Date.now() > record.expiresAt) {
    return null; // Expired
  }

  return record.userId;
}
