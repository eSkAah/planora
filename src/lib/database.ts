// ==============================================
// PLANORA - DATABASE CONNECTION & TYPES
// Phase 2: Database Integration (T021-T027)
// ==============================================
import { PrismaClient } from '@/generated/prisma';
import type {
  Company,
  User,
  Employee,
  Contract,
  ShiftTemplate,
  Schedule,
  ScheduleAssignment,
  UserRole,
  ContractType,
  ShiftType,
  ScheduleStatus,
  AssignmentStatus,
  GenerationMethod,
} from '@/generated/prisma';

// Global instance for connection reuse (Next.js development)
declare global {
  var prisma: PrismaClient | undefined;
}

// Create Prisma client instance
export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    errorFormat: 'pretty',
  });

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Re-export types from Prisma
export type {
  Company,
  User,
  Employee,
  Contract,
  ShiftTemplate,
  Schedule,
  ScheduleAssignment,
  UserRole,
  ContractType,
  ShiftType,
  ScheduleStatus,
  AssignmentStatus,
  GenerationMethod,
};

// Custom utility types
export type UserWithCompany = User & {
  company: Company;
};

export type EmployeeWithUser = Employee & {
  user: User | null;
  company: Company;
  contracts: Contract[];
};

export type ScheduleWithAssignments = Schedule & {
  assignments: (ScheduleAssignment & {
    employee: Employee & { user: User | null };
    shiftTemplate: ShiftTemplate | null;
  })[];
};

export type AssignmentWithDetails = ScheduleAssignment & {
  employee: Employee & { user: User | null };
  schedule: Schedule;
  shiftTemplate: ShiftTemplate | null;
};

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
