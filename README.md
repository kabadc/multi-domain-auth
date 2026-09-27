# Multi-Domain Auth Proof of Concept (PoC)

This is a proof of concept demonstrating how to share authentication state across multiple domains and subdomains using a central Identity Provider (IdP) in a Turborepo + Next.js architecture.

## Overview

The PoC solves the problem of keeping a user logged in across multiple public-facing websites without relying on full-page redirects.

Included Applications:
- **`apps/auth`** (`auth.site1.local:3000`): The central Identity Provider (IdP) holding the mock database and ticket exchange logic.
- **`apps/site1`** (`site1.local:3001`): A public-facing site that shares the root domain `.site1.local`.
- **`apps/account`** (`account.site1.local:3002`): A protected portal that relies on the `.site1.local` cookie.
- **`apps/site2`** (`site2.local:3003`): A public-facing site on a completely separate domain, demonstrating cross-domain session recovery via SSO tickets and silent popup handshakes.

## Running the PoC

Because modern browsers enforce strict security boundaries on cross-domain cookies (`SameSite=None`), this PoC requires **HTTPS** to function correctly. We use **Caddy** as a local reverse proxy to automatically generate locally trusted SSL certificates.

### 1. Prerequisites
Install Caddy on your machine:
- **macOS:** `brew install caddy` (and optionally `brew install nss` for Firefox support)
- **Windows:** `choco install caddy` or `scoop install caddy`
- **Linux:** See [Caddy Installation Docs](https://caddyserver.com/docs/install)

### 2. Configure Local Domains (`/etc/hosts`)
Map the PoC domains to your local machine. Edit your `/etc/hosts` file (requires `sudo`) and add the following lines at the bottom:
```text
127.0.0.1 site1.local
127.0.0.1 account.site1.local
127.0.0.1 auth.site1.local
127.0.0.1 site2.local
127.0.0.1 site3.local
```

### 3. Start the Next.js Applications
In the root directory of this repository, install dependencies and start the Turborepo dev server:
```bash
pnpm install
pnpm dev
```
*(This starts the apps on ports 3000, 3001, 3002, and 3003)*

### 4. Start Caddy (Reverse Proxy)
Open a **second terminal window** in the root of this repository (where the `Caddyfile` is located) and run:
```bash
caddy run
```
*(Note: Your OS may ask for an administrator password the first time to install the local Root CA certificate.)*

### 5. Test the Architecture
Open your browser and navigate to:
- [https://site1.local](https://site1.local) - Log in here using the inline modal.
- [https://account.site1.local](https://account.site1.local) - Notice you are instantly logged in without redirects.
- [https://site2.local](https://site2.local) - Test the cross-domain recovery (either via the "Go to Site 2" button on site1, or by clicking "Recover Session Silently" directly on site2).

## Documentation

For a detailed explanation of the architecture and sequence diagrams of the ticket exchange flows, please see [docs/cross-domain.md](./docs/cross-domain.md).
