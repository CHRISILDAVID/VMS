# Badminton Manager (VMS)

Multi-app venue management system for badminton court owners and players.

## Architecture

| App | Path | Platform | Technology |
|-----|------|----------|-----------|
| **Owner App** | `apps/owner/` | Mobile (Android/iOS) | React Native + Expo |
| **Player App** | `apps/player/` | Mobile (Android/iOS) | React Native + Expo |
| **Admin Panel** | `apps/admin/` | Web (Desktop) | React + Vite + Tailwind |
| **Shared Code** | `packages/shared/` | — | TypeScript |
| **Backend** | `supabase/` | Cloud | Supabase (PostgreSQL) |

## Development

```bash
# Install all dependencies
pnpm install

# Start owner app (Expo)
pnpm dev:owner

# Start player app (Expo)
pnpm dev:player

# Start admin panel (Vite)
pnpm dev:admin

# Generate Supabase types
pnpm db:types
```

## Project Structure

```
VMS/
├── apps/owner/         # React Native (Expo) — Owner mobile app
├── apps/player/        # React Native (Expo) — Player mobile app (ShuttleHub)
├── apps/admin/         # React + Vite web app
├── packages/shared/    # Shared types, services, utils
├── supabase/           # Migrations, edge functions
├── documents/          # Project documentation
├── owner_reference/    # Owner app Figma reference
└── player_reference/   # Player app Figma reference
```

## Key Files

- `documents/` — All product requirements, architecture, and roadmap docs
- `packages/shared/src/types/database.ts` — Auto-generated Supabase types
- `packages/shared/src/services/` — Shared API service layer
- `supabase/migrations/` — Database schema versioning

## Styling

- **Owner App:** NativeWind (Tailwind CSS for React Native) — Blue professional theme
- **Player App:** NativeWind (Tailwind CSS for React Native) — Navy (#0B1F3A) + Lime (#A7FF3F) sporty theme
- **Admin Panel:** Tailwind CSS v4

## Design Reference for Owners app(Important Rule)

When designing frontend pages (especially in the Owner App or Admin Panel), **always refer to the `owner_reference/` folder**. This folder contains the initial Figma exports from the founder. 
However, **always make sure the new page is consistent with the rest of the existing app**. Do not blindly follow the Figma if it conflicts with the established UI patterns in the codebase (e.g., standard headers, FABs, paddings). 
Do not invent random UI designs or layouts without first consulting the reference and the existing app structure. The goal is to match the original intent shown in `owner_reference/figma-src` while maintaining global UI consistency.

## Design Reference for Player app(Important Rule)

When designing frontend pages (especially in the Player App or Admin Panel), **always refer to the `player_reference/` folder**. This folder contains the initial Figma exports from the founder. 
However, **always make sure the new page is consistent with the rest of the existing app**. Do not blindly follow the Figma if it conflicts with the established UI patterns in the codebase (e.g., standard headers, FABs, paddings). 
Do not invent random UI designs or layouts without first consulting the reference and the existing app structure. The goal is to match the original intent shown in `player_reference/figma-src` while maintaining global UI consistency.

## Mobile App Testing Rule (Important Rule)

When developing or fixing features in mobile applications (such as the Owner App in `apps/owner/` and Player App in `apps/player/`):
- **References** : use `player_reference/` when designing player app UI and features. Use `owner_reference/` when designing owner app UI and features.
- **Commands for using the Android Emulator.** Use ADB commands (e.g., `adb shell input tap`, `adb shell uiautomator dump`, `adb exec-out screencap -p`) to actively interact with and test the app just like you use a browser for testing web apps.
- **Never start E2E verification without confirming with the user or without the user explicitly mentioning it in the prompt.**
- **Verification:** After modifying mobile code, navigate to the affected screen on the emulator, trigger the user flow, and confirm via screenshot or UI dump that the issue is actually resolved.

## Database Tracking (Important Rule)

Track any database schema changes with proper numbered migrations in `supabase/migrations/` and numbered seed query files.

## Remote Database Access (Important Rule)

When an agent needs to access the remote Supabase database to inspect the schema or run queries, you must **ALWAYS ask for the user's explicit permission** before connecting to or modifying the remote DB. Do **NOT** use `npx supabase db dump` or other CLI commands that require Docker. 
Instead, after getting permission, create a short Node.js script (using the `pg` library) or Python script within a dedicated `database_temps/` folder, and use the direct PostgreSQL connection string to connect. Keep the codebase clean.

## Documents Folder Analysis (Important Rule)

Before starting any new phase, milestone, or significant feature implementation, **always fully analyze the `documents/` folder** (specifically files like `10-development-roadmap.md`, `07-backend-architecture.md`, `08-frontend-architecture.md`, and `06-database-design.md`). This ensures that you maintain the established priorities, understand the long-term architecture, and do not deviate from the core roadmap for the app.

## Web App Testing Rule (Important Rule)

Test the admin panel using `pnpm dev:admin` and open browser to view `localhost:5173`, and then navigate through the app. Use this test admin account credential for testing admin panel: `admin@badmintonmanager.com` and password: `badmintonmanager2026`

## Production DB Setup Rule (Important Rule)

Whatever you do with the DB, analyze the `documents/11-supabase-production-setup.md` Document, so that when the user is setting up the prod environment in another account (e.g., the founder's Supabase account), they can review and follow along easily. Make sure any DB-level changes or deployments (like Edge Functions or Migrations) are documented there.

## UI Consistency and Theming (Important Rule)

When developing UI components for mobile apps (Owner App in `apps/owner/` and Player App in `apps/player/`), **do not manually hardcode giant strings of generic Tailwind classes (like `bg-white dark:bg-slate-900 border...`) everywhere**, and **do not use hardcoded hex colors in `StyleSheet.create`**. Act like a senior mobile developer:
1. **Use a common theme:** Ensure your components match the established theme of the page. **Always use NativeWind `className` referencing theme variables** (e.g. `bg-background`, `text-primary`) for styling instead of hardcoding colors, even when building new components. **For the NativeWind components you create (like `Button`, `Card`, `Modal`, `Checkbox` etc.) , always ensure that the component can automatically switch background & foreground colours based on the `ColorScheme` and `theme` provided by the system**
2. **Use reusable components:** Always check `src/components/ui/` for existing standard components (like `Card`, `Input`, `Button`) before building elements from scratch. If a standard component doesn't exist for a basic input, create it in `ui/` to abstract the styles and use it everywhere.

## Theme Toggling (Important Rule)

Design the pages in such a way that there can be a toggle in the settings screen (Dark mode / Light mode / System default). Ensure all UI components and Tailwind configurations support this dynamic theme switching natively.
