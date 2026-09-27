# Multi-Domain Authentication Architecture

This document outlines the architecture and flow for sharing authentication state across multiple domains and subdomains without relying on forced full-page redirects on public-facing sites.

## 1. Subdomain Cookie Sharing (The `.site1.local` boundary)

When applications share the same registrable domain (eTLD+1), they can seamlessly share authentication state using a Root Domain Cookie. 

In our architecture, `site1.local`, `account.site1.local`, and `auth.site1.local` all share the `.site1.local` domain.

### Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Site1 as site1.local
    participant Account as account.site1.local
    participant Auth as auth.site1.local (IdP)

    User->>Site1: Submits Login Form (Inline)
    Site1->>Auth: POST /api/auth/login (via proxy)
    Auth-->>Site1: Returns HTTP-Only Cookie (Domain=.site1.local)
    Site1-->>User: Logs user in on frontend
    
    Note over User,Auth: The cookie is now stored in the browser for all .site1.local domains.

    User->>Account: Navigates to account.site1.local
    Account->>Account: Middleware checks cookie
    Account-->>User: Instantly grants access (Zero Redirects)
```

## 2. Cross-Domain Session Recovery (The `site2.local` boundary)

Modern browsers enforce strict partitions on cookies. A cookie set for `.site1.local` cannot be read by `site2.local`. To recover a session on a completely different domain without a full-page redirect, we use a single-use SSO Ticket Exchange system.

We implemented two primary patterns for this:

### Pattern A: Link-Based Seamless Hop
When a user navigates from `site1` to `site2` via a link, we can pre-emptively attach a secure ticket.

```mermaid
sequenceDiagram
    participant User
    participant Site1 as site1.local
    participant Auth as auth.site1.local
    participant Site2 as site2.local

    User->>Site1: Clicks "Go to Site 2"
    Site1->>Auth: POST /api/auth/ticket (with site1_session cookie)
    Auth-->>Site1: Returns { ticket: "uuid-1234" }
    Site1->>Site2: Redirects user to site2.local/api/auth/callback?ticket=uuid-1234
    
    Site2->>Auth: Server-to-Server POST /api/auth/exchange { ticket }
    Auth-->>Site2: Validates & Burns Ticket. Returns User Profile.
    Site2->>Site2: Sets local site2_session cookie
    Site2-->>User: User lands logged in!
```

### Pattern B: Silent SSO Popup Handshake
If a user navigates directly to `site2.local` (e.g., via a bookmark), they won't have a ticket in the URL. We use a brief, silent popup to bridge the cross-domain gap securely.

```mermaid
sequenceDiagram
    participant User
    participant Site2 as site2.local
    participant Popup as auth.site1.local/sso/popup

    User->>Site2: Clicks "Recover Session"
    Site2->>Popup: window.open('.../sso/popup')
    
    Note over Popup: The browser automatically attaches the .site1.local cookie to this request!
    
    Popup->>Popup: Validates session & requests SSO Ticket
    Popup->>Site2: window.opener.postMessage({ ticket: "uuid-5678" })
    Popup->>Popup: window.close()
    
    Site2->>Site2: Exchanges ticket via API
    Site2-->>User: Updates UI (Logged in) without page reload!
```

## Security Considerations

1. **Short-Lived Tickets**: SSO tickets must expire quickly (e.g., 60 seconds) to prevent interception and reuse.
2. **Burn on Read**: The IdP must delete the ticket from its store the exact moment it is exchanged.
3. **HTTPS is Mandatory**: For `SameSite=None` cookies to function in cross-domain contexts (like the popup/iframe), they must be marked `Secure`, which requires HTTPS (handled locally via Caddy).
4. **postMessage Security**: In production, `window.opener.postMessage(data, targetOrigin)` must strictly specify the allowed `targetOrigin` (e.g., `https://site2.com`) rather than using `*` to prevent malicious domains from stealing the ticket.
