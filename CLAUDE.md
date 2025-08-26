# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Git Hooks

The project uses Husky with pre-commit hooks that run:

- ESLint with auto-fix
- Prettier formatting
- Configured via `lint-staged` in package.json

## Project Architecture

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS v4
- **UI Components**: ShadCN/UI (planned)
- **State Management**: Zustand + TanStack Query (planned)
- **Database**: Supabase (planned)
- **AI Integration**: OpenAI (planned)

### Folder Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── (auth)/             # Authentication route group
│   ├── dashboard/          # Main dashboard
│   ├── employees/          # Employee management
│   ├── schedules/          # Schedule management
│   ├── settings/           # Application settings
│   └── admin/              # Admin interface
├── components/             # Reusable React components
│   ├── ui/                 # Base UI components (ShadCN/UI)
│   ├── forms/              # Form components
│   ├── charts/             # Data visualization
│   ├── layout/             # Layout components
│   └── features/           # Feature-specific components
├── lib/                    # Business logic and utilities
│   ├── api/                # API clients and endpoints
│   ├── auth/               # Authentication logic
│   ├── database/           # Database layer (Supabase)
│   ├── ai/                 # AI integration (OpenAI)
│   ├── utils/              # Utility functions
│   ├── validations/        # Zod schemas
│   └── constants/          # App constants
├── hooks/                  # Custom React hooks
├── store/                  # Global state management
└── types/                  # TypeScript type definitions
    ├── database.ts         # Database entity types
    ├── api.ts             # API response types
    └── global.d.ts        # Global type declarations
```

### TypeScript Configuration

- **Strict Mode**: All strict TypeScript flags enabled
- **Path Aliases**: `@/*` maps to `src/*` with component-specific aliases
- **Validation**: Zod schemas for runtime validation + TypeScript types
- **No `any` allowed**: Use proper typing throughout

### Code Conventions

- **Components**: PascalCase (e.g., `EmployeeForm.tsx`)
- **Files/Folders**: kebab-case (e.g., `employee-form.tsx`)
- **Functions**: camelCase (e.g., `getUserById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types**: PascalCase interfaces, props suffixed with `Props`

### Architecture Principles

- **Feature-based organization**: Components grouped by business domain
- **Composition over inheritance**: Use component composition patterns
- **Custom hooks for logic**: Extract reusable logic into hooks
- **Centralized validation**: Zod schemas in `lib/validations/`
- **Type-first development**: Define types before implementation

### Key Patterns

1. **API Layer**: TanStack Query for data fetching with custom hooks
2. **Form Handling**: React Hook Form + Zod validation
3. **State Management**: Zustand stores by domain + React Query for server state
4. **Component Structure**: Barrel exports via index.ts files
5. **Error Handling**: Consistent error boundaries and user feedback

### Multi-tenant Architecture

- Row Level Security (RLS) for data isolation
- Company-scoped data access patterns
- Role-based authorization (admin/manager/employee)

## Development Guidelines

### Before Making Changes

1. Run `npm run type-check` to ensure no TypeScript errors
2. Follow existing code patterns and architecture
3. Use existing UI components from `components/ui/` when available
4. Add proper TypeScript types for new functionality

### After Making Changes

1. Run `npm run lint` and `npm run format:check`
2. Ensure `npm run build` succeeds
3. Verify TypeScript compilation with `npm run type-check`

The project emphasizes type safety, maintainable architecture, and follows modern React/Next.js best practices for a SaaS employee scheduling application.
