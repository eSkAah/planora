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
