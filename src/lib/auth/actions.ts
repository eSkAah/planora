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
        error: 'Veuillez vérifier les informations saisies.',
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const { company, user } = validation.data;

    if (!supabaseAdmin) {
      return {
        success: false,
        error: 'Le service n\'est pas disponible actuellement. Veuillez réessayer plus tard.',
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
        error: 'Une erreur est survenue lors de la vérification. Veuillez réessayer.',
      };
    }

    if (existingCompany) {
      return {
        success: false,
        error: 'Une entreprise avec ce nom existe déjà. Veuillez choisir un autre nom.',
      };
    }

    // Create company with onboarding marked as completed
    const { data: insertedCompany, error: insertCompanyError } =
      await supabaseAdmin
        .from('companies')
        .insert({
          name: company.name,
          country: company.country,
          sector: company.sector,
          settings: {
            onboarding_completed: true,
          },
        })
        .select('id')
        .single();

    if (insertCompanyError || !insertedCompany) {
      return {
        success: false,
        error: 'Impossible de créer l\'entreprise. Veuillez réessayer.',
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

      // Check if it's a duplicate email error
      const isDuplicateEmail = adminError?.message?.includes('already registered') ||
                                adminError?.message?.includes('duplicate') ||
                                adminError?.message?.includes('already exists');

      return {
        success: false,
        error: isDuplicateEmail
          ? 'Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.'
          : 'Impossible de créer votre compte. Veuillez réessayer.',
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

      // Check if it's a duplicate key error
      const isDuplicateError = insertUserError.message?.includes('duplicate') ||
                                insertUserError.message?.includes('unique constraint');

      return {
        success: false,
        error: isDuplicateError
          ? 'Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.'
          : 'Impossible de créer votre profil. Veuillez réessayer.',
      };
    }

    // Auto-sign in the user after successful registration
    const supabase = await createServerSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

    if (signInError) {
      // Account was created but auto-signin failed
      // User can still sign in manually
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('Auto-signin failed after registration:', signInError);
      }
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
        autoSignedIn: !signInError, // Indicates if user was automatically signed in
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Registration error:', error);
    }
    return {
      success: false,
      error: 'Une erreur inattendue est survenue. Veuillez réessayer.',
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
        error: 'Email ou mot de passe invalide.',
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
      // Check if it's an authentication error
      const isAuthError = error.message?.includes('Invalid login credentials') ||
                           error.message?.includes('Email not confirmed') ||
                           error.message?.includes('Invalid') ||
                           error.message?.includes('credentials');

      return {
        success: false,
        error: isAuthError
          ? 'Email ou mot de passe incorrect.'
          : 'Impossible de se connecter. Veuillez réessayer.',
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
      error: 'Une erreur inattendue est survenue. Veuillez réessayer.',
    };
  }
}

/**
 * Send magic link for login
 */
export async function sendMagicLinkLogin(
  email: string
): Promise<ActionResult> {
  try {
    if (!email || typeof email !== 'string') {
      return {
        success: false,
        error: 'Email requis',
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Email invalide',
      };
    }

    if (!supabaseAdmin) {
      return {
        success: false,
        error: 'Service non configuré',
      };
    }

    // Check if user exists
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, email, is_active')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Aucun compte trouvé avec cet email',
      };
    }

    if (!userData.is_active) {
      return {
        success: false,
        error: 'Ce compte est désactivé',
      };
    }

    // Generate magic link
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: userData.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
        },
      });

    if (linkError || !linkData) {
      console.error('❌ Error generating magic link:', linkError);
      return {
        success: false,
        error: 'Erreur lors de la génération du lien de connexion',
      };
    }

    // Send magic link email
    try {
      const { sendLoginMagicLink } = await import('@/lib/services/email');

      await sendLoginMagicLink({
        email: userData.email,
        userName: `${userData.first_name} ${userData.last_name}`,
        magicLink: linkData.properties.action_link,
      });

      console.log('✅ Magic link email sent successfully to:', userData.email);
    } catch (emailError) {
      console.error('❌ Error sending magic link email:', emailError);
      return {
        success: false,
        error:
          'Le lien a été généré mais l\'email n\'a pas pu être envoyé. Veuillez réessayer.',
      };
    }

    return {
      success: true,
      data: {
        message: 'Un lien de connexion a été envoyé à votre adresse email',
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Magic link error:', error);
    }
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
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
