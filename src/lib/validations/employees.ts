import { z } from 'zod';

export const employeeListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  department: z.string().trim().max(100).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type EmployeeListQueryInput = z.infer<typeof employeeListQuerySchema>;

/**
 * Contract Types
 */
export const contractTypes = [
  'full_time',
  'part_time',
  'temporary',
  'intern',
  'freelance',
] as const;

export type EmployeeContractType = (typeof contractTypes)[number];

/**
 * Schema for creating a new employee
 * Creates both User and Employee records
 */
export const createEmployeeSchema = z.object({
  // User information (required)
  email: z
    .string()
    .email('Email invalide')
    .min(1, 'L\'email est requis')
    .max(255, 'Email trop long'),
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .max(50, 'Prénom trop long'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .max(50, 'Nom trop long'),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
      message: 'Numéro de téléphone invalide',
    })
    .optional()
    .or(z.literal('')),

  // Personal information (required)
  dateOfBirth: z.coerce.date({
    message: 'Date de naissance invalide',
  }),
  address: z
    .string()
    .min(1, 'L\'adresse est requise')
    .max(255, 'Adresse trop longue'),
  city: z
    .string()
    .min(1, 'La ville est requise')
    .max(100, 'Ville trop longue'),
  postalCode: z
    .string()
    .min(1, 'Le code postal est requis')
    .max(20, 'Code postal invalide'),

  // Emergency contact (optional but recommended)
  emergencyContactName: z
    .string()
    .max(100, 'Nom trop long')
    .optional()
    .or(z.literal('')),
  emergencyContactPhone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
      message: 'Numéro de téléphone invalide',
    })
    .optional()
    .or(z.literal('')),

  // Professional information (required)
  hireDate: z.coerce.date({
    message: 'Date d\'embauche invalide',
  }),
  contractType: z.enum(['full_time', 'part_time', 'temporary', 'intern', 'freelance'], {
    message: 'Type de contrat invalide',
  }),

  // Professional information (optional)
  position: z
    .string()
    .max(100, 'Poste trop long')
    .optional()
    .or(z.literal('')),
  department: z
    .string()
    .max(100, 'Département trop long')
    .optional()
    .or(z.literal('')),
  employeeNumber: z
    .string()
    .max(20, 'Numéro employé trop long')
    .optional()
    .or(z.literal('')),
  managerId: z
    .string()
    .uuid('ID manager invalide')
    .optional()
    .or(z.literal('')),
});

/**
 * Schema for updating an existing employee
 */
export const updateEmployeeSchema = z.object({
  // User information
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .max(50, 'Prénom trop long')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .max(50, 'Nom trop long')
    .optional(),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
      message: 'Numéro de téléphone invalide',
    })
    .optional()
    .or(z.literal('')),

  // Personal information
  dateOfBirth: z.coerce.date({
    message: 'Date invalide',
  }).optional(),
  address: z
    .string()
    .max(255, 'Adresse trop longue')
    .optional(),
  city: z
    .string()
    .max(100, 'Ville trop longue')
    .optional(),
  postalCode: z
    .string()
    .max(20, 'Code postal invalide')
    .optional(),

  // Emergency contact
  emergencyContactName: z
    .string()
    .max(100, 'Nom trop long')
    .optional()
    .or(z.literal('')),
  emergencyContactPhone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
      message: 'Numéro de téléphone invalide',
    })
    .optional()
    .or(z.literal('')),

  // Professional information
  hireDate: z.coerce.date({
    message: 'Date invalide',
  }).optional(),
  contractType: z.enum(['full_time', 'part_time', 'temporary', 'intern', 'freelance'], {
    message: 'Type de contrat invalide',
  }).optional(),
  position: z
    .string()
    .max(100, 'Poste trop long')
    .optional()
    .or(z.literal('')),
  department: z
    .string()
    .max(100, 'Département trop long')
    .optional()
    .or(z.literal('')),
  employeeNumber: z
    .string()
    .max(20, 'Numéro employé trop long')
    .optional()
    .or(z.literal('')),
  managerId: z
    .string()
    .uuid('ID manager invalide')
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  isActive: z.boolean().optional(),
});

// Type exports
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema> & {
  dateOfBirth: Date;
  hireDate: Date;
};
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
