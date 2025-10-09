import { z } from 'zod';

// Step 1: Company details
export const companyDetailsSchema = z.object({
  sizeCategory: z.enum(['small', 'medium', 'large'], {
    message: 'Veuillez sélectionner une taille d\'entreprise',
  }),
  country: z.string().min(1, 'Le pays est requis'),
  sector: z.string().min(1, 'Le secteur est requis'),
});

// Step 2: Legal settings
export const legalSettingsSchema = z.object({
  legalWorkHoursPerWeek: z.number().min(20).max(48, {
    message: 'Les heures légales doivent être entre 20 et 48',
  }),
  timezone: z.string().min(1, 'Le fuseau horaire est requis'),
});

// Step 3: Default contracts (will be created server-side)
export const defaultContractsSchema = z.object({
  createDefaultContracts: z.boolean().default(true),
});

// Complete onboarding schema
export const onboardingSchema = z.object({
  step1: companyDetailsSchema,
  step2: legalSettingsSchema,
  step3: defaultContractsSchema,
});

// Type exports
export type CompanyDetailsInput = z.infer<typeof companyDetailsSchema>;
export type LegalSettingsInput = z.infer<typeof legalSettingsSchema>;
export type DefaultContractsInput = z.infer<typeof defaultContractsSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
