import 'server-only';

import { publicEnv } from '../env';
import { serverEnv, runtimeEnv } from '../env/server';

export const appConfig = {
  runtime: runtimeEnv,
  supabase: {
    url: publicEnv.supabaseUrl,
    anonKey: publicEnv.supabaseAnonKey,
    serviceRoleKey: serverEnv.supabaseServiceRoleKey,
  },
  auth: {
    nextAuth: {
      secret: serverEnv.nextAuthSecret,
      url: serverEnv.nextAuthUrl ?? publicEnv.appUrl,
    },
  },
  ai: {
    apiKey: serverEnv.openAiApiKey,
    model: serverEnv.openAiModel,
  },
  telemetry: {
    sentryDsn: serverEnv.sentryDsn,
    analyticsId: publicEnv.analyticsId,
  },
  cache: {
    redisUrl: serverEnv.redisUrl,
  },
  flags: {
    debug: serverEnv.debug,
    verboseLogging: serverEnv.verboseLogging,
  },
} as const;
