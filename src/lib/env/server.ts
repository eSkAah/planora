import 'server-only';

import { z } from 'zod';

import { hasPlaceholderValue } from './utils';

const normalize = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const booleanString = z
  .enum(['true', 'false'])
  .optional()
  .transform(value => value === 'true');

export const serverEnvSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    SUPABASE_SERVICE_ROLE_KEY: z
      .string()
      .min(1, 'SUPABASE_SERVICE_ROLE_KEY cannot be empty')
      .optional(),
    OPENAI_API_KEY: z
      .string()
      .min(1, 'OPENAI_API_KEY cannot be empty')
      .optional(),
    OPENAI_MODEL: z.string().min(1).default('gpt-4'),
    NEXTAUTH_SECRET: z
      .string()
      .min(32, 'NEXTAUTH_SECRET must be at least 32 characters long')
      .optional(),
    NEXTAUTH_URL: z.string().url().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().positive().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().email().optional(),
    SENTRY_DSN: z.string().url().optional(),
    REDIS_URL: z.string().url().optional(),
    DEBUG: booleanString,
    VERBOSE_LOGGING: booleanString,
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production') {
      if (!env.NEXTAUTH_SECRET) {
        ctx.addIssue({
          path: ['NEXTAUTH_SECRET'],
          code: z.ZodIssueCode.custom,
          message: 'NEXTAUTH_SECRET is required in production',
        });
      }
      if (!env.NEXTAUTH_URL) {
        ctx.addIssue({
          path: ['NEXTAUTH_URL'],
          code: z.ZodIssueCode.custom,
          message: 'NEXTAUTH_URL is required in production',
        });
      }
    }
  });

export type ServerEnvSchema = z.infer<typeof serverEnvSchema>;

export const rawServerEnv: Record<keyof ServerEnvSchema, string | undefined> = {
  NODE_ENV: normalize(process.env.NODE_ENV),
  SUPABASE_SERVICE_ROLE_KEY: normalize(process.env.SUPABASE_SERVICE_ROLE_KEY),
  OPENAI_API_KEY: normalize(process.env.OPENAI_API_KEY),
  OPENAI_MODEL: normalize(process.env.OPENAI_MODEL),
  NEXTAUTH_SECRET: normalize(process.env.NEXTAUTH_SECRET),
  NEXTAUTH_URL: normalize(process.env.NEXTAUTH_URL),
  SMTP_HOST: normalize(process.env.SMTP_HOST),
  SMTP_PORT: normalize(process.env.SMTP_PORT),
  SMTP_USER: normalize(process.env.SMTP_USER),
  SMTP_PASSWORD: normalize(process.env.SMTP_PASSWORD),
  SMTP_FROM: normalize(process.env.SMTP_FROM),
  SENTRY_DSN: normalize(process.env.SENTRY_DSN),
  REDIS_URL: normalize(process.env.REDIS_URL),
  DEBUG: normalize(process.env.DEBUG),
  VERBOSE_LOGGING: normalize(process.env.VERBOSE_LOGGING),
};

const parsedServerEnv = serverEnvSchema.safeParse(rawServerEnv);

if (!parsedServerEnv.success) {
  const formatted = parsedServerEnv.error.issues
    .map(issue => `• ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid server environment variables:\n${formatted}`);
}

const data = parsedServerEnv.data;

export const serverEnv = {
  nodeEnv: data.NODE_ENV,
  supabaseServiceRoleKey: data.SUPABASE_SERVICE_ROLE_KEY ?? null,
  openAiApiKey: data.OPENAI_API_KEY ?? null,
  openAiModel: data.OPENAI_MODEL || 'gpt-4',
  nextAuthSecret: data.NEXTAUTH_SECRET,
  nextAuthUrl: data.NEXTAUTH_URL,
  smtp: {
    host: data.SMTP_HOST,
    port: data.SMTP_PORT,
    user: data.SMTP_USER,
    password: data.SMTP_PASSWORD,
    from: data.SMTP_FROM,
  },
  sentryDsn: data.SENTRY_DSN,
  redisUrl: data.REDIS_URL,
  debug: data.DEBUG ?? false,
  verboseLogging: data.VERBOSE_LOGGING ?? false,
  hasPlaceholders: Object.values(rawServerEnv).some(hasPlaceholderValue),
} as const;

export const runtimeEnv = {
  nodeEnv: data.NODE_ENV,
  isDevelopment: data.NODE_ENV === 'development',
  isProduction: data.NODE_ENV === 'production',
  isTest: data.NODE_ENV === 'test',
} as const;
