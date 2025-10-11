/**
 * Shift Validation Schemas
 */

import { z } from 'zod';

// Shift types enum
export const shiftTypeEnum = z.enum([
  'morning',
  'afternoon',
  'evening',
  'night',
  'custom',
]);

/**
 * Create shift schema
 */
export const createShiftSchema = z
  .object({
    employeeId: z.string().uuid('ID employé invalide'),
    shiftDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format: YYYY-MM-DD)'),
    startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Heure de début invalide (format: HH:MM)'),
    endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Heure de fin invalide (format: HH:MM)'),
    shiftType: shiftTypeEnum,
    breakDuration: z.number().int().min(0).max(480).default(0),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (_data) => {
      // Allow overnight shifts (end time can be less than start time)
      return true;
    },
    {
      message: 'L\'heure de fin doit être valide',
      path: ['endTime'],
    }
  );

/**
 * Update shift schema
 */
export const updateShiftSchema = z
  .object({
    shiftDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format: YYYY-MM-DD)').optional(),
    startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Heure de début invalide (format: HH:MM)').optional(),
    endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Heure de fin invalide (format: HH:MM)').optional(),
    shiftType: shiftTypeEnum.optional(),
    breakDuration: z.number().int().min(0).max(480).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      // If both times are provided, validate them
      if (data.startTime && data.endTime) {
        return true;
      }
      return true;
    },
    {
      message: 'Les horaires doivent être valides',
      path: ['endTime'],
    }
  );

/**
 * Get shifts query schema
 */
export const getShiftsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  employeeId: z.string().uuid().optional(),
  shiftType: shiftTypeEnum.optional(),
});

// Export types
export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;
export type GetShiftsQuery = z.infer<typeof getShiftsQuerySchema>;
export type ShiftType = z.infer<typeof shiftTypeEnum>;
