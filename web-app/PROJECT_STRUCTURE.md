# Project Structure

This project is organized for clarity, scalability, and maintainability. Below is an updated overview of the folder structure and the purpose of each directory, reflecting the current status and recent changes.

```
├── public/                     # Static assets
├── src/
│   ├── components/             # React components
│   │   ├── auth/               # Authentication components (login, register, etc.)
│   │   ├── dashboard/          # Dashboard and related widgets
│   │   ├── patients/           # Patient management UI
│   │   ├── consultations/      # Consultation-related UI
│   │   ├── messaging/          # Real-time messaging UI
│   │   └── shared/             # Shared UI components (buttons, cards, etc.)
│   ├── pages/                  # Page-level components (route targets)
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions and helpers
│   ├── types/                  # TypeScript type definitions
│   ├── App.tsx                 # Main app component (includes routing and providers)
│   ├── main.tsx                # React entry point (sets up Clerk and Convex providers)
│   └── index.css               # Global styles
├── convex/                     # Convex backend functions and generated code
│   ├── _generated/             # Convex generated code (do not edit manually)
│   ├── auth.ts                 # Convex authentication logic (role-based access, user management)
│   ├── users.ts                # User-related queries and mutations
│   ├── patients.ts             # Patient-related queries and mutations
│   ├── messages.ts             # Messaging logic (with getForCurrentUser, etc.)
│   ├── encounters.ts           # Encounter-related logic
│   ├── consultations.ts        # Consultation-related logic
│   ├── files.ts                # File upload/download/delete logic (Convex storage)
│   ├── security.ts             # Security utilities for file validation, audit, etc.
│   └── schema.ts               # Convex database schema
├── package.json
├── vite.config.ts
└── ...
```

## Key Integrations
- **Convex**: Backend logic, database, and authentication state (see `convex/`).
- **Clerk**: Authentication provider, integrated at the root in `main.tsx`.
- **Convex + Clerk**: Use `<Authenticated>`, `<Unauthenticated>`, and `<AuthLoading>` from `convex/react` for UI control based on auth state. Use `useConvexAuth()` for auth state in React.

## Main Entry Points
- **src/main.tsx**: Sets up React root, ClerkProvider, and ConvexProviderWithClerk.
- **src/App.tsx**: Main app logic, routing, and providers. UI is conditionally rendered based on authentication state.

## Folder Descriptions
- **public/**: Static files served directly (favicon, robots.txt, etc).
- **src/components/**: All React components, organized by feature/domain.
  - **auth/**: Login, registration, password reset, etc.
  - **dashboard/**: Doctor dashboard, widgets, stats, etc.
  - **patients/**: Patient list, patient details, forms, etc.
  - **consultations/**: Consultation history, status, forms, etc.
  - **messaging/**: Real-time chat, notifications, etc.
  - **shared/**: Buttons, cards, modals, and other reusable UI elements.
- **src/pages/**: Top-level pages, each corresponding to a route.
- **src/hooks/**: Custom React hooks for state, data fetching, etc.
- **src/utils/**: Utility functions, helpers, and non-React logic.
- **src/types/**: TypeScript type definitions and interfaces.
- **convex/**: Convex backend logic, database schema, and generated code.
  - Includes new files for file handling and security utilities.

## Migration Notes
- Move existing components from `src/components/` into the appropriate subfolders.
- Create `src/types/` and move all type/interface definitions there.
- Consider renaming `components/ui/` to `components/shared/` for clarity.
- Remove or merge `src/lib/` if not needed.

## Contribution
- Follow this structure for new features/components.
- Keep shared logic DRY and reusable.
- Document any new folders or major changes in this file. 