import { z } from 'zod';

export const updateCompanySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  country: z.string().min(1, 'Le pays est requis'),
  sector: z.string().min(1, 'Le secteur est requis'),
  sizeCategory: z.enum(['small', 'medium', 'large', 'enterprise']),
  legalWorkHoursPerWeek: z.number().min(1).max(80),
  timezone: z.string().min(1, 'Le fuseau horaire est requis'),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
