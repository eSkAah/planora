import { z } from 'zod';

export const createScheduleSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  startDate: z.date({
    required_error: 'La date de début est requise',
  }),
  endDate: z.date({
    required_error: 'La date de fin est requise',
  }),
  generationMethod: z.enum(['manual', 'ai', 'template'], {
    required_error: 'La méthode de génération est requise',
  }),
  aiPrompt: z.string().optional(),
  aiConstraints: z.record(z.unknown()).optional(),
  aiOptimizationGoals: z.array(z.string()).optional(),
});

export const updateScheduleSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const createScheduleAssignmentSchema = z.object({
  scheduleId: z.string().uuid(),
  employeeId: z.string().uuid(),
  shiftTemplateId: z.string().uuid().optional(),
  date: z.date(),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Format invalide (HH:MM)'),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Format invalide (HH:MM)'),
  breakDurationMinutes: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export const updateScheduleAssignmentSchema = z.object({
  id: z.string().uuid(),
  status: z
    .enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'missed', 'cancelled'])
    .optional(),
  actualStartTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  actualEndTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  notes: z.string().optional(),
  employeeNotes: z.string().optional(),
  managerNotes: z.string().optional(),
});

export const generateScheduleSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  startDate: z.date({
    required_error: 'La date de début est requise',
  }),
  endDate: z.date({
    required_error: 'La date de fin est requise',
  }),
  includeWeekends: z.boolean().default(false),
  optimizationGoals: z
    .array(
      z.enum([
        'minimize_costs',
        'maximize_coverage',
        'respect_preferences',
        'balance_workload',
        'minimize_overtime',
      ])
    )
    .default(['maximize_coverage', 'respect_preferences']),
  constraints: z
    .object({
      minRestHoursBetweenShifts: z.number().min(0).default(11),
      maxConsecutiveDays: z.number().min(1).default(6),
      respectAvailability: z.boolean().default(true),
      respectSkills: z.boolean().default(true),
    })
    .default({}),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type CreateScheduleAssignmentInput = z.infer<typeof createScheduleAssignmentSchema>;
export type UpdateScheduleAssignmentInput = z.infer<typeof updateScheduleAssignmentSchema>;
export type GenerateScheduleInput = z.infer<typeof generateScheduleSchema>;
