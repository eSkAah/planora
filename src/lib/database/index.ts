/**
 * Database Layer Exports
 *
 * This file exports all database-related utilities and clients.
 * Prisma ORM, Supabase authentication, and database types.
 */

export { prisma, supabase, supabaseAdmin } from './client';
export type { Database } from './types';

// Re-export Prisma types for convenience
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
} from '@/generated/prisma';
