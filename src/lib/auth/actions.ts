/**
 * Authentication Server Actions
 *
 * Server actions for user authentication and account creation.
 */

'use server';

import { redirect } from 'next/navigation';

import { supabaseAdmin } from '@/lib/database/client';
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
        role: (formData.get('user.role') as string) || 'EMPLOYEE',
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

    if (!supabaseAdmin) {
      return {
        success: false,
        error:
          'Supabase admin client is not configured. Define SUPABASE_SERVICE_ROLE_KEY to enable account creation.',
      };
    }

    // Check if company name already exists
    const { data: existingCompany, error: existingCompanyError } =
      await supabaseAdmin
        .from('companies')
        .select('id')
        .eq('name', company.name)
        .maybeSingle();

    if (existingCompanyError) {
      return {
        success: false,
        error: existingCompanyError.message,
      };
    }

    if (existingCompany) {
      return {
        success: false,
        error: 'Company name already exists',
      };
    }

    // Create company
    const { data: insertedCompany, error: insertCompanyError } =
      await supabaseAdmin
        .from('companies')
        .insert({
          name: company.name,
          country: company.country,
          sector: company.sector,
        })
        .select('id')
        .single();

    if (insertCompanyError || !insertedCompany) {
      return {
        success: false,
        error:
          insertCompanyError?.message || 'Failed to create company in database',
      };
    }

    // Map role to lowercase for Supabase database
    const roleMap = {
      ADMIN: 'admin',
      MANAGER: 'manager',
      EMPLOYEE: 'employee',
      SUPER_ADMIN: 'super_admin',
      VIEWER: 'viewer',
    } as const;
    const dbRole = roleMap[user.role as keyof typeof roleMap] || 'employee';

    // Create user in Supabase Auth
    const { data: createdUser, error: adminError } =
      await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email for better UX
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName,
          role: dbRole,
          company_id: insertedCompany.id,
        },
      });

    if (adminError || !createdUser?.user) {
      await supabaseAdmin
        .from('companies')
        .delete()
        .eq('id', insertedCompany.id);

      return {
        success: false,
        error: adminError?.message || 'Failed to create user account',
      };
    }

    const supabaseUser = createdUser.user;

    // Create user profile in database
    const { error: insertUserError } = await supabaseAdmin
      .from('users')
      .insert({
        id: supabaseUser.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        role: dbRole,
        company_id: insertedCompany.id,
        is_active: true,
      });

    if (insertUserError) {
      // Rollback: delete auth user and company
      await supabaseAdmin.auth.admin.deleteUser(supabaseUser.id);
      await supabaseAdmin
        .from('companies')
        .delete()
        .eq('id', insertedCompany.id);

      return {
        success: false,
        error: insertUserError.message || 'Failed to create user profile',
      };
    }

    return {
      success: true,
      data: {
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          company_id: insertedCompany.id,
        },
        requiresEmailConfirmation: false, // Email is auto-confirmed
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
