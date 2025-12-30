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
│   ├── landingv2/        # Alternative landing page
│   └── telegram-bot/     # Vercel serverless Telegram bot
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
  - `users` - Customer data (person records)
  - `contracts` - One contract per user (1:1 relationship)
  - `accounts` - One billing account per contract (1:1 relationship)
  - `services` - Available internet plans/tariffs
  - `subscriptions` - User's active services
  - `transactions` - Financial transactions
  - `payments` - Payment records
  - `invoices` - Generated invoices
  - `auth_sessions` - Temporary auth sessions for various login methods

- **Edge Functions** (Deno runtime at `/supabase/functions/`):
  - `contract-auth` - Auth by contract number + full name
  - `phone-auth-init` - Initiate phone call verification
  - `phone-auth-verify` - Check phone verification status
  - `email-auth-send` - Send email verification code
  - `email-auth-verify` - Verify email code
  - `telegram-auth` - Telegram bot deep link authentication

- **Key architectural decisions**:
  - All IDs use `BIGINT` (not UUID) for performance
  - One-to-one relationships: user → contract → account
  - `account_number` format: `{contract_number}-1` (e.g., "206268-1")
  - `full_name` is auto-generated via trigger from first/last/middle names
  - No `customer_number` field (removed during refactor)

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
- CRUD operations for users, contracts, accounts, services
- Dashboard statistics

### Shared Packages

**@pg19/api**:
- `createSupabaseClient()` - Factory for Supabase client
- `useSupabase()` - Admin composable with CRUD methods (getUsers, getContracts, etc.)
- `useClientAuth()` - Client composable that calls Edge Functions for auth

**@pg19/types**:
- All TypeScript interfaces (User, Contract, Account, etc.)
- IMPORTANT: `accounts` is now singular `account` in auth responses (one-to-one)
- Type hierarchy: `User` → `Contract` → `Account`

**@pg19/ui**:
- Shared Vue components used across apps

### Telegram Bot

Serverless bot deployed to Vercel at `/apps/telegram-bot/`:
- Webhook endpoint: `/api/webhook`
- Handles `/start auth_{sessionId}` for deep link authentication
- Verifies Telegram ID against database, marks session as verified

## Authentication Flow

1. **Client initiates auth** (e.g., enters phone number)
2. **Edge Function** creates `auth_sessions` record with method + identifier
3. **Verification**:
   - Phone: Asterisk calls user, CDR webhook updates session
   - Email: 6-digit code sent, user enters code
   - Telegram: Deep link opens bot, bot verifies and updates session
   - Contract: Direct name verification
4. **Client polls or submits** verification
5. **Edge Function returns** `{ person: User, contract: Contract, account: Account }`
6. **Client stores** in Pinia + localStorage

## Deployment

### Vercel Projects
- `pg19-client` - Client portal (client-portal/)
- `pg19-admin` - Admin panel (admin-panel/)
- `pg19-land` - Landing page (landing/)
- `telegram-bot` - Telegram bot (telegram-bot/)

### Required Environment Variables

**Client Portal & Admin Panel**:
- `NUXT_PUBLIC_SUPABASE_URL`
- `NUXT_PUBLIC_SUPABASE_ANON_KEY`
- `NUXT_PUBLIC_ASTERISK_VERIFY_NUMBER` (phone to display for verification)
- `NUXT_PUBLIC_TELEGRAM_BOT_USERNAME` (without @)

**Telegram Bot**:
- `TELEGRAM_BOT_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Supabase Edge Functions** (set via Supabase dashboard):
- `SUPABASE_SERVICE_ROLE_KEY`
- `ASTERISK_WEBHOOK_URL` (optional, for triggering calls)
- `SMTP_WEBHOOK_URL` (optional, for sending emails)
- `TELEGRAM_BOT_TOKEN` (for telegram-auth function)
- `ASTERISK_VERIFY_NUMBER` (returned to client for display)

### Git Workflow

- `main` - Production branch
- `dev` - Development branch (current working branch)
- Push to `dev` triggers Vercel preview deployments
- Merge `dev` → `main` for production deployment

## Important Conventions

1. **Database schema changes**: Create migrations in Supabase, update TypeScript types in `packages/types/`, update Edge Functions if needed

2. **Adding new auth method**:
   - Create Edge Function in `/supabase/functions/{method}-auth/`
   - Update `useClientAuth.ts` composable
   - Add UI in client portal
   - Deploy Edge Function to Supabase

3. **Workspace dependencies**: Use `workspace:*` protocol in package.json for internal packages

4. **ID types**: Always use `number` (BIGINT) for IDs, never `string` (UUID removed)

5. **Relationship queries**: Use `.single()` for one-to-one relationships (user/contract/account)

## Supabase Project Details

- **Project ID**: `bjvqukdmexkleunkehez`
- **URL**: `https://bjvqukdmexkleunkehez.supabase.co`
- **Region**: eu-central-1 (Frankfurt)
- **Database**: PostgreSQL 15
- **Edge Functions**: Deno runtime, deployed via MCP or Supabase CLI
