/**
 * Authentication Validation Schemas
 *
 * Zod schemas for user authentication and account creation.
 */

import { z } from 'zod';

// Company creation schema
export const companyCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must not exceed 100 characters'),
  country: z
    .string()
    .min(2, 'Country is required')
    .refine(value => ['France', 'Luxembourg'].includes(value), {
      message: 'Currently supported countries: France, Luxembourg',
    }),
  sector: z
    .string()
    .min(2, 'Sector is required')
    .max(50, 'Sector must not exceed 50 characters'),
});

// User registration schema
export const userRegistrationSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email must not exceed 255 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string(),
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must not exceed 50 characters')
      .regex(
        /^[a-zA-ZÀ-ÿ\s'-]+$/,
        'First name can only contain letters, spaces, hyphens, and apostrophes'
      ),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must not exceed 50 characters')
      .regex(
        /^[a-zA-ZÀ-ÿ\s'-]+$/,
        'Last name can only contain letters, spaces, hyphens, and apostrophes'
      ),
    role: z.enum(['admin', 'manager', 'employee']).default('employee'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// User login schema
export const userLoginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: z.string().min(1, 'Password is required'),
});

// Account creation combined schema (company + user)
export const accountCreationSchema = z.object({
  company: companyCreateSchema,
  user: userRegistrationSchema,
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters'),
});

// Password reset confirmation schema
export const passwordResetConfirmSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Type exports
export type CompanyCreateInput = z.infer<typeof companyCreateSchema>;
export type UserRegistrationInput = z.infer<typeof userRegistrationSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type AccountCreationInput = z.infer<typeof accountCreationSchema>;
export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;
export type PasswordResetConfirmInput = z.infer<
  typeof passwordResetConfirmSchema
>;
