/**
 * Authentication Server Actions
 *
 * Server actions for user authentication and account creation.
 */

'use server';

import { redirect } from 'next/navigation';

import { prisma } from '@/lib/database';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { accountCreationSchema, userLoginSchema } from '@/lib/validations';

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Create a new company and user account
 */
export async function createAccount(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient();

    // Extract and validate form data
    const rawData = {
      company: {
        name: formData.get('company.name') as string,
        country: formData.get('company.country') as string,
        sector: formData.get('company.sector') as string,
      },
      user: {
        email: formData.get('user.email') as string,
        password: formData.get('user.password') as string,
        confirmPassword: formData.get('user.confirmPassword') as string,
        firstName: formData.get('user.firstName') as string,
        lastName: formData.get('user.lastName') as string,
        role: (formData.get('user.role') as string) || 'employee',
      },
    };

    const validation = accountCreationSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const { company, user } = validation.data;

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { name: company.name },
    });

    if (existingCompany) {
      return {
        success: false,
        error: 'Company name already exists',
      };
    }

    // Create company first
    const newCompany = await prisma.company.create({
      data: {
        name: company.name,
        country: company.country,
        sector: company.sector,
      },
    });

    // Create user account with Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          company_id: newCompany.id,
        },
      },
    });

    if (authError || !authUser.user) {
      // Cleanup: remove company if user creation failed
      await prisma.company.delete({
        where: { id: newCompany.id },
      });

      return {
        success: false,
        error: authError?.message || 'Failed to create user account',
      };
    }

    // Create user profile in our users table
    try {
      await prisma.user.create({
        data: {
          id: authUser.user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.toUpperCase() as 'ADMIN' | 'MANAGER' | 'EMPLOYEE',
          companyId: newCompany.id,
        },
      });
    } catch {
      // Cleanup: remove auth user and company if profile creation failed
      if (authUser.user) {
        await supabase.auth.admin?.deleteUser(authUser.user.id);
      }
      await prisma.company.delete({
        where: { id: newCompany.id },
      });

      return {
        success: false,
        error: 'Failed to create user profile',
      };
    }

    return {
      success: true,
      data: {
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          company_id: newCompany.id,
        },
        requiresEmailConfirmation: !authUser.session,
      },
    };
  } catch (error) {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Registration error:', error);
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Sign in user
 */
export async function signIn(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient();

    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validation = userLoginSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid email or password',
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const { email, password } = validation.data;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    };
  } catch (error) {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Sign in error:', error);
    }
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error('Sign out error:', error);
  }
  redirect('/');
}
