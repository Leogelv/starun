# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run dev:https    # Start HTTPS development server (required for Telegram Mini App)

# Build & Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture Overview

This is a **Telegram Mini App** built with Next.js 15 App Router and follows **Feature Sliced Design (FSD)** methodology.

### Key Technologies
- **Next.js 15.3.2** with App Router and Turbopack
- **TypeScript** with strict mode
- **Ant Design** for UI components
- **Tailwind CSS v4** for styling
- **React Query (TanStack Query)** for server state
- **Supabase** for database and auth
- **Telegram Apps SDK** for Telegram integration

### Directory Structure

```
app/                    # Next.js App Router
├── (client)/          # Client-side routes group with TelegramContext
├── admin/             # Admin panel routes
└── api/               # API routes

fsd/                   # Feature Sliced Design layers
├── app/              # App initialization, providers, global styles
├── entities/         # Business entities (users, lessons, etc.)
├── pages/            # Page components
└── shared/           # Shared utilities, API clients, components
```

### FSD Layer Rules
- Higher layers can import from lower layers
- Lower layers cannot import from higher layers
- Slices within a layer are isolated from each other
- Flow: `app` → `pages` → `entities` → `shared`

## Key Implementation Details

### Telegram Integration
- All client routes must be wrapped with `TelegramContext` (see `app/(client)/layout.tsx`)
- User registration happens automatically via `TelegramUser` component
- HTTPS is required for local development (`npm run dev:https`)
- Telegram user data is validated and stored in `tg_users` table

### API Development
- API routes follow Next.js App Router conventions (`app/api/`)
- Use Supabase service role key for server-side operations only
- Client-side uses Supabase anon key with Row Level Security
- All API responses should follow consistent error handling patterns

### Database
- Supabase PostgreSQL with Row Level Security enabled
- Required `tg_users` table with fields: `telegram_id`, `username`, `first_name`, `last_name`, `photo_url`
- Use `upsert` for user creation/updates to handle duplicates

### State Management
- **Server State**: React Query with hooks in `fsd/entities/*/hooks/`
- **Client State**: React Context API or local useState
- **Global App State**: Context providers in `fsd/app/providers/`

### Development Workflow
1. For Telegram Mini App development, use `npm run dev:https`
2. Set the HTTPS URL (e.g., `https://172.19.0.1:3000`) as Web App URL in BotFather
3. Test in Telegram by starting the bot and clicking the Mini App button

### Testing Notes (from Cursor rules)
- Test on Railway after 220 sec sleep if API routes were modified
- Push after each commit
- Think through thing/property/relationship (philosophical categories)

## Environment Variables

```env
# Public (client-side)
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Private (server-side only)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```