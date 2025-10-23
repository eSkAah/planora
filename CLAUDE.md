# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Planora is an AI-powered workforce scheduling platform built with Next.js 15, featuring a hybrid Prisma + Supabase architecture. It provides multi-tenant workforce management with role-based access control, AI-assisted schedule generation, and comprehensive employee management for French and Luxembourg markets.

## Development Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Build for production
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Run ESLint with auto-fix
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run type-check      # Run TypeScript type checking
npm run verify          # Run lint + type-check + build

# Database Operations
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes to database
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio

# Supabase Operations
npm run supabase:types  # Generate TypeScript types from Supabase
npm run supabase:db:push    # Push to Supabase database
npm run supabase:db:reset   # Reset Supabase database with seed

# Testing
npm test                # Run Jest unit tests
npm run test:watch      # Run Jest in watch mode
npm run test:e2e        # Run Playwright E2E tests
npm run test:e2e:ui     # Run E2E tests with UI
npm run test:e2e:debug  # Debug E2E tests
```

## Architecture Overview

### Hybrid Database Architecture

**Critical**: This application uses a dual database approach:

- **Prisma**: Primary ORM for complex business logic and type-safe queries
- **Supabase**: Authentication, real-time features, and Row Level Security (RLS)

The database client (`src/lib/database/client.ts`) exports both:

- `prisma` - For business operations
- `supabase` / `supabaseAdmin` - For auth and real-time

### Tech Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict configuration (all strict flags enabled)
- **Database**: PostgreSQL via Prisma + Supabase hybrid
- **Authentication**: Supabase Auth with magic link support
- **UI**: ShadCN/UI components + Tailwind CSS v4
- **AI**: OpenAI integration for schedule generation
- **Email**: Resend for transactional emails
- **Testing**: Jest (unit) + Playwright (E2E)
- **Validation**: Zod schemas throughout

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Protected routes group
│   │   ├── dashboard/     # Main dashboard
│   │   ├── employees/     # Employee management
│   │   ├── schedules/     # Schedule management with AI
│   │   ├── onboarding/    # Company setup flow
│   │   └── settings/      # Company & team settings
│   ├── auth/register/     # Public registration
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # ShadCN/UI base components
│   ├── marketing/        # Landing page components
│   ├── layout/           # App layout components
│   └── [domain]/         # Feature-specific components
├── lib/                  # Core business logic
│   ├── actions/          # Server actions per domain
│   ├── ai/               # OpenAI schedule generator
│   ├── auth/             # Authentication actions
│   ├── database/         # Hybrid database clients
│   ├── env/              # Environment validation
│   ├── services/         # External services (email)
│   ├── supabase/         # Supabase-specific utilities
│   └── validations/      # Zod schemas per domain
├── hooks/                # React hooks
├── emails/               # React Email templates
└── types/                # TypeScript definitions
```

## Key Implementation Patterns

### Authentication & Authorization

- **Magic Links**: Primary auth method via Supabase + Resend
- **Server Actions**: All auth logic in `src/lib/auth/actions.ts`
- **Middleware**: Route protection + onboarding flow in `src/middleware.ts`
- **RLS**: Company data isolation via Supabase Row Level Security

### Multi-Tenant Architecture

- **Company Isolation**: All data scoped by `company_id`
- **Role-Based Access**: `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `EMPLOYEE`, `VIEWER`
- **Onboarding Flow**: Mandatory setup for new companies
- **Settings**: Per-company configuration in JSON column

### AI Schedule Generation

- **Location**: `src/lib/ai/schedule-generator.ts`
- **Provider**: OpenAI GPT models
- **Input**: Employee constraints, legal requirements, business needs
- **Output**: Optimized work schedules with conflict resolution

### Data Flow Patterns

```typescript
// Server Actions Pattern
Component → Server Action → Validation → Database → Response

// Real-time Updates Pattern
Component → Supabase Subscription → Real-time UI Updates

// AI Generation Pattern
User Input → Validation → AI Service → Schedule Generation → Database
```

### Environment Configuration

**Critical Environment Variables**:

- `DATABASE_URL` - Prisma database connection
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side Supabase admin
- `OPENAI_API_KEY` - AI schedule generation
- `RESEND_API_KEY` - Email service

Environment validation is handled in `src/lib/env/` with separate public/server schemas.

## TypeScript Configuration

**Strict Mode Enabled**: All TypeScript strict flags are active. Key requirements:

- No `any` types allowed
- Null checks enforced (`noUncheckedIndexedAccess`)
- All imports must be typed
- Validation schemas must use Zod

**Path Aliases**:

```typescript
"@/*": ["./src/*"]
"@/components/*": ["./src/components/*"]
"@/lib/*": ["./src/lib/*"]
// etc.
```

## Testing Strategy

### Unit Tests (`__tests__/`)

- Authentication actions
- Validation schemas
- Utility functions
- Business logic

### E2E Tests (`e2e/`)

- Complete user workflows
- Authentication flows
- AI schedule generation
- Multi-tenant isolation
- Magic link functionality

### Key Test Commands

```bash
# Run specific test file
npm test auth-actions.test.ts

# Run specific E2E test
npx playwright test e2e/auth/signup.spec.ts

# Debug failing E2E test
npm run test:e2e:debug
```

## Database Management

### Prisma Operations

```bash
# After schema changes
npm run db:generate && npm run db:push

# Create new migration
npm run db:migrate

# View data
npm run db:studio
```

### Supabase Operations

```bash
# Update TypeScript types after schema changes
npm run supabase:types

# Reset database with seed data
npm run supabase:db:reset
```

## Development Workflow

1. **Environment Setup**: Copy `.env.example` and configure all required variables
2. **Database**: Run `npm run db:generate && npm run db:push`
3. **Type Safety**: Always run `npm run type-check` before committing
4. **Code Quality**: Pre-commit hooks enforce linting and formatting
5. **Testing**: E2E tests require proper environment configuration

## AI Integration

### Schedule Generation

- **Service**: `src/lib/ai/schedule-generator.ts`
- **Model**: Configurable OpenAI model (GPT-4 recommended)
- **Inputs**: Employee data, legal constraints, business requirements
- **Validation**: Extensive error handling and fallback logic

### Usage Pattern

```typescript
import { generateSchedule } from '@/lib/ai/schedule-generator';

const result = await generateSchedule({
  employees: employeeData,
  constraints: legalRequirements,
  preferences: businessNeeds,
});
```

## Security Considerations

### Authentication Security

- Magic links expire after use
- Session validation on every protected route
- Supabase RLS policies enforce data isolation

### Data Security

- All user inputs validated with Zod schemas
- Server-side validation for all mutations
- Company data strictly isolated via RLS
- No sensitive data in client-side code

## Multi-Tenant Implementation

### Data Isolation

- Every table has `company_id` foreign key
- RLS policies prevent cross-company access
- User roles scoped within company context

### Onboarding Flow

- Mandatory company setup for new registrations
- Settings stored in companies.settings JSONB column
- Middleware enforces onboarding completion

This architecture ensures scalable, secure, and maintainable workforce management for multiple organizations while leveraging AI for intelligent scheduling.
