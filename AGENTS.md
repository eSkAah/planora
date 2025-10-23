# Repository Guidelines

## Project Structure & Module Organization

Core application code lives in `src/`. Use `src/app` for Next.js route groups, `src/components` for reusable UI, and `src/lib` for business logic, API layers, and validations. Domain hooks sit in `src/hooks`, persistent state in `src/store`, and shared types in `src/types`. Generated artifacts (e.g., Supabase types) are stored under `src/generated`. Integration and unit tests belong in `__tests__`, mirroring the feature or module name (for example, `__tests__/auth-actions.test.ts`). Static assets reside in `public/`, while Prisma schemas live in `prisma/` and Supabase assets in `supabase/`.

## Build, Test, and Development Commands

Run `npm run dev` for the Turbopack development server, and `npm run build` followed by `npm run start` to validate production output. Execute `npm run type-check` before pushing to catch TypeScript regressions. `npm run lint` and `npm run format:check` enforce the ESLint + Prettier rules used by Husky during commits. Use `npm test` (or `npm run test:watch`) to run Jest suites locally. Database workflows rely on Prisma (`npm run db:migrate`, `npm run db:push`) and Supabase CLI helpers (`npm run supabase:db:reset`).

## Coding Style & Naming Conventions

TypeScript is strictly typed—avoid `any` and prefer shared interfaces from `src/types`. Follow PascalCase for components, camelCase for functions and variables, and kebab-case for filenames (e.g., `components/ui/button.tsx`). Tailwind CSS v4 with the Apple-inspired palette from `docs/DESIGN.md` drives styling; prefer existing primitives in `components/ui` before introducing new patterns. Prettier (with the Tailwind plugin) and ESLint run automatically via `lint-staged`.

## Testing Guidelines

Jest is configured through `jest.config.ts` and `jest.setup.ts`. Tests should end with `.test.ts` and describe one behavior per `describe` block. Stub network or Supabase calls under `__mocks__` if needed, and aim to cover critical paths—auth flows, scheduling logic, and shared utilities. Run `npm test` before submitting or after schema updates.

## Commit & Pull Request Guidelines

Follow the Conventional Commit style seen in history (`feat:`, `fix:`, etc.) and reference issue or task IDs when relevant. Each PR should include a concise summary, linked Linear/Jira issue, screenshots or screen recordings for UI changes, and notes about tests run (`npm run verify` is the project-wide gate). Ensure design alignment by cross-checking `docs/DESIGN.md` and mention any deviations explicitly.

## Environment & Design Checks

Keep `.env.local` scoped to local secrets; do not commit Supabase keys. Before merging, confirm visual work against the Apple/Tesla aesthetic (rounded corners, 300ms animations) and verify accessibility basics—semantic HTML, focus states, and color contrast.

## Product & Vision Snapshot

- SaaS scheduling platform targeting 50–500 employee organisations in retail, hospitality, services, health, and industry.
- Solves slow manual planning (4–8h/month), legal non-compliance, and costly staffing errors by generating optimised, regulation-aware schedules in under 30 seconds.
- Pricing: Freemium (≤5 staff), then €9/employee (Starter 5–25), €15 (Business 26–100), €25 (Enterprise 100+). Europe-first rollout (FR/LU → EU).
- Core personas: Marie (HR manager, primary user), Thomas (CEO decision maker), Sarah (employee consuming schedules), Admin IT (technical owner).

## Key Capabilities (Phase 1 Focus)

- AI-powered schedule generation (OpenAI) with legal, cost, and preference constraints; requires prompt configurator and quality scoring.
- Employee management CRUD: contracts, availability, import/export, audit trail, responsive UI.
- Advanced planning UI: monthly/weekly/employee views, drag & drop, conflict validation, undo/redo, sub-2s load for 100 employees.
- Time-off workflows: request/approval chain, automatic balance updates, AI-recommended replacements, notifications.
- Security: Supabase RLS per tenant, granular roles (Owner → Viewer), audit logs, RGPD compliance, backups.

## Architecture & Code Organisation

- Layered approach (Presentation → Business → Data → Infrastructure). Presentation handled by Next.js App Router; business logic in hooks/store/features; data access in `lib/api` & `lib/database`; infra utilities in `lib/utils` & constants.
- `src/components/ui` supplies ShadCN-based primitives; domains add features/hook modules. Zustand + TanStack Query manage state/caching; Zod handles validation across layers.
- Data flow: components interact with hooks → store/API clients → Supabase; mutations run through `useMutation` with optimistic updates and shared cache invalidation.

## Roadmap Status (Dec 2024)

- Phase A (Foundations & Tooling) mostly complete—Next.js 15, strict TS, Tailwind, ShadCN, env validation, CI scripts. Outstanding: error logging stack, security headers.
- Phase B (Supabase & data) largely implemented—project setup, schema, RLS, seeds, generated types. Pending: triggers/audit tuning, performance indexes.
- Phase C (Auth & multi-tenant) partially done—Supabase Auth, middleware, premium auth UI. Upcoming: owner onboarding wizard, invitations/roles, tenant settings, MFA decision.
- Later phases cover scheduling UX, AI compliance, leave management, integrations, analytics, QA, and GTM activities (see `docs/ROADMAP.md` for full matrix).

## Environment & Ops Essentials

- Required vars: `NEXT_PUBLIC_APP_URL`, Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), OpenAI (`OPENAI_API_KEY`, `OPENAI_MODEL`), NextAuth (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`). Optional SMTP, analytics (GA, Sentry), Redis, debug flags.
- Dev setup: copy `.env.example` → `.env.local`, run `npm run build` to validate configuration. Use distinct credentials per environment, rotate keys, enforce least privilege.

## TypeScript & Quality Standards

- `tsconfig.json` enables full strict mode (`noUncheckedIndexedAccess`, `noImplicitOverride`, etc.). Lint rules disallow `any`; prefer derived types from Zod schemas.
- Place shared types in `src/types/` (`global.d.ts`, `database.ts`, `api.ts`); expose utility types (e.g., `DeepPartial`, `RequiredBy`) and domain models.
- Guidelines: strongly typed props, union-based state machines, generic hooks (`useApi<T>`), and validation parity client/server via shared schemas.

## Design System Highlights

- Palette: midnight blue `#0A1A2F` base, soft yellow `#F2E94E` CTA, white neutrals, pastel green `#A8E6CF` accents.
- Typography: Inter/SF Pro; bold, spacious headers (≥28px), comfortable body text (16–18px); reserve yellow for key CTAs.
- UI details: 12–16px radius buttons with elevate-on-hover motion, 20–30px card radii, subtle focus shadows. Animations capped at ~300 ms ease-in-out; avoid heavy transitions.
- UX rules: hero with direct CTA, retractable sidebar, ≤3 clicks to core flows, single premium theme (no dark mode).
