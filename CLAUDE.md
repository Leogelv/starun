# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This project follows **Feature-Sliced Design (FSD)** architecture. The structure is:

```
/fsd
  /app      - Application-wide settings, providers, and initialization
  /pages    - Page components (can use entities and shared)
  /entities - Business entities with hooks and types (can only use shared)
  /shared   - Reusable utilities, components, API clients (no dependencies on other layers)
```

**Import Rules**: Higher layers can import from lower layers, but not vice versa. Slices within the same layer are isolated.

## Development Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run dev:https        # Development with HTTPS (Telegram requires HTTPS)
npm run dev:custom-https # Custom HTTPS server on port 3443

# Build & Production
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint

# SSL Certificates (for HTTPS development)
npm run cert:generate    # Generate SSL certificates
npm run cert:install     # Install certificates locally
```

## Key Technologies

- **Next.js 15.3.2** with App Router
- **React 19** with TypeScript
- **Tailwind CSS v4** + Ant Design for UI
- **Supabase** for database and authentication
- **React Query** (TanStack Query) for server state
- **Telegram Mini Apps SDK** for Telegram integration

## Common Development Patterns

### Adding a New Feature

1. Create entity in `/fsd/entities/[entity-name]/`
2. Define types in `types.ts`
3. Create React Query hooks in `hooks/use-[entity].ts`
4. Add API client methods in `/fsd/shared/api/[entity].ts`
5. Create API route in `/app/api/[entity]/route.ts`
6. Build UI components using the entity hooks

### API Pattern

All API calls follow this flow:
```
Component → Entity Hook → React Query → API Client → Next.js Route → Supabase
```

Example:
```typescript
// In component
const { data: users } = useUsers();

// Entity hook uses React Query
export const useUsers = () => useQuery({
  queryKey: ['users'],
  queryFn: userApi.getAll
});

// API client calls Next.js route
export const userApi = {
  getAll: () => apiClient.get<User[]>('/users')
};
```

### Telegram Integration

The app runs inside Telegram as a Mini App. Key points:
- Must use HTTPS in development for Telegram testing
- Access Telegram user data via `useTelegramUser()` hook
- Handle browser development mode with `@/fsd/app/providers/telegram-provider`
- Use safe area CSS variables for proper mobile display

## Database

PostgreSQL via Supabase. Main table structure:
- `tg_users`: Stores Telegram user data with fields like username, first_name, last_name, language_code

## Important Files

- `/docs/FEATURE_IMPLEMENTATION_GUIDE.md` - Step-by-step guide for adding features
- `/docs/ARCHITECTURE.md` - Detailed FSD architecture explanation
- `/docs/API_CONVENTIONS.md` - API patterns and error handling
- `/docs/TELEGRAM_INTEGRATION.md` - Telegram Mini App integration details