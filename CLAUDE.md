# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PG19 is an ISP (Internet Service Provider) billing system with multiple web applications in a pnpm monorepo. The system migrated from Directus/RabbitMQ to Supabase for the backend.

## Repository Structure

```
pg19/
├── apps/
│   ├── client-portal/    # Customer self-service portal (Nuxt 3)
│   ├── admin-panel/      # Internal admin dashboard (Nuxt 3)
│   ├── landing/          # Public marketing website (Nuxt 3)
│   └── landingv2/        # Alternative landing page
├── packages/
│   ├── @pg19/api/        # Supabase client & composables
│   ├── @pg19/types/      # Shared TypeScript types
│   └── @pg19/ui/         # Shared Vue components
├── supabase/functions/   # Edge Functions (Deno runtime)
└── scripts/              # Utility scripts (CSV import, etc.)
```

## Development Commands

### Running Applications Locally
```bash
# Install dependencies (first time)
pnpm install

# Run client portal only
pnpm dev:client

# Run admin panel only
pnpm dev:admin

# Run both client + admin in parallel
pnpm dev

# Run landing page
pnpm dev:landing
```

### Building
```bash
# Build all apps
pnpm build

# Build specific app
pnpm build:client
pnpm build:admin
pnpm build:landing
```

### Testing & Quality
```bash
# Type checking across all packages
pnpm typecheck

# Linting
pnpm lint
```

### Database & Data Scripts
```bash
# Import CSV data to Supabase
cd scripts
npx tsx import-csv-to-supabase.ts /path/to/data.csv
```

## Architecture

### Backend: Supabase

- **Database**: PostgreSQL with the following key tables:
  - `users` - Customer data (person records, ~22k rows)
  - `accounts` - Billing accounts with contract data merged (1:1 with users, ~22k rows)
  - `services` - Available internet plans/tariffs (~241 rows)
  - `subscriptions` - User's active services (~73k rows)
  - `transactions` - Financial transactions
  - `payments` - Payment records
  - `invoices` - Generated invoices
  - `auth_sessions` - Temporary auth sessions for various login methods
  - `news` - News/announcements system (RLS enabled)
  - `news_attachments` - File attachments for news
  - `news_read_status` - Tracks which users read which news

- **Edge Functions** (Deno runtime at `/supabase/functions/`):
  - `contract-auth` - Auth by contract number + full name
  - `phone-auth-init` - Initiate phone call verification
  - `phone-auth-verify` - Check phone verification status
  - `email-auth-send` - Send email verification code (Gmail SMTP)
  - `email-auth-verify` - Verify email code
  - `telegram-auth` - Legacy Telegram auth (deprecated)
  - `telegram-auth-init` - Create session with deep link URL
  - `telegram-auth-check` - Poll session verification status
  - `telegram-bot-webhook` - Handle Telegram bot commands (/start auth_{sessionId})

- **Key architectural decisions**:
  - All IDs use `BIGINT` (not UUID) for performance
  - **Simplified structure**: `users` → `accounts` (1:1), contracts merged into accounts
  - Contract data (contract_number, contract_status, start_date, end_date) lives in `accounts` table
  - `full_name` is auto-generated via trigger from first/last/middle names
  - No separate `contracts` table (merged into accounts)

### Frontend Apps

All frontends are **Nuxt 3** applications with:
- **Styling**: Tailwind CSS
- **State Management**: Pinia stores
- **Form Validation**: VeeValidate + Zod
- **UI Components**: Shared via `@pg19/ui` package

**Client Portal** (`apps/client-portal/`):
- 4 authentication methods: Contract+Name, Phone call, Email code, Telegram
- Protected routes via `middleware/auth.ts`
- Auth state in `stores/auth.ts` with localStorage persistence
- API calls via `composables/useApi.ts` (calls Supabase Edge Functions)

**Admin Panel** (`apps/admin-panel/`):
- Direct Supabase queries via `@pg19/api` composables
- CRUD operations for users, accounts, services, subscriptions
- Dashboard statistics
- News management

### Shared Packages

**@pg19/api**:
- `createSupabaseClient()` - Factory for Supabase client
- `useSupabase()` - Admin composable with CRUD methods (getUsers, getAccounts, etc.)
- `useClientAuth()` - Client composable that calls Edge Functions for auth

**@pg19/types**:
- All TypeScript interfaces (User, Account, Service, Subscription, etc.)
- `Contract` type kept for backward compatibility (deprecated, use Account)
- Type hierarchy: `User` → `Account` (1:1 relationship)
- Account contains contract fields: contract_number, contract_status, start_date, end_date

**@pg19/ui**:
- Shared Vue components used across apps

### Telegram Bot

Bot webhook is handled by Edge Function `telegram-bot-webhook`:
- Webhook URL: `https://{supabase-url}/functions/v1/telegram-bot-webhook`
- Handles `/start auth_{sessionId}` for deep link authentication
- Verifies Telegram ID against `users.telegram_id`, marks session as verified
- Bot username configured via `TELEGRAM_BOT_USERNAME` secret

## Authentication Flow

1. **Client initiates auth** (e.g., enters phone number)
2. **Edge Function** creates `auth_sessions` record with method + identifier
3. **Verification**:
   - Phone: Asterisk calls user, CDR webhook updates session
   - Email: 6-digit code sent, user enters code
   - Telegram: Deep link opens bot, bot verifies and updates session
   - Contract: Direct name verification
