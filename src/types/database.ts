/**
 * Database Types for Planora
 *
 * This file contains all database-related type definitions.
 * These types will be generated/updated when we set up Supabase.
 */

import type { BaseEntity, LegacyUserRole, ThemeMode } from './global';

/**
 * Company (Multi-tenant)
 */
export interface Company extends BaseEntity {
  name: string;
  slug: string;
  country: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  settings: CompanySettings;
  subscription_plan: 'free' | 'starter' | 'professional' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'trial' | 'cancelled';
  trial_ends_at?: string;
}

/**
 * Company Settings
 */
export interface CompanySettings {
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  week_start: 0 | 1; // 0 = Sunday, 1 = Monday
  language: string;
  currency: string;
  working_hours: {
    start: string;
    end: string;
  };
  legal_constraints: LegalConstraints;
}

/**
 * Legal Constraints by Country
 */
export interface LegalConstraints {
  max_hours_per_week: number;
  max_consecutive_days: number;
  min_rest_between_shifts: number; // in hours
  min_daily_rest: number; // in hours
  min_weekly_rest: number; // in hours
  overtime_threshold: number; // in hours per week
  night_shift_premium: number; // percentage
  sunday_work_allowed: boolean;
  holiday_work_allowed: boolean;
}

/**
 * User
 */
export interface User extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: LegacyUserRole;
  company_id: string;
  is_active: boolean;
  last_login_at?: string;
  preferences: UserPreferences;
}

/**
 * User Preferences
 */
export interface UserPreferences {
  theme: ThemeMode;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    schedule_changes: boolean;
    leave_requests: boolean;
  };
  dashboard: {
    widgets: string[];
    layout: 'grid' | 'list';
  };
}

/**
 * Employee
 */
export interface Employee extends BaseEntity {
  company_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  hire_date: string;
  contract_type: ContractType;
  department?: string;
  position?: string;
  hourly_rate?: number;
  is_active: boolean;
  availability: EmployeeAvailability;
  qualifications: string[];
  preferences: EmployeePreferences;
}

/**
 * Contract Type
 */
export interface ContractType extends BaseEntity {
  company_id: string;
  name: string;
  hours_per_week: number;
  is_full_time: boolean;
  overtime_eligible: boolean;
  benefits: string[];
}

/**
 * Employee Availability
 */
export interface EmployeeAvailability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
  blackout_dates: string[]; // ISO date strings
}

/**
 * Time Slot
 */
export interface TimeSlot {
  start: string; // HH:MM format
  end: string; // HH:MM format
  type: 'available' | 'preferred' | 'unavailable';
}

/**
 * Employee Preferences
 */
export interface EmployeePreferences {
  max_hours_per_week?: number;
  preferred_shifts: ('morning' | 'afternoon' | 'evening' | 'night')[];
  avoid_consecutive_days?: number;
  prefer_weekends?: boolean;
  avoid_split_shifts?: boolean;
}

/**
 * Shift Template
 */
export interface ShiftTemplate extends BaseEntity {
  company_id: string;
  name: string;
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  duration: number; // in minutes
  break_duration?: number; // in minutes
  min_employees: number;
  max_employees?: number;
  required_qualifications: string[];
  is_active: boolean;
}

/**
 * Schedule
 */
export interface Schedule extends BaseEntity {
  company_id: string;
  name: string;
  start_date: string; // ISO date
  end_date: string; // ISO date
  status: 'draft' | 'published' | 'archived';
  generated_by: 'manual' | 'ai';
  ai_prompt?: string;
  total_hours: number;
  total_cost?: number;
  assignments: ScheduleAssignment[];
}

/**
 * Schedule Assignment
 */
export interface ScheduleAssignment extends BaseEntity {
  schedule_id: string;
  employee_id: string;
  shift_template_id: string;
  date: string; // ISO date
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  break_start?: string; // HH:MM format
  break_end?: string; // HH:MM format
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

/**
 * Leave Request
 */
export interface LeaveRequest extends BaseEntity {
  employee_id: string;
  leave_type_id: string;
  start_date: string; // ISO date
  end_date: string; // ISO date
  days_requested: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string; // user_id
  approved_at?: string;
  rejection_reason?: string;
}

/**
 * Leave Type
 */
export interface LeaveType extends BaseEntity {
  company_id: string;
  name: string;
  code: string;
  days_per_year: number;
  carry_over_allowed: boolean;
  requires_approval: boolean;
  is_paid: boolean;
  color: string; // hex color for calendar display
}

/**
 * Notification
 */
export interface Notification extends BaseEntity {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'schedule' | 'leave' | 'system' | 'reminder';
  is_read: boolean;
  action_url?: string;
  data?: Record<string, any>;
}

/**
 * Audit Log
 */
export interface AuditLog extends BaseEntity {
  company_id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * AI Prompt Template
 */
export interface AIPromptTemplate extends BaseEntity {
  company_id: string;
  name: string;
  description: string;
  prompt: string;
  variables: string[];
  is_default: boolean;
  usage_count: number;
}
