/**
 * Leave Request Validation Schemas
 *
 * Zod schemas for validating leave/absence request data.
 */

import { z } from 'zod';

/**
 * Leave type enum
 */
export const leaveTypeEnum = z.enum([
  'vacation',
  'sick',
  'rtt',
  'unpaid',
  'parental',
  'other',
]);

export type LeaveType = z.infer<typeof leaveTypeEnum>;

/**
 * Leave status enum
 */
export const leaveStatusEnum = z.enum([
  'pending',
  'approved',
  'rejected',
  'cancelled',
]);

export type LeaveStatus = z.infer<typeof leaveStatusEnum>;

/**
 * Schema for creating a new leave request
 */
export const createLeaveRequestSchema = z
  .object({
    employeeId: z.string().uuid('ID employé invalide'),
    leaveType: leaveTypeEnum,
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date de début invalide (format: YYYY-MM-DD)'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date de fin invalide (format: YYYY-MM-DD)'),
    daysCount: z
      .number()
      .positive('Le nombre de jours doit être positif')
      .max(365, 'Le nombre de jours ne peut pas dépasser 365'),
    reason: z
      .string()
      .max(1000, 'La raison ne peut pas dépasser 1000 caractères')
      .optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: 'La date de fin doit être après ou égale à la date de début',
      path: ['endDate'],
    }
  );

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;

/**
 * Schema for updating leave request status (approve/reject)
 */
export const updateLeaveStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'cancelled']),
  reviewNotes: z
    .string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères')
    .optional(),
});

export type UpdateLeaveStatusInput = z.infer<typeof updateLeaveStatusSchema>;

/**
 * Schema for updating leave request details
 */
export const updateLeaveRequestSchema = z
  .object({
    leaveType: leaveTypeEnum.optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date de début invalide (format: YYYY-MM-DD)')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date de fin invalide (format: YYYY-MM-DD)')
      .optional(),
    daysCount: z
      .number()
      .positive('Le nombre de jours doit être positif')
      .max(365, 'Le nombre de jours ne peut pas dépasser 365')
      .optional(),
    reason: z
      .string()
      .max(1000, 'La raison ne peut pas dépasser 1000 caractères')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end >= start;
      }
      return true;
    },
    {
      message: 'La date de fin doit être après ou égale à la date de début',
      path: ['endDate'],
    }
  );

export type UpdateLeaveRequestInput = z.infer<typeof updateLeaveRequestSchema>;

/**
 * Schema for querying leave requests
 */
export const getLeaveRequestsQuerySchema = z.object({
  employeeId: z.string().uuid().optional(),
  status: leaveStatusEnum.optional(),
  leaveType: leaveTypeEnum.optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type GetLeaveRequestsQuery = z.infer<typeof getLeaveRequestsQuerySchema>;
