// ==============================================
// PLANORA - SUPABASE CLIENT UTILITIES
// ==============================================

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/lib/database/types';
import { publicEnv } from '@/lib/env';

export function createClientSupabaseClient() {
  return createBrowserClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey
  );
}
