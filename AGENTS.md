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

When designing frontend pages (especially in the Owner App or Admin Panel), **always refer to the `reference/` folder**. This folder contains the initial Figma exports from the founder. Do not invent random UI designs or layouts without first consulting this reference. The goal is to perfectly match the original intent shown in `reference/figma-src`.

## Mobile App Testing Rule (Important Rule)

When developing or fixing features in mobile applications (such as the Owner App in `apps/owner/`):
- **Always verify changes on the Android Emulator:** Use ADB commands (e.g., `adb shell input tap`, `adb shell uiautomator dump`, `adb exec-out screencap -p`) to actively interact with and test the app just like you use a browser for testing web apps.
- **Never assume a bug fix is complete without E2E verification:** After modifying mobile code, navigate to the affected screen on the emulator, trigger the user flow, and confirm via screenshot or UI dump that the issue is actually resolved.
