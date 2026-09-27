# Multi-Domain Authentication Proof of Concept (PoC)

## 1. Overview
This PoC demonstrates how to share authentication state across multiple domains using a central Identity Provider (IdP). 
The goal is to provide a seamless login experience across:
- `site1.local` (Public Site 1)
- `account.site1.local` (Account Portal)
- `auth.site1.local` (Central IdP)
- `site2.local` (Public Site 2 - Cross-Domain)

**Core Constraint:** `site1` and `site2` are public-facing and should not force full-page redirects to the auth provider when a user visits.

## 2. Local SSL Setup with Caddy
Yes, using **Caddy** to spoof domains with SSL is an excellent suggestion! Modern browsers enforce strict privacy rules. Specifically, if we want to test cross-domain iframe communication or cookies with `SameSite=None`, the connection **must** be `Secure` (HTTPS). 

Caddy can act as a reverse proxy, automatically generating local trusted certificates and routing traffic from port 443 to our Next.js apps running on ports 3000-3003.

> **QUESTION 1 (Local Infrastructure):** Are you comfortable installing Caddy natively on your machine, or would you prefer we set up a `docker-compose.yml` to run Caddy in a container? 
I can run it in my machine

## 3. Architecture & Session Recovery Patterns

### A. Subdomain Sharing (`site1.local`, `account.site1.local`, `auth.site1.local`)
Since these share the same registrable domain (`.site1.local`), an HTTP-only cookie set by the auth service will be automatically sent to the other subdomains. No complex handshakes required.

### B. Cross-Domain Session Recovery (`site2.local`)
Since `site2.local` cannot read `.site1.local` cookies, we will implement two patterns:
1. **Link-Based SSO Ticket:** When a user navigates from `site1` to `site2` via a link, we append a short-lived, single-use ticket (`site2.local?sso_ticket=123`). `site2` exchanges this ticket on the backend for a session.
2. **Silent Popup Handshake:** For direct visits to `site2`, clicking "Sign In" opens a tiny popup to `auth.site1.local`. If the user has a session, it instantly uses `window.opener.postMessage()` to send an authorization code back to `site2` and closes itself.

> **QUESTION 2 (Session Recovery):** Do these two cross-domain patterns make sense for your use case? Are there any specific edge cases (like third-party cookie blocking) you want to simulate heavily? looks fine, auth.site1 would have all the logic needed to for example mint and destroy the exchange tokens between sites and the redict in account?

## 4. Implementation Phases

### Phase 1: Repository Structure & Caddy Setup
- Rename/scaffold the Next.js apps (`apps/auth`, `apps/site1`, `apps/account`, `apps/site2`).
- Set up the `Caddyfile` for reverse proxying.
- Update `/etc/hosts`.

> **QUESTION 3 (Apps Setup):** Should we rename the existing `apps/web` and `apps/docs` to fit our new structure, or leave them and generate 4 brand new Next.js apps? You can delete them and just leave the ones needed for the poc

### Phase 2: The Shared Auth Core (`packages/auth-core`)
- Implement a lightweight JWT session manager.
- Implement an in-memory ticket issuer/validator to handle the `sso_ticket` exchange securely.

> **QUESTION 4 (Mock Database):** For this PoC, is an in-memory store (or a simple JSON file) sufficient for users and tickets, or do you want to wire up a lightweight SQLite DB (e.g., using Prisma/Drizzle)? a simple json file is fine we don't want to complicate things

### Phase 3: The Identity Provider (`apps/auth`)
- Build the `POST /api/auth/login` endpoint.
- Build the `/sso/popup` bridge for cross-domain messaging.
- Build the ticket exchange endpoint.

### Phase 4: Consuming the Auth State
- **`apps/site1`:** Implement an inline login modal (using `shadcn/ui`) that calls the auth API directly.
- **`apps/account`:** Implement middleware to verify the `.site1.local` cookie and redirect if unauthenticated.
- **`apps/site2`:** Implement the `useSilentSso` hook and the `/api/auth/callback` route to handle incoming tickets.

> **QUESTION 5 (UI & Styling):** You have `shadcn/ui` configured. Should we build custom login forms using these components to keep it looking premium, or keep the UI extremely barebones to focus purely on the auth logic? You can use shadcn, just dont over complicate things.

## Next Steps
Once you've reviewed and commented on the questions above, let me know, and we can begin executing Phase 1!
