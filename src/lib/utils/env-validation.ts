/**
 * Environment Variables Validation
 *
 * This utility validates that all required environment variables are present
 * and properly formatted at application startup.
 */

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  validate?: (value: string) => boolean;
}

const ENV_VARS: EnvVar[] = [
  // Next.js Configuration
  {
    name: 'NODE_ENV',
    required: true,
    description: 'Node environment (development/production)',
    validate: value => ['development', 'production', 'test'].includes(value),
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    description: 'Application base URL',
    validate: value =>
      value.startsWith('http://') || value.startsWith('https://'),
  },

  // Supabase Configuration
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
    validate: value =>
      value.includes('.supabase.co') || value.includes('localhost'),
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key (private)',
  },

  // OpenAI Configuration
  {
    name: 'OPENAI_API_KEY',
    required: true,
    description: 'OpenAI API key for schedule generation',
    validate: value => value.startsWith('sk-'),
  },
  {
    name: 'OPENAI_MODEL',
    required: false,
    description: 'OpenAI model to use (defaults to gpt-4)',
  },

  // Authentication
  {
    name: 'NEXTAUTH_SECRET',
    required: process.env.NODE_ENV === 'production',
    description: 'NextAuth secret for JWT signing',
    validate: value => value.length >= 32,
  },
  {
    name: 'NEXTAUTH_URL',
    required: process.env.NODE_ENV === 'production',
    description: 'NextAuth callback URL',
  },

  // Optional Email Configuration
  {
    name: 'SMTP_HOST',
    required: false,
    description: 'SMTP server host for email notifications',
  },
  {
    name: 'SMTP_PORT',
    required: false,
    description: 'SMTP server port',
  },
  {
    name: 'SMTP_USER',
    required: false,
    description: 'SMTP username',
  },
  {
    name: 'SMTP_PASSWORD',
    required: false,
    description: 'SMTP password',
  },
  {
    name: 'SMTP_FROM',
    required: false,
    description: 'Default sender email address',
  },

  // Optional Analytics
  {
    name: 'NEXT_PUBLIC_GA_ID',
    required: false,
    description: 'Google Analytics tracking ID',
  },
  {
    name: 'SENTRY_DSN',
    required: false,
    description: 'Sentry DSN for error monitoring',
  },
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates all environment variables
 */
export function validateEnvironmentVariables(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];

    // Check if required variable is missing
    if (envVar.required && (!value || value.trim() === '')) {
      errors.push(`Missing required environment variable: ${envVar.name}`);
      continue;
    }

    // Skip validation for optional missing variables
    if (!value || value.trim() === '') {
      continue;
    }

    // Run custom validation if provided
    if (envVar.validate && !envVar.validate(value)) {
      errors.push(`Invalid format for ${envVar.name}: ${envVar.description}`);
    }

    // Check for placeholder values
    if (
      value.includes('your_') ||
      value.includes('xxx') ||
      value === 'your-project-id'
    ) {
      warnings.push(`${envVar.name} appears to contain placeholder value`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates environment and throws error if invalid
 */
export function validateEnvironmentOrThrow(): void {
  const result = validateEnvironmentVariables();

  if (!result.isValid) {
    console.error('❌ Environment validation failed:');
    result.errors.forEach(error => console.error(`  • ${error}`));

    if (result.warnings.length > 0) {
      console.warn('\n⚠️  Environment warnings:');
      result.warnings.forEach(warning => console.warn(`  • ${warning}`));
    }

    console.error('\n📚 Check docs/ENVIRONMENT.md for setup instructions');
    process.exit(1);
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    result.warnings.forEach(warning => console.warn(`  • ${warning}`));
  }

  console.log('✅ Environment variables validated successfully');
}

/**
 * Get environment variable with fallback
 */
export function getEnvVar(name: string, fallback?: string): string {
  const value = process.env[name];

  if (!value && !fallback) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value || fallback!;
}

/**
 * Check if we're in development mode
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if we're in production mode
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Get app URL with trailing slash removed
 */
export function getAppUrl(): string {
  const url = getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
