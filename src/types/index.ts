/**
 * TypeScript Types & Interfaces Exports
 *
 * This file exports all TypeScript type definitions and interfaces.
 * Domain models, API types, component props, utility types.
 */

// Global types and utilities
export type * from './global';

// Legacy database entities (replaced by Prisma types)
// Note: Main database types are now exported from @/lib/database
export type {
  CompanySettings,
  LegalConstraints,
  UserPreferences,
  EmployeeAvailability,
  TimeSlot,
  EmployeePreferences,
  LeaveRequest,
  LeaveType,
  Notification,
  AuditLog,
  AIPromptTemplate,
} from './database';

// API types
export type {
  HttpMethod,
  ApiError,
  ApiSuccess,
  ApiPaginatedResponse,
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserPreferencesRequest,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  UpdateEmployeeAvailabilityRequest,
  BulkImportEmployeesRequest,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  GenerateScheduleRequest,
  AssignShiftRequest,
  UpdateAssignmentRequest,
  CreateLeaveRequestRequest,
  UpdateLeaveRequestRequest,
  ProcessLeaveRequestRequest,
  CreateShiftTemplateRequest,
  UpdateShiftTemplateRequest,
  UpdateCompanyRequest,
  UpdateCompanySettingsRequest,
  AnalyticsRequest,
  AnalyticsResponse,
  ReportRequest,
  ReportResponse,
  SearchRequest,
  FilterOptions,
  WebhookEvent,
  WebhookSubscription,
} from './api';
