/**
 * Database Client Configuration
 *
 * This module configure and exports database clients:
 * - Prisma: Main ORM for database operations
 * - Supabase: Authentication and real-time features
 */

import { createClient } from '@supabase/supabase-js';

import { PrismaClient } from '@/generated/prisma';
import type { Database } from '@/lib/database/types';
import { publicEnv } from '@/lib/env';
import { serverEnv } from '@/lib/env/server';

// Prisma Client (Main Database ORM)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
const hasDatabaseUrl = Boolean(
  typeof process.env.DATABASE_URL === 'string' &&
    process.env.DATABASE_URL.trim().length > 0
);

const prismaClient = hasDatabaseUrl
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : null;

if (prismaClient && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient;
}

export const prisma = prismaClient;
export const isDatabaseConfigured = () => hasDatabaseUrl;

export const getPrismaClient = () => prismaClient;

// Supabase Client (Authentication & Real-time)
const supabaseUrl = publicEnv.supabaseUrl;
const supabaseAnonKey = publicEnv.supabaseAnonKey;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Admin client for server-side operations
const supabaseServiceKey = serverEnv.supabaseServiceRoleKey;

export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
