import 'server-only';

import { publicEnvSchema, rawPublicEnv } from '@/lib/env/public';
import {
  serverEnvSchema,
  rawServerEnv,
  runtimeEnv as serverRuntime,
} from '@/lib/env/server';
import { hasPlaceholderValue } from '@/lib/env/utils';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function collectPlaceholderWarnings(
  env: Record<string, string | undefined>
): string[] {
  return Object.entries(env)
    .filter(([, value]) => hasPlaceholderValue(value))
    .map(([key]) => `${key} appears to contain a placeholder value`);
}

export function validateEnvironmentVariables(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const publicValidation = publicEnvSchema.safeParse(rawPublicEnv);
  if (!publicValidation.success) {
    publicValidation.error.issues.forEach(issue => {
      errors.push(`${issue.path.join('.') || 'PUBLIC'}: ${issue.message}`);
    });
  } else {
    warnings.push(...collectPlaceholderWarnings(rawPublicEnv));
  }

  const serverValidation = serverEnvSchema.safeParse(rawServerEnv);
  if (!serverValidation.success) {
    serverValidation.error.issues.forEach(issue => {
      errors.push(`${issue.path.join('.') || 'SERVER'}: ${issue.message}`);
    });
  } else {
    warnings.push(...collectPlaceholderWarnings(rawServerEnv));
    const warnIfMissing = [
      'SUPABASE_SERVICE_ROLE_KEY',
      'OPENAI_API_KEY',
      'RESEND_API_KEY',
    ] as const;
    warnIfMissing.forEach(key => {
      if (!rawServerEnv[key]) {
        warnings.push(
          `${key} is not set; related features may be limited in this environment`
        );
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateEnvironmentOrThrow(): void {
  const { isValid, errors, warnings } = validateEnvironmentVariables();

  if (!isValid) {
    const message = [
      'Environment validation failed:',
      ...errors.map(err => `  • ${err}`),
    ].join('\n');

    if (serverRuntime.isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(`❌ ${message}`);
    }

    throw new Error(message);
  }

  if (warnings.length > 0 && serverRuntime.isDevelopment) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  Environment warnings:');
    warnings.forEach(warning => {
      // eslint-disable-next-line no-console
      console.warn(`  • ${warning}`);
    });
  }

  if (serverRuntime.isDevelopment) {
    // eslint-disable-next-line no-console
    console.log('✅ Environment variables validated successfully');
  }
}

export const isDevelopment = serverRuntime.isDevelopment;
export const isProduction = serverRuntime.isProduction;

export function getAppUrl(): string {
  const value = rawPublicEnv.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return value.endsWith('/') ? value.slice(0, -1) : value;
}
