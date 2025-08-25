/**
 * Constants & Configuration Exports
 *
 * This file exports all application constants and configuration values.
 * Enums, default values, configuration objects, static data.
 */

import type { UserRole } from '@/lib/database';
import type { Permission, ThemeMode } from '@/types';

/**
 * User Roles with descriptions
 */
export const USER_ROLES: Record<
  UserRole,
  { label: string; description: string }
> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    description: 'Full system access across all companies',
  },
  ADMIN: {
    label: 'Admin',
    description: 'Full access within their company',
  },
  MANAGER: {
    label: 'Manager',
    description: 'Manage schedules and employees',
  },
  EMPLOYEE: {
    label: 'Employee',
    description: 'View own schedule and request leave',
  },
  VIEWER: {
    label: 'Viewer',
    description: 'Read-only access to schedules',
  },
} as const;

/**
 * Permissions by role
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'read',
    'write',
    'delete',
    'admin',
    'manage_users',
    'manage_schedules',
    'manage_employees',
    'view_reports',
    'manage_settings',
  ],
  company_admin: [
    'read',
    'write',
    'delete',
    'manage_users',
    'manage_schedules',
    'manage_employees',
    'view_reports',
    'manage_settings',
  ],
  manager: [
    'read',
    'write',
    'manage_schedules',
    'manage_employees',
    'view_reports',
  ],
  employee: ['read'],
  viewer: ['read'],
} as const;

/**
 * Schedule status colors
 */
export const SCHEDULE_STATUS_COLORS = {
  draft: '#6B7280',
  published: '#10B981',
  archived: '#6B7280',
} as const;

/**
 * Assignment status colors
 */
export const ASSIGNMENT_STATUS_COLORS = {
  scheduled: '#3B82F6',
  confirmed: '#10B981',
  completed: '#059669',
  cancelled: '#EF4444',
  no_show: '#F59E0B',
} as const;

/**
 * Theme configuration
 */
export const THEME_CONFIG: Record<ThemeMode, { label: string; icon: string }> =
  {
    light: { label: 'Light', icon: '☀️' },
    dark: { label: 'Dark', icon: '🌙' },
    system: { label: 'System', icon: '💻' },
  } as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  display: 'dd/MM/yyyy',
  api: 'yyyy-MM-dd',
  datetime: 'dd/MM/yyyy HH:mm',
  time: 'HH:mm',
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
  page: 1,
  per_page: 20,
  max_per_page: 100,
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
  },
  users: {
    list: '/api/users',
    create: '/api/users',
    get: (id: string) => `/api/users/${id}`,
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
  },
  employees: {
    list: '/api/employees',
    create: '/api/employees',
    get: (id: string) => `/api/employees/${id}`,
    update: (id: string) => `/api/employees/${id}`,
    delete: (id: string) => `/api/employees/${id}`,
    availability: (id: string) => `/api/employees/${id}/availability`,
  },
  schedules: {
    list: '/api/schedules',
    create: '/api/schedules',
    get: (id: string) => `/api/schedules/${id}`,
    update: (id: string) => `/api/schedules/${id}`,
    delete: (id: string) => `/api/schedules/${id}`,
    generate: '/api/schedules/generate',
    assignments: (id: string) => `/api/schedules/${id}/assignments`,
  },
} as const;

/**
 * Legal constraints by country
 */
export const LEGAL_CONSTRAINTS_BY_COUNTRY = {
  FR: {
    name: 'France',
    max_hours_per_week: 35,
    max_consecutive_days: 6,
    min_rest_between_shifts: 11,
    min_daily_rest: 11,
    min_weekly_rest: 35,
    overtime_threshold: 35,
    night_shift_premium: 10,
    sunday_work_allowed: false,
    holiday_work_allowed: false,
  },
  LU: {
    name: 'Luxembourg',
    max_hours_per_week: 40,
    max_consecutive_days: 6,
    min_rest_between_shifts: 12,
    min_daily_rest: 12,
    min_weekly_rest: 44,
    overtime_threshold: 40,
    night_shift_premium: 15,
    sunday_work_allowed: true,
    holiday_work_allowed: true,
  },
  DE: {
    name: 'Germany',
    max_hours_per_week: 40,
    max_consecutive_days: 6,
    min_rest_between_shifts: 11,
    min_daily_rest: 11,
    min_weekly_rest: 35,
    overtime_threshold: 40,
    night_shift_premium: 25,
    sunday_work_allowed: false,
    holiday_work_allowed: true,
  },
} as const;

/**
 * Shift types
 */
export const SHIFT_TYPES = {
  morning: { label: 'Morning', start: '06:00', end: '14:00', color: '#FCD34D' },
  afternoon: {
    label: 'Afternoon',
    start: '14:00',
    end: '22:00',
    color: '#60A5FA',
  },
  evening: { label: 'Evening', start: '18:00', end: '02:00', color: '#A78BFA' },
  night: { label: 'Night', start: '22:00', end: '06:00', color: '#34D399' },
} as const;

/**
 * Loading states
 */
export const LOADING_STATES = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error',
} as const;

/**
 * Default user preferences
 */
export const DEFAULT_USER_PREFERENCES = {
  theme: 'system' as ThemeMode,
  language: 'fr',
  notifications: {
    email: true,
    push: true,
    schedule_changes: true,
    leave_requests: true,
  },
  dashboard: {
    widgets: ['schedule', 'notifications', 'analytics'],
    layout: 'grid' as const,
  },
} as const;
