# Multi-Domain Authentication Architecture (Final)

This document outlines the final production-ready architecture for sharing authentication state across 16+ domains and subdomains using a centralized Identity Provider (IdP) model with Refresh Token Rotation.

## 1. Centralized Login & Subdomain Sharing (The `.site1.local` boundary)

To avoid duplicating login forms across 16 sites, no consumer application builds its own UI. Instead, all consumer sites launch the central Auth Provider's popup or hosted login page.

When applications share the same registrable domain (e.g., `site1.local` and `account.site1.local`), they instantly share authentication state via a Root Domain Cookie (`Domain=.site1.local`).

### Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Site1 as site1.local
    participant Auth as auth.site1.local (IdP)

    User->>Site1: Clicks "Open Central Login"
    Site1->>Auth: window.open('/sso/popup')
    Auth-->>User: Renders Central Login Form (Email or Google)
    User->>Auth: Submits Credentials
    Auth->>Auth: Validates & Sets Root Cookie (Domain=.site1.local)
    Auth->>Site1: window.opener.postMessage('SSO_TICKET')
    Auth->>Auth: window.close()
    
    Site1->>Site1: Fetches /api/auth/session to confirm
    Site1-->>User: User is logged in!
```

## 2. Cross-Domain SSO & Token Exchange (The `site2.local` boundary)

Modern browsers enforce strict partitions on cross-site cookies. A cookie set for `.site1.local` cannot be read by `site2.local`. To recover a session seamlessly, we use an SSO Ticket Exchange paired with **Confidential Client Secrets** and **Refresh Tokens**.

```mermaid
sequenceDiagram
    participant User
    participant Site2 as site2.local (Frontend)
    participant Site2API as site2.local (Backend)
    participant Auth as auth.site1.local

    User->>Site2: Clicks "Sign In with Auth Provider"
    Site2->>Auth: window.open('/sso/popup')
    
    Note over Auth: Browser attaches the .site1.local master cookie!
    Auth->>Auth: Validates Master Session & Mints Ticket
    Auth->>Site2: window.opener.postMessage({ ticket: "uuid-1234" })
    Auth->>Auth: window.close()
    
    Site2->>Site2API: Redirects to /api/auth/callback?ticket=uuid-1234
    
    Note over Site2API,Auth: Secure Server-to-Server Exchange
    Site2API->>Auth: POST /api/auth/exchange { ticket, client_secret }
    Auth->>Auth: Validates Secret & Burns Ticket
    Auth-->>Site2API: Returns { user, accessToken, refreshToken }
    
    Site2API->>Site2API: Sets site2_session (15 mins) & site2_refresh (HttpOnly, 7 days)
    Site2API-->>User: Redirects to home, User lands logged in!
```

## 3. Silent Background Renewal (Refresh Token Rotation)

Because third-party cookies (and hidden iframes) are blocked by modern browsers (Safari ITP), consumer sites enforce a short-lived local session and silently renew it server-to-server.

```mermaid
sequenceDiagram
    participant User
    participant Site2 as site2.local (Frontend)
    participant Site2API as site2.local (Backend)
    participant Auth as auth.site1.local

    User->>Site2: Browses site or loads page
    Site2->>Site2: Notices 15-minute Access Token is missing/expired
    Site2->>Site2API: POST /api/auth/refresh
    
    Note over Site2API: Browser attaches the HttpOnly site2_refresh cookie
    
    Site2API->>Auth: Server-to-Server POST /api/auth/refresh { refreshToken, client_secret }
    Auth->>Auth: Verifies secret, Rotates Refresh Token (RTR)
    Auth-->>Site2API: Returns { accessToken, newRefreshToken }
    
    Site2API->>Site2API: Updates local cookies
    Site2API-->>Site2: Returns { success, user }
    Site2-->>User: Renders page silently without redirect!
```

## Security Best Practices Implemented

1. **No Frontend AWS SDKs:** Consumer sites do not import heavy OAuth or AWS Amplify SDKs. All Cognito interactions are abstracted strictly to the `auth.site1.local` backend.
2. **Confidential Clients:** Cross-domain exchanges require a backend `client_secret`, preventing intercepted tickets or tokens from being maliciously used.
3. **HttpOnly Refresh Tokens:** Long-lived 7-day tokens are strictly `HttpOnly`, mathematically preventing XSS theft.
4. **Refresh Token Rotation (RTR):** Every time a refresh token is used, it is burned and a new one is issued. If a token is stolen and used simultaneously, the IdP detects the reuse and revokes all access globally.
