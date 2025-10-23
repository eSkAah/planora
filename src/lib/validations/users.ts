import { z } from 'zod';

/**
 * User Roles (for forms and validation)
 */
export const userRoles = [
  'admin',
  'manager',
  'employee',
  'viewer',
] as const;

export type UserRoleType = (typeof userRoles)[number];

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
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
  role: z.enum(['admin', 'manager', 'employee', 'viewer'], {
    message: 'Rôle invalide',
  }),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
      message: 'Numéro de téléphone invalide',
    })
    .optional()
    .or(z.literal('')),
});

/**
 * Schema for updating an existing user
 */
export const updateUserSchema = z.object({
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
  role: z.enum(['admin', 'manager', 'employee', 'viewer'], {
    message: 'Rôle invalide',
  }).optional(),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, {
      message: 'Numéro de téléphone invalide',
    })
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional(),
});

/**
 * Schema for changing password
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z.string().min(1, 'Confirmez le mot de passe'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

/**
 * Schema for resetting password (first login)
 */
export const resetPasswordSchema = z
  .object({
    temporaryPassword: z.string().min(1, 'Le mot de passe temporaire est requis'),
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
      .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z.string().min(1, 'Confirmez le mot de passe'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
