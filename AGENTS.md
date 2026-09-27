<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# Project Boundaries & Engineering Standards

All AI agents, assistants, and developers contributing to this repository MUST strictly adhere to the following architectural guidelines, tech stack boundaries, and engineering practices.

---

## 1. Technology Stack

- **Monorepo Manager**: Turborepo with `pnpm` workspaces.
- **Framework**: **Next.js 16** (App Router). All applications under `apps/` must use Next.js 16 standards.
- **UI Components & Styling**: **shadcn/ui** (utilizing Radix UI primitives, Lucide icons, and Tailwind CSS). Shared components should live in the shared UI package (`packages/ui`) or within app-specific component directories following atomic organization.
- **Testing Framework**: **Vitest** (with React Testing Library / `@testing-library/react` and `jsdom` or `happy-dom`).

---

## 2. Architectural Principles

### Atomic Design Methodology

All UI features and components must be structured following Atomic Design:

1. **Atoms (`components/atoms/`)**:
   - Pure, elemental building blocks (e.g., `Button`, `Input`, `Label`, `Badge`, `Avatar`).
   - Purely presentational; no side-effects or external dependencies.
2. **Molecules (`components/molecules/`)**:
   - Combinations of atoms operating as a functional unit (e.g., `SearchInput`, `FormField`, `UserDropdownItem`).
3. **Organisms (`components/organisms/`)**:
   - Complex UI sections composed of molecules, atoms, or other organisms (e.g., `Header`, `LoginFormCard`, `SidebarNavigation`, `DataTable`).
4. **Templates / Layouts (`components/templates/` or `app/**/layout.tsx`)**:
   - Structural skeletons and layout grids defining component placement without hardcoded business data.
5. **Pages / Views (`app/**/page.tsx`)**:
   - Next.js route entry points that bind layouts, organisms, and server/client state together.

### Separation of Concerns: Business Logic Outside Client Components

- **Zero Business Logic in Presentation**: Client-facing components (`*.tsx`) must focus strictly on rendering and user interaction styling.
- **Extract to Domain Layers**:
  - Encapsulate state machines, data fetching, transformation, validation, and domain calculations into custom hooks (e.g., `useAuthSession`, `useDomainSwitcher`), services (`services/*.ts`), or utility functions (`lib/*.ts`).
  - Pass handlers and state into UI components via props or cleanly defined context/hook contracts.
- **Server-Side Operations**: Use Next.js Server Actions, Route Handlers, or backend services for data mutations and external API communication; do not leak sensitive auth or business logic to the client.

---

## 3. Testing Standards (Vitest Mandatory)

- **Test-Driven / Test-Accompanied Development**: Every new feature, hook, utility, or organism must ship with corresponding Vitest tests.
- **Test File Placement**: Place test files adjacent to the source file (e.g., `user-profile.test.tsx` next to `user-profile.tsx`) or inside `__tests__/`.
- **Test Scope**:
  - **Unit Tests**: Full unit test coverage for domain logic, utility functions, hooks (using `renderHook`), and data transformations.
  - **Component Tests**: Interaction and accessibility tests for molecules and organisms using Vitest + React Testing Library (testing user flows, states, and error handling).
- **Execution**: All test suites must be executable via `pnpm test` and integrated into the Turborepo pipeline (`turbo run test`).
