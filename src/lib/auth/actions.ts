/**
 * Authentication Server Actions
 *
 * Server actions for user authentication and account creation.
 */

'use server';

import { redirect } from 'next/navigation';

import {
  getPrismaClient,
  isDatabaseConfigured,
  supabaseAdmin,
} from '@/lib/database/client';
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
  const db = getPrismaClient();

  if (!isDatabaseConfigured() || !db) {
    return {
      success: false,
      error:
        "La base de données n'est pas configurée. Définissez DATABASE_URL avant de créer un compte.",
    };
  }

  try {
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

    const existingCompany = await db.company.findUnique({
      where: { name: company.name },
      select: { id: true },
    });

    if (existingCompany) {
      return {
        success: false,
        error: 'Company name already exists',
      };
    }

    const supabase = await createServerSupabaseClient();
    const adminClient = supabaseAdmin;

    const newCompany = await db.company.create({
      data: {
        name: company.name,
        country: company.country,
        sector: company.sector,
      },
    });

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
      await db.company.delete({ where: { id: newCompany.id } });

      return {
        success: false,
        error: authError?.message || 'Failed to create user account',
      };
    }

    try {
      await db.user.create({
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
      if (authUser.user && adminClient) {
        await adminClient.auth.admin.deleteUser(authUser.user.id);
      }
      await db.company.delete({ where: { id: newCompany.id } });

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

    const supabase = await createServerSupabaseClient();

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
 * Sign out action (server)
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error('Sign out error:', error);
  }

  redirect('/');
}
