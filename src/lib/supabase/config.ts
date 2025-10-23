// ==============================================
// PLANORA - SUPABASE CONFIGURATION
// ==============================================

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/lib/database/types';
import { publicEnv } from '@/lib/env';

export const supabase = createBrowserClient<Database>(
  publicEnv.supabaseUrl,
  publicEnv.supabaseAnonKey
);
