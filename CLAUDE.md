# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Planora is a workforce scheduling and planning application built with Next.js 15, TypeScript, Supabase, and Tailwind CSS. It provides multi-tenant functionality for companies to manage employees, schedules, and business operations with AI-assisted planning capabilities.

## Development Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Run ESLint with auto-fix
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run type-check      # Run TypeScript type checking

# Git Hooks
npm run prepare         # Setup Husky git hooks
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript with strict configuration
- **Database**: Supabase (PostgreSQL with RLS)
- **Styling**: Tailwind CSS v4
- **Authentication**: Supabase Auth
- **Validation**: Zod schemas
- **State Management**: Planned Zustand + TanStack Query
- **AI Integration**: Planned OpenAI integration

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── auth/           # Authentication routes
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # Base UI components
│   ├── forms/         # Form components
│   ├── charts/        # Data visualization
│   ├── layout/        # Layout components
│   └── features/      # Business-specific components
├── lib/               # Core utilities and business logic
│   ├── api/           # API clients and endpoints
│   ├── auth/          # Authentication logic (actions.ts)
│   ├── database/      # Supabase client and types
│   ├── ai/            # AI integration utilities
│   ├── utils/         # General utilities
│   ├── validations/   # Zod schemas (auth.ts)
│   └── constants/     # App constants
├── hooks/             # Custom React hooks
├── store/             # State management
└── types/             # TypeScript type definitions
```

### Database Schema
Multi-tenant architecture with Row Level Security (RLS):
- `companies` table with unique company isolation
- `users` table linked to Supabase Auth with role-based access
- User roles: `super_admin`, `admin`, `manager`, `employee`, `viewer`

## TypeScript Configuration

Strict TypeScript is enforced with all strict flags enabled:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUncheckedIndexedAccess: true`
- All additional strict checks enabled

### Path Aliases
```typescript
"@/*": ["./src/*"]
"@/components/*": ["./src/components/*"]
"@/lib/*": ["./src/lib/*"]
"@/hooks/*": ["./src/hooks/*"]
"@/store/*": ["./src/store/*"]
"@/types/*": ["./src/types/*"]
```

## Key Implementation Patterns

### Authentication Flow
- Server actions in `src/lib/auth/actions.ts`
- Account creation with company setup
- User profile creation in both Auth and users table
- Comprehensive error handling and cleanup on failures

### Database Integration
- Supabase client configuration in `src/lib/database/client.ts`
- Separate admin client for server-side operations
- Environment variable validation with proper error handling

### Validation
- Zod schemas for all form inputs
- Centralized validation in `src/lib/validations/`
- Type-safe form handling with server actions

### Component Organization
- Feature-based component grouping
- Strict TypeScript props interfaces
- Composition over inheritance pattern

## Code Quality Standards

### Pre-commit Hooks
- ESLint with TypeScript rules
- Prettier formatting
- Lint-staged for staged files only

### ESLint Configuration
- TypeScript-specific rules enabled
- Next.js optimizations
- Prettier integration

## Environment Setup

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin operations)

## Testing Strategy

While test setup is not yet implemented, the architecture supports:
- Unit tests for hooks and utilities
- Integration tests for API endpoints
- E2E tests for critical user flows

## Development Workflow

1. Always run `npm run type-check` before committing
2. Use strict TypeScript - avoid `any` types
3. Validate all user inputs with Zod schemas
4. Follow the existing component and file naming conventions
5. Implement proper error handling in server actions
6. Maintain RLS policies for data security

## Multi-tenant Considerations

- All database queries must respect company isolation
- User roles determine access levels within companies
- RLS policies enforce data segregation
- Company creation includes proper cleanup on failures

## AI Integration (Planned)

The architecture is prepared for AI-assisted scheduling features:
- OpenAI integration utilities in `src/lib/ai/`
- Structured for schedule generation and optimization
- Type-safe AI response handling