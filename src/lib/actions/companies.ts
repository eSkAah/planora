/**
 * Company Management Server Actions
 *
 * Server actions for managing company information.
 */

'use server';

import { revalidatePath } from 'next/cache';

import { supabaseAdmin } from '@/lib/database/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateCompanySchema, type UpdateCompanyInput } from '@/lib/validations';

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Get company information for the current user
 */
export async function getCompany(): Promise<
  ActionResult<{
    id: string;
    name: string;
    country: string;
    sector: string;
    sizeCategory: string;
    legalWorkHoursPerWeek: number;
    timezone: string;
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
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData || !userData.company_id) {
      return {
        success: false,
        error: 'Impossible de récupérer vos informations',
      };
    }

    // Get company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', userData.company_id)
      .single();

    if (companyError || !company) {
      return {
        success: false,
        error: 'Entreprise non trouvée',
      };
    }

    return {
      success: true,
      data: {
        id: company.id,
        name: company.name,
        country: company.country,
        sector: company.sector,
        sizeCategory: company.size_category,
        legalWorkHoursPerWeek: company.legal_work_hours_per_week,
        timezone: company.timezone,
        createdAt: company.created_at,
      },
    };
  } catch (error) {
    console.error('Error in getCompany:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}

/**
 * Update company information
 */
export async function updateCompany(data: UpdateCompanyInput): Promise<ActionResult> {
  try {
    if (!supabaseAdmin) {
      return {
        success: false,
        error: 'Configuration serveur manquante',
      };
    }

    const supabase = await createServerSupabaseClient();

    // Validate data
    const validation = updateCompanySchema.safeParse(data);
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

    if (userError || !userData || !userData.company_id) {
      return {
        success: false,
        error: 'Impossible de récupérer vos informations',
      };
    }

    // Check permissions (only admin can update company)
    if (userData.role !== 'admin') {
      return {
        success: false,
        error: 'Seuls les administrateurs peuvent modifier l\'entreprise',
      };
    }

    // Update company
    const { error: updateError } = await supabaseAdmin
      .from('companies')
      .update({
        name: validation.data.name,
        country: validation.data.country,
        sector: validation.data.sector,
        size_category: validation.data.sizeCategory,
        legal_work_hours_per_week: validation.data.legalWorkHoursPerWeek,
        timezone: validation.data.timezone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.company_id);

    if (updateError) {
      console.error('Error updating company:', updateError);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour de l\'entreprise',
      };
    }

    revalidatePath('/settings/company');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error in updateCompany:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}
