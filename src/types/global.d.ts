/**
 * Global Type Definitions for Planora
 *
 * This file contains global type definitions that are available
 * throughout the application without explicit imports.
 */

declare global {
  /**
   * Environment variables with strict typing
   */
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production' | 'test';
      readonly NEXT_PUBLIC_APP_URL: string;
      readonly NEXTAUTH_SECRET?: string;
      readonly NEXTAUTH_URL?: string;
      readonly NEXT_PUBLIC_SUPABASE_URL?: string;
      readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
      readonly SUPABASE_SERVICE_ROLE_KEY?: string;
      readonly OPENAI_API_KEY?: string;
      readonly OPENAI_MODEL?: string;
      readonly SMTP_HOST?: string;
      readonly SMTP_PORT?: string;
      readonly SMTP_USER?: string;
      readonly SMTP_PASSWORD?: string;
      readonly NEXT_PUBLIC_GA_ID?: string;
      readonly SENTRY_DSN?: string;
      readonly REDIS_URL?: string;
      readonly DEBUG?: string;
      readonly VERBOSE_LOGGING?: string;
    }
  }

  /**
   * Custom CSS properties for theme variables
   */
  interface CSSStyleDeclaration {
    [key: `--${string}`]: string | undefined;
  }

  /**
   * Window object extensions
   */
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Utility types for the application
 */

/**
 * Make all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties of T required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract the type of array elements
 */
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

/**
 * Create a type with only the specified keys from T
 */
export type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

/**
 * Create a type without the specified keys from T
 */
export type OmitByType<T, U> = {
  [P in keyof T as T[P] extends U ? never : P]: T[P];
};

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * API Response wrapper type
 */
export type ApiResponse<T = any> = {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
};

/**
 * Paginated response type
 */
export type PaginatedResponse<T = any> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

/**
 * Database entity base type
 */
export type BaseEntity = {
  id: string;
  created_at: string;
  updated_at: string;
};

/**
 * Form state type
 */
export type FormState<T = any> = {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
};

/**
 * Loading state type
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Theme mode type
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Legacy user role type (replaced by Prisma UserRole enum)
 * @deprecated Use UserRole from @/lib/database instead
 */
export type LegacyUserRole =
  | 'super_admin'
  | 'company_admin'
  | 'manager'
  | 'employee'
  | 'viewer';

/**
 * Permission type
 */
export type Permission =
  | 'read'
  | 'write'
  | 'delete'
  | 'admin'
  | 'manage_users'
  | 'manage_schedules'
  | 'manage_employees'
  | 'view_reports'
  | 'manage_settings';

export {};
