# Frontend Architecture

```text
frontend/src/
├── app/
│   ├── pages/               # Route-level pages
│   ├── router.tsx           # Routes and protected pages
│   ├── AppLayout.tsx        # Header, main content, and footer
│   └── providers.tsx        # Application providers
│
├── modules/
│   ├── auth/                # Sign-in and authentication
│   ├── generator/           # Learning path form and generation
│   ├── learning-path/       # Learning path view and progress
│   └── dashboard/           # User's learning path list
│
├── shared/
│   ├── components/          # Reusable UI components
│   ├── api/                 # HTTP client and common error handling
│   ├── hooks/               # Reusable React hooks
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Shared helper functions
│
├── assets/                  # Images, icons, fonts, etc.
└── main.tsx                 # Application entry point
```

The React frontend uses a module-based structure. Each main feature has its own module, such as authentication, learning path generation, learning path progress, and the dashboard.

Pages use components from these modules inside a shared application layout. Reusable UI components, common types, and the HTTP client are stored in `shared/`.

## Data Fetching and State

- **Server state:** TanStack Query handles data from FastAPI (caching, loading and error states, retries). Mutations such as generating a learning path use `useMutation`.
- **API calls:** Each module keeps its own request functions in `api/` and exposes them through hooks in `hooks/`. The base HTTP client and common error handling live in `shared/api/`.
- **Client state:** Local component state is used by default for UI interactions. Zustand is used only when several components need the same client state, such as authentication.
- **Rule:** Server data is not copied into Zustand. It stays in the TanStack Query cache.

FastAPI manages and stores the application data. Global state is kept to a minimum.

The frontend communicates with FastAPI using HTTP/JSON. It does not connect directly to PostgreSQL or the AI provider.

## Module Folder

Each module contains the code related to one specific part of the application.

For example, the `learning-path` module contains everything needed to display and manage a learning path.

A module can contain:

```text
modules/
└── learning-path/
    ├── components/      # UI components used only by this module
    ├── api/             # API requests for this module
    ├── hooks/           # React hooks used by this module
    ├── types.ts         # Types used by this module
    └── index.ts         # Public exports of the module
```

Code should stay inside a module when it is only used by that module.

For example:

- `LearningPathCard` → `modules/learning-path/components/`
- `getLearningPath()` → `modules/learning-path/api/`
- `useLearningPath()` → `modules/learning-path/hooks/`
- `LearningPath` type → `modules/learning-path/types.ts`

If something is used by different modules, it can be moved to `shared/`.

For example, a generic `Button`, `Loading`, or `ErrorMessage` component belongs in `shared/components/`.