export { publicEnv, publicEnvSchema, rawPublicEnv } from './public';
export type { PublicEnvSchema } from './public';

export const runtimeEnv = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;
