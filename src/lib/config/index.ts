import { publicEnv } from '@/lib/env';

export const publicConfig = {
  appUrl: publicEnv.appUrl,
  supabaseUrl: publicEnv.supabaseUrl,
  supabaseAnonKey: publicEnv.supabaseAnonKey,
  analyticsId: publicEnv.analyticsId,
} as const;

export type PublicConfig = typeof publicConfig;
