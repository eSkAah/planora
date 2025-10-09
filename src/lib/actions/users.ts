/**
 * User Management Server Actions
 *
 * Server actions for managing users within a company.
 */

'use server';

import { revalidatePath } from 'next/cache';

import { supabaseAdmin } from '@/lib/database/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/lib/validations';

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Generate a random temporary password
 */
function generateTemporaryPassword(): string {
  const length = 12;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  // Ensure at least one of each required character type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Get all users for the current company
 */
export async function getUsers(): Promise<
  ActionResult<
    Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      phone: string | null;
      isActive: boolean;
      lastLoginAt: string | null;
      createdAt: string;
    }>
  >
> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Vous devez être connecté',
      };
    }

    // Get user's company
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Impossible de récupérer vos informations',
      };
    }

    // Check permissions (only admin and manager can view users)
    if (userData.role !== 'admin' && userData.role !== 'manager') {
      return {
        success: false,
        error: 'Vous n\'avez pas les permissions nécessaires',
      };
    }

    // Get all users from the same company
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, phone, is_active, last_login_at, created_at')
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return {
        success: false,
        error: 'Erreur lors de la récupération des utilisateurs',
      };
    }

    return {
      success: true,
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role,
        phone: u.phone,
        isActive: u.is_active ?? true,
        lastLoginAt: u.last_login_at,
        createdAt: u.created_at ?? new Date().toISOString(),
      })),
    };
  } catch (error) {
    console.error('Error in getUsers:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}

/**
 * Get a specific user by ID
 */
export async function getUser(
  userId: string
): Promise<
  ActionResult<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone: string | null;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
  }>
> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Vous devez être connecté',
      };
    }

    // Get user's company
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Impossible de récupérer vos informations',
      };
    }

    // Check permissions
    if (userData.role !== 'admin' && userData.role !== 'manager') {
      return {
        success: false,
        error: 'Vous n\'avez pas les permissions nécessaires',
      };
    }

    // Get the user
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, phone, is_active, last_login_at, created_at, company_id')
      .eq('id', userId)
      .single();

    if (targetUserError || !targetUser) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
      };
    }

    // Verify same company
    if (targetUser.company_id !== userData.company_id) {
      return {
        success: false,
        error: 'Accès non autorisé',
      };
    }

    return {
      success: true,
      data: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.first_name,
        lastName: targetUser.last_name,
        role: targetUser.role,
        phone: targetUser.phone,
        isActive: targetUser.is_active ?? true,
        lastLoginAt: targetUser.last_login_at,
        createdAt: targetUser.created_at ?? new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error in getUser:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}

/**
 * Create a new user
 */
export async function createUser(
  data: CreateUserInput
): Promise<ActionResult<{ id: string; temporaryPassword: string }>> {
  try {
    if (!supabaseAdmin) {
      return {
        success: false,
        error: 'Configuration serveur manquante',
      };
    }

    const supabase = await createServerSupabaseClient();

    // Validate data
    const validation = createUserSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: 'Données invalides',
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Vous devez être connecté',
      };
    }

    // Get user's company and role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Impossible de récupérer vos informations',
      };
    }

    // Check permissions (only admin can create users)
    if (userData.role !== 'admin') {
      return {
        success: false,
        error: 'Seuls les administrateurs peuvent créer des utilisateurs',
      };
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Create user in Supabase Auth
    const { data: authData, error: createAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email: validation.data.email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          first_name: validation.data.firstName,
          last_name: validation.data.lastName,
        },
      });

    if (createAuthError || !authData.user) {
      console.error('Error creating auth user:', createAuthError);
      return {
        success: false,
        error: createAuthError?.message ?? 'Erreur lors de la création du compte',
      };
    }

    // Create user in users table
    const { error: insertError } = await supabaseAdmin.from('users').insert({
      id: authData.user.id,
      email: validation.data.email,
      first_name: validation.data.firstName,
      last_name: validation.data.lastName,
      role: validation.data.role,
      phone: validation.data.phone || null,
      company_id: userData.company_id,
      is_active: true,
    });

    if (insertError) {
      console.error('Error inserting user:', insertError);

      // Cleanup: delete auth user if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return {
        success: false,
        error: 'Erreur lors de la création de l\'utilisateur',
      };
    }

    revalidatePath('/settings/team');

    return {
      success: true,
      data: {
        id: authData.user.id,
        temporaryPassword,
      },
    };
  } catch (error) {
    console.error('Error in createUser:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}

/**
 * Update an existing user
 */
export async function updateUser(
  userId: string,
  data: UpdateUserInput
): Promise<ActionResult> {
  try {
    if (!supabaseAdmin) {
      return {
        success: false,
        error: 'Configuration serveur manquante',
      };
    }

    const supabase = await createServerSupabaseClient();

    // Validate data
    const validation = updateUserSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: 'Données invalides',
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Vous devez être connecté',
      };
    }

    // Get user's company and role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Impossible de récupérer vos informations',
      };
    }

    // Check permissions (only admin can update users)
    if (userData.role !== 'admin') {
      return {
        success: false,
        error: 'Seuls les administrateurs peuvent modifier les utilisateurs',
      };
    }

    // Get target user to verify same company
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', userId)
      .single();

    if (targetError || !targetUser) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
      };
    }

    if (targetUser.company_id !== userData.company_id) {
      return {
        success: false,
        error: 'Accès non autorisé',
      };
    }

    // Update user
    const updateData: Record<string, unknown> = {};
    if (validation.data.firstName) {
      updateData.first_name = validation.data.firstName;
    }
    if (validation.data.lastName) {
      updateData.last_name = validation.data.lastName;
    }
    if (validation.data.role) {
      updateData.role = validation.data.role;
    }
    if (validation.data.phone !== undefined) {
      updateData.phone = validation.data.phone || null;
    }
    if (validation.data.isActive !== undefined) {
      updateData.is_active = validation.data.isActive;
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour de l\'utilisateur',
      };
    }

    revalidatePath('/settings/team');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error in updateUser:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}

/**
 * Delete (deactivate) a user
 */
export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    if (!supabaseAdmin) {
      return {
        success: false,
        error: 'Configuration serveur manquante',
      };
    }

    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Vous devez être connecté',
      };
    }

    // Get user's company and role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Impossible de récupérer vos informations',
      };
    }

    // Check permissions (only admin can delete users)
    if (userData.role !== 'admin') {
      return {
        success: false,
        error: 'Seuls les administrateurs peuvent supprimer des utilisateurs',
      };
    }

    // Prevent self-deletion
    if (userId === user.id) {
      return {
        success: false,
        error: 'Vous ne pouvez pas supprimer votre propre compte',
      };
    }

    // Get target user to verify same company
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', userId)
      .single();

    if (targetError || !targetUser) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
      };
    }

    if (targetUser.company_id !== userData.company_id) {
      return {
        success: false,
        error: 'Accès non autorisé',
      };
    }

    // Deactivate user (soft delete)
    const { error: deactivateError } = await supabaseAdmin
      .from('users')
      .update({ is_active: false })
      .eq('id', userId);

    if (deactivateError) {
      console.error('Error deactivating user:', deactivateError);
      return {
        success: false,
        error: 'Erreur lors de la désactivation de l\'utilisateur',
      };
    }

    revalidatePath('/settings/team');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}
