# Engineering Standards & Architecture Rules

## 1. Technology Stack

- **Monorepo**: Turborepo with `pnpm` workspaces
- **Framework**: Next.js 16 (App Router)
- **UI Components & Styling**: shadcn/ui (Radix UI primitives, Lucide React icons, Tailwind CSS)
- **Testing**: Vitest (accompanied by `@testing-library/react` and `jsdom`/`happy-dom`)

## 2. Architectural Principles

### Atomic Design

All UI components must be categorized strictly according to Atomic Design principles:

- **Atoms (`components/atoms/`)**: Primitive UI components (buttons, badges, inputs, labels, avatars, icons). No business logic, no side-effects, purely presentational.
- **Molecules (`components/molecules/`)**: Small assemblies of atoms acting as a cohesive unit (e.g., search bars with submit buttons, form fields with validation labels).
- **Organisms (`components/organisms/`)**: Standalone, complex interface components composed of molecules and atoms (e.g., navigation header, authentication forms, data tables, modals).
- **Templates / Layouts (`components/templates/` or route `layout.tsx`)**: Layout structures establishing arrangement and spacing without hardcoded data.
- **Pages / Views (`app/**/page.tsx`)**: Route endpoints assembling templates, organisms, and data fetching.

### Separation of Concerns (Business Logic Outside Client Components)

- **No inline business logic in client-facing components**: Components (`*.tsx`) must only concern themselves with rendering UI, managing localized view state (e.g., dropdown open/close), and handling user interactions.
- **Domain Logic Isolation**:
  - Extract state machines, calculations, session checks, and data transformations into custom hooks (`hooks/*.ts`), services (`services/*.ts`), or domain utilities (`lib/*.ts`).
  - Pass handlers and state down into components via props or dedicated React Context providers.
- **Server vs Client**:
  - Keep sensitive operations, token handling, and multi-domain auth flows in Server Components, Server Actions, or Route Handlers.
  - Client components should receive data as props or via dedicated custom hooks.

## 3. Testing Requirements (Vitest)

- **Mandatory Vitest Suites**: Every feature developed must include automated test coverage using Vitest.
- **Scope of Tests**:
  - Domain utilities and business logic services: Unit tested for edge cases, failures, and expected transformations.
  - Custom hooks: Tested using `renderHook` from `@testing-library/react`.
  - Component interactions: Molecules and organisms tested with React Testing Library and Vitest for accessibility, rendering states, and user interactions.
- **Execution**: All tests must run cleanly via `turbo run test` or `pnpm test`.
