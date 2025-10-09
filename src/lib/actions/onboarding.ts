/**
 * Onboarding Server Actions
 *
 * Server actions for company onboarding process.
 */

'use server';

import { revalidatePath } from 'next/cache';

import { supabaseAdmin } from '@/lib/database/client';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  companyDetailsSchema,
  legalSettingsSchema,
  type CompanyDetailsInput,
  type LegalSettingsInput,
} from '@/lib/validations';

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Get current company data for onboarding
 */
export async function getCompanyForOnboarding(): Promise<
  ActionResult<{
    id: string;
    name: string;
    country: string;
    sector: string;
    sizeCategory: string;
    legalWorkHoursPerWeek: number;
    timezone: string;
    settings: Record<string, unknown>;
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
        error: 'Vous devez être connecté pour accéder à l\'onboarding',
      };
    }

    // Get user's company
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Impossible de récupérer vos informations utilisateur',
      };
    }

    // Get company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', userData.company_id)
      .single();

    if (companyError || !company) {
      return {
        success: false,
        error: 'Impossible de récupérer les informations de votre entreprise',
      };
    }

    return {
      success: true,
      data: {
        id: company.id,
        name: company.name ?? '',
        country: company.country ?? '',
        sector: company.sector ?? '',
        sizeCategory: company.size_category ?? 'small',
        legalWorkHoursPerWeek: company.legal_work_hours_per_week ?? 35,
        timezone: company.timezone ?? 'Europe/Paris',
        settings: (company.settings as Record<string, unknown>) ?? {},
      },
    };
  } catch (error) {
    console.error('Error in getCompanyForOnboarding:', error);
    return {
      success: false,
      error: 'Une erreur est survenue lors de la récupération des données',
    };
  }
}

/**
 * Update company details (Step 1)
 */
export async function updateCompanyDetails(
  data: CompanyDetailsInput
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
    const validation = companyDetailsSchema.safeParse(data);
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

    // Get user's company
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Impossible de récupérer vos informations',
      };
    }

    // Update company with Supabase Admin (to bypass RLS)
    const { error: updateError } = await supabaseAdmin
      .from('companies')
      .update({
        size_category: validation.data.sizeCategory,
        country: validation.data.country,
        sector: validation.data.sector,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.company_id);

    if (updateError) {
      console.error('Error updating company:', updateError);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour des informations',
      };
    }

    revalidatePath('/onboarding');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error in updateCompanyDetails:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}

/**
 * Update legal settings (Step 2)
 */
export async function updateLegalSettings(
  data: LegalSettingsInput
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
    const validation = legalSettingsSchema.safeParse(data);
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

    // Get user's company
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Impossible de récupérer vos informations',
      };
    }

    // Update company
    const { error: updateError } = await supabaseAdmin
      .from('companies')
      .update({
        legal_work_hours_per_week: validation.data.legalWorkHoursPerWeek,
        timezone: validation.data.timezone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.company_id);

    if (updateError) {
      console.error('Error updating legal settings:', updateError);
      return {
        success: false,
        error: 'Erreur lors de la mise à jour des paramètres légaux',
      };
    }

    revalidatePath('/onboarding');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error in updateLegalSettings:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}

/**
 * Create default shift templates and complete onboarding (Step 3)
 */
export async function completeOnboarding(): Promise<ActionResult> {
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

    // Get user's company
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Impossible de récupérer vos informations',
      };
    }

    // Create default shift templates
    const defaultShiftTemplates = [
      {
        company_id: userData.company_id,
        name: 'Matin',
        shift_type: 'morning' as const,
        start_time: '06:00:00',
        end_time: '14:00:00',
        break_duration_minutes: 30,
        color_code: '#3B82F6',
        required_skills: [],
        min_staff_required: 1,
        is_active: true,
      },
      {
        company_id: userData.company_id,
        name: 'Après-midi',
        shift_type: 'afternoon' as const,
        start_time: '14:00:00',
        end_time: '22:00:00',
        break_duration_minutes: 30,
        color_code: '#10B981',
        required_skills: [],
        min_staff_required: 1,
        is_active: true,
      },
      {
        company_id: userData.company_id,
        name: 'Nuit',
        shift_type: 'night' as const,
        start_time: '22:00:00',
        end_time: '06:00:00',
        break_duration_minutes: 30,
        color_code: '#8B5CF6',
        required_skills: [],
        min_staff_required: 1,
        is_active: true,
      },
    ];

    // Create shift templates
    const { error: templatesError } = await supabaseAdmin
      .from('shift_templates')
      .insert(defaultShiftTemplates);

    if (templatesError) {
      console.error('Error creating shift templates:', templatesError);
      return {
        success: false,
        error: 'Erreur lors de la création des modèles de shifts',
      };
    }

    // Mark onboarding as completed
    const { error: settingsError } = await supabaseAdmin
      .from('companies')
      .update({
        settings: {
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', userData.company_id);

    if (settingsError) {
      console.error('Error updating onboarding status:', settingsError);
      return {
        success: false,
        error: 'Erreur lors de la finalisation de l\'onboarding',
      };
    }

    revalidatePath('/');
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error in completeOnboarding:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}
