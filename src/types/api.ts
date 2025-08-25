/**
 * API Types for Planora
 *
 * This file contains all API-related type definitions.
 * Request/Response types, API endpoints, error types, etc.
 */

import type {
  User,
  Employee,
  Company,
  Schedule,
  ScheduleAssignment,
} from './database';
import type { UserRole, ThemeMode } from './global';

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API Error Response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

/**
 * API Success Response
 */
export interface ApiSuccess<T = any> {
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    version: string;
    request_id: string;
  };
}

/**
 * Paginated API Response
 */
export interface ApiPaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  meta?: {
    timestamp: string;
    version: string;
    request_id: string;
  };
}

/**
 * API Response Union Type
 */
export type ApiResponse<T = any> = ApiSuccess<T> | { error: ApiError };

/**
 * Authentication Types
 */
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  company_country?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

/**
 * User Management Types
 */
export interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  send_invitation?: boolean;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface UpdateUserPreferencesRequest {
  theme?: ThemeMode;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    schedule_changes?: boolean;
    leave_requests?: boolean;
  };
}

/**
 * Employee Management Types
 */
export interface CreateEmployeeRequest {
  employee_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  hire_date: string;
  contract_type_id: string;
  department?: string;
  position?: string;
  hourly_rate?: number;
}

export interface UpdateEmployeeRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  hourly_rate?: number;
  is_active?: boolean;
}

export interface UpdateEmployeeAvailabilityRequest {
  availability: Employee['availability'];
}

export interface BulkImportEmployeesRequest {
  employees: CreateEmployeeRequest[];
  overwrite_existing?: boolean;
}

/**
 * Schedule Management Types
 */
export interface CreateScheduleRequest {
  name: string;
  start_date: string;
  end_date: string;
  shift_templates: string[];
  employee_ids?: string[];
  generation_method: 'manual' | 'ai';
  ai_prompt?: string;
}

export interface UpdateScheduleRequest {
  name?: string;
  status?: Schedule['status'];
  notes?: string;
}

export interface GenerateScheduleRequest {
  start_date: string;
  end_date: string;
  shift_templates: string[];
  employee_ids: string[];
  constraints: {
    max_hours_per_employee?: number;
    min_rest_between_shifts?: number;
    prefer_employee_availability?: boolean;
    balance_workload?: boolean;
  };
  ai_prompt?: string;
}

export interface AssignShiftRequest {
  employee_id: string;
  shift_template_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
}

export interface UpdateAssignmentRequest {
  start_time?: string;
  end_time?: string;
  status?: ScheduleAssignment['status'];
  notes?: string;
}

/**
 * Leave Management Types
 */
export interface CreateLeaveRequestRequest {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface UpdateLeaveRequestRequest {
  start_date?: string;
  end_date?: string;
  reason?: string;
}

export interface ProcessLeaveRequestRequest {
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

/**
 * Shift Template Types
 */
export interface CreateShiftTemplateRequest {
  name: string;
  start_time: string;
  end_time: string;
  break_duration?: number;
  min_employees: number;
  max_employees?: number;
  required_qualifications?: string[];
}

export interface UpdateShiftTemplateRequest {
  name?: string;
  start_time?: string;
  end_time?: string;
  break_duration?: number;
  min_employees?: number;
  max_employees?: number;
  required_qualifications?: string[];
  is_active?: boolean;
}

/**
 * Company Management Types
 */
export interface UpdateCompanyRequest {
  name?: string;
  country?: string;
  industry?: string;
  size?: Company['size'];
}

export interface UpdateCompanySettingsRequest {
  timezone?: string;
  date_format?: string;
  time_format?: '12h' | '24h';
  week_start?: 0 | 1;
  language?: string;
  currency?: string;
  working_hours?: {
    start: string;
    end: string;
  };
}

/**
 * Analytics & Reports Types
 */
export interface AnalyticsRequest {
  start_date: string;
  end_date: string;
  metrics: ('hours' | 'cost' | 'attendance' | 'overtime')[];
  group_by?: 'day' | 'week' | 'month' | 'employee' | 'department';
}

export interface AnalyticsResponse {
  metrics: {
    total_hours: number;
    total_cost: number;
    average_attendance: number;
    overtime_hours: number;
  };
  breakdown: Array<{
    period: string;
    hours: number;
    cost: number;
    attendance: number;
    overtime: number;
  }>;
}

export interface ReportRequest {
  type: 'schedule' | 'attendance' | 'payroll' | 'compliance';
  start_date: string;
  end_date: string;
  filters?: {
    employee_ids?: string[];
    department?: string;
    shift_template_ids?: string[];
  };
  format: 'pdf' | 'excel' | 'csv';
}

export interface ReportResponse {
  report_id: string;
  download_url: string;
  expires_at: string;
}

/**
 * Search & Filter Types
 */
export interface SearchRequest {
  query: string;
  entity_types?: ('employees' | 'schedules' | 'shifts')[];
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
}

export interface FilterOptions {
  employees?: {
    department?: string[];
    contract_type?: string[];
    is_active?: boolean;
  };
  schedules?: {
    status?: Schedule['status'][];
    date_range?: {
      start: string;
      end: string;
    };
  };
  assignments?: {
    status?: ScheduleAssignment['status'][];
    employee_id?: string;
    date?: string;
  };
}

/**
 * Webhook Types
 */
export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: string;
  company_id: string;
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret: string;
}
