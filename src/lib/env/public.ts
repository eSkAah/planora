import { z } from 'zod';

import { removeTrailingSlash, hasPlaceholderValue } from './utils';

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .min(1, 'NEXT_PUBLIC_APP_URL is required')
    .url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_URL is required')
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY cannot be empty'),
  NEXT_PUBLIC_GA_ID: z
    .string()
    .optional()
    .transform(value => (value && value.length > 0 ? value : undefined)),
});

export type PublicEnvSchema = z.infer<typeof publicEnvSchema>;

export const rawPublicEnv: Record<keyof PublicEnvSchema, string | undefined> = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
};

const parsedPublicEnv = publicEnvSchema.safeParse(rawPublicEnv);

if (!parsedPublicEnv.success) {
  const formatted = parsedPublicEnv.error.issues
    .map(issue => `• ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid public environment variables:\n${formatted}`);
}

const data = parsedPublicEnv.data;

export const publicEnv = {
  appUrl: removeTrailingSlash(data.NEXT_PUBLIC_APP_URL),
  supabaseUrl: removeTrailingSlash(data.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  analyticsId: data.NEXT_PUBLIC_GA_ID,
  hasPlaceholders: Object.values(rawPublicEnv).some(hasPlaceholderValue),
} as const;
