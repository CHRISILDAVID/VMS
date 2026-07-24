# Badminton Manager (VMS)

Multi-app venue management system for badminton court owners.

## Architecture

| App | Path | Platform | Technology |
|-----|------|----------|-----------|
| **Owner App** | `apps/owner/` | Mobile (Android/iOS) | React Native + Expo |
| **Admin Panel** | `apps/admin/` | Web (Desktop) | React + Vite + Tailwind |
| **Shared Code** | `packages/shared/` | — | TypeScript |
| **Backend** | `supabase/` | Cloud | Supabase (PostgreSQL) |

## Development

```bash
# Install all dependencies
pnpm install

# Start owner app (Expo)
pnpm dev:owner

# Start admin panel (Vite)
pnpm dev:admin

# Generate Supabase types
pnpm db:types
```

## Project Structure

```
VMS/
├── apps/owner/         # React Native (Expo) mobile app
├── apps/admin/         # React + Vite web app
├── packages/shared/    # Shared types, services, utils
├── supabase/           # Migrations, edge functions
├── documents/          # Project documentation
└── reference/          # Archived Figma export (design reference)
```

## Key Files

- `documents/` — All product requirements, architecture, and roadmap docs
- `packages/shared/src/types/database.ts` — Auto-generated Supabase types
- `packages/shared/src/services/` — Shared API service layer
- `supabase/migrations/` — Database schema versioning

## Styling

- **Owner App:** NativeWind (Tailwind CSS for React Native)
- **Admin Panel:** Tailwind CSS v4
