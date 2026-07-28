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

## Design Reference (Important Rule)

When designing frontend pages (especially in the Owner App or Admin Panel), **always refer to the `reference/` folder**. This folder contains the initial Figma exports from the founder. 
However, **always make sure the new page is consistent with the rest of the existing app**. Do not blindly follow the Figma if it conflicts with the established UI patterns in the codebase (e.g., standard headers, FABs, paddings). 
Do not invent random UI designs or layouts without first consulting the reference and the existing app structure. The goal is to match the original intent shown in `reference/figma-src` while maintaining global UI consistency.

## Mobile App Testing Rule (Important Rule)

When developing or fixing features in mobile applications (such as the Owner App in `apps/owner/`):
- **Always verify changes on the Android Emulator.** Use ADB commands (e.g., `adb shell input tap`, `adb shell uiautomator dump`, `adb exec-out screencap -p`) to actively interact with and test the app just like you use a browser for testing web apps.
- **Never assume a bug fix or feature is complete without E2E verification.** After modifying mobile code, navigate to the affected screen on the emulator, trigger the user flow, and confirm via screenshot or UI dump that the issue is actually resolved.

## Database Tracking (Important Rule)

Track any database schema changes with proper numbered migrations in `supabase/migrations/` and numbered seed query files.
