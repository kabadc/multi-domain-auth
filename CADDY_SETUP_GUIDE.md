# Caddy Setup & Execution Guide

This guide explains how to run the Multi-Domain Auth PoC locally using Caddy as a reverse proxy with locally trusted SSL certificates.

## 1. Prerequisites

You need to install Caddy. Since you mentioned you can run it on your machine, here are the installation commands based on your OS:

**macOS (Homebrew):**
```bash
brew install caddy
brew install nss # Required for Firefox (optional, if you use Firefox)
```

**Windows (Chocolatey / Scoop):**
```bash
choco install caddy
# or
scoop install caddy
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

## 2. Configure Local Domains (`/etc/hosts`)

You need to map our PoC domains to your `localhost` (`127.0.0.1`).

1. Open your terminal.
2. Edit the `/etc/hosts` file (requires `sudo`):
   ```bash
   sudo nano /etc/hosts
   ```
3. Add the following lines at the end of the file:
   ```text
   127.0.0.1 site1.local
   127.0.0.1 account.site1.local
   127.0.0.1 auth.site1.local
   127.0.0.1 site2.local
   ```
4. Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

## 3. The `Caddyfile`

In the root of this monorepo, we will have a file named `Caddyfile` with the following configuration. *(Note: We will create this in Phase 1, you just need to know it exists)*:

```caddyfile
site1.local {
    reverse_proxy localhost:3001
}

account.site1.local {
    reverse_proxy localhost:3002
}

auth.site1.local {
    reverse_proxy localhost:3000
}

site2.local {
    reverse_proxy localhost:3003
}
```

## 4. Running the Projects

Once the repository is scaffolded (Phase 1), you will follow these steps every time you want to develop:

### Step A: Start the Next.js Apps
In a terminal, from the root of the Turborepo, run:
```bash
pnpm dev
```
This will start all four Next.js apps simultaneously on their respective ports (3000, 3001, 3002, 3003).

### Step B: Start Caddy
In a **second terminal window**, from the root of the Turborepo where the `Caddyfile` is located, run:
```bash
caddy run
```
*Note: The first time you run this, Caddy will ask for your OS administrator password. This is because it needs permission to install its local Root Certificate Authority (CA) into your system's trust store so your browsers won't show the "Not Secure" warning.*

### Step C: Test the Apps
Open your browser and navigate to:
- `https://site1.local`
- `https://auth.site1.local`
- `https://account.site1.local`
- `https://site2.local`

You should see the "Connection is secure" padlock icon in your browser, and the apps will route perfectly!
