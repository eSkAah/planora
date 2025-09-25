import { z } from 'zod';

export const employeeListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  department: z.string().trim().max(100).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type EmployeeListQueryInput = z.infer<typeof employeeListQuerySchema>;