4. **Client polls or submits** verification
5. **Edge Function returns** `{ person: User, account: Account }` (account includes contract data)
6. **Client stores** in Pinia + localStorage

## Deployment

### Architecture

```
Internet → Cloudflare Tunnel → Traefik (:80) → Docker Containers
```

- **Traefik** - Reverse proxy with automatic routing based on Docker labels
- **Wildcard DNS** - `*.doka.team` points to Cloudflare Tunnel

### Production (main branch)

| App | URL |
|-----|-----|
| Client Portal | https://client.doka.team |
| Admin Panel | https://admin.doka.team |
| Landing | https://land.doka.team |
| Landing V2 | https://landv2.doka.team |
| Traefik Dashboard | http://localhost:8181 (on server) |
| Coolify Dashboard | https://doka.team |

### Preview Environments (non-main branches)

Preview URLs are generated automatically with format: `{app}-{branch}-{MMDD-HHMM}.doka.team`

Examples:
- `client-dev-1230-1530.doka.team`
- `admin-feature-auth-0115-0930.doka.team`

Previews are automatically cleaned up when PR is merged/closed.

### Server Access

```bash
# SSH via Cloudflare Tunnel (requires cloudflared installed)
ssh doka-server

# Or manually:
ssh -o ProxyCommand="cloudflared access ssh --hostname %h" vv@ssh.dokasteel.ru
```

### Manual Deployment

```bash
ssh doka-server
cd /opt/pg19
sudo git pull origin main
sudo docker compose up -d traefik
sudo docker compose build client-portal admin-panel landing landingv2
sudo docker compose up -d --force-recreate
```

### Docker Configuration

- `Dockerfile` - Universal Dockerfile with `APP_NAME` build arg
- `docker-compose.yml` - Traefik + production services with labels
- `.env` on server (`/opt/pg19/.env`) - Contains Supabase credentials

**Healthcheck Notes:**
- All containers have healthchecks that Traefik uses to determine routing eligibility
- Use `127.0.0.1` instead of `localhost` in healthchecks (Alpine Linux DNS resolution issue)
- `start_period: 60s` - Nuxt apps need time to start in production mode
- Traefik filters out containers with "unhealthy" or "starting" status

### Cloudflare Configuration

**DNS Records (Cloudflare):**
- `*.doka.team` → Tunnel (wildcard for previews)
- `doka.team` → Tunnel

**Tunnel config:** `/etc/cloudflared/doka-team.yml`
```yaml
ingress:
  - hostname: doka.team
    service: http://localhost:8088  # Coolify
  - hostname: "*.doka.team"
    service: http://localhost:80    # Traefik
  - service: http_status:404
```

**Tunnel service:** `cloudflared-doka-team.service`

### GitHub Actions Auto-Deploy

Workflow: `.github/workflows/deploy.yml`

**Triggers:**
| Branch | Action |
|--------|--------|
| `main` | Deploy to production |
| `dev`, `feature/*` | Create preview environment |
| PR closed | Cleanup preview containers |

**Required Secret:**
- `SSH_PRIVATE_KEY` - Ed25519 private key for server access

### Required Environment Variables

**Client Portal & Admin Panel**:
- `NUXT_PUBLIC_SUPABASE_URL`
- `NUXT_PUBLIC_SUPABASE_ANON_KEY`
- `NUXT_PUBLIC_ASTERISK_VERIFY_NUMBER` (phone to display for verification)
- `NUXT_PUBLIC_TELEGRAM_BOT_USERNAME` (without @)

**Supabase Edge Functions** (set via Supabase dashboard or MCP):
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN` - Telegram bot token
- `TELEGRAM_BOT_USERNAME` - Bot username: `PG19CONNECTBOT` (without @)
- `SMTP_USER` - Gmail address for sending codes
- `SMTP_PASS` - Gmail App Password (not regular password)
- `ASTERISK_WEBHOOK_URL` (optional, for triggering phone calls)

### Git Workflow

- `main` - Production branch
- `dev` - Development branch (current working branch)
- Push to `dev` or `main` triggers GitHub Actions auto-deploy

## Important Conventions

1. **Database schema changes**: Create migrations in Supabase, update TypeScript types in `packages/types/`, update Edge Functions if needed

2. **Adding new auth method**:
   - Create Edge Function in `/supabase/functions/{method}-auth/`
   - Update `useClientAuth.ts` composable
   - Add UI in client portal
   - Deploy Edge Function to Supabase

3. **Workspace dependencies**: Use `workspace:*` protocol in package.json for internal packages

4. **ID types**: Always use `number` (BIGINT) for IDs, never `string` (UUID removed)

5. **Relationship queries**: Use `.single()` for one-to-one relationships (user/account)

6. **Account = Contract + Account**: The `accounts` table contains both billing account and contract data. Query accounts directly, not a separate contracts table

## Supabase Project Details

- **Project ID**: `bjvqukdmexkleunkehez`
- **URL**: `https://bjvqukdmexkleunkehez.supabase.co`
- **Region**: eu-central-1 (Frankfurt)
- **Database**: PostgreSQL 15
- **Edge Functions**: Deno runtime, deployed via MCP or Supabase CLI
