/**
 * Shift Server Actions
 *
 * Server actions for managing employee shifts.
 */

'use server';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  createShiftSchema,
  getShiftsQuerySchema,
  updateShiftSchema,
  type CreateShiftInput,
  type GetShiftsQuery,
  type UpdateShiftInput,
} from '@/lib/validations';

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Calculate hours worked based on start and end times
 */
function calculateHoursWorked(
  startTime: string,
  endTime: string,
  breakDuration: number = 0
): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // Handle overnight shifts
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60; // Add 24 hours
  }

  const totalMinutes = endMinutes - startMinutes - breakDuration;
  return Math.round((totalMinutes / 60) * 100) / 100; // Round to 2 decimals
}

/**
 * Get shifts for a date range
 */
export async function getShifts(
  query?: GetShiftsQuery
): Promise<ActionResult<any[]>> {
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
        error: 'Non authentifié',
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
        error: 'Utilisateur non trouvé',
      };
    }

    // Validate query params
    let validatedQuery: GetShiftsQuery = {};
    if (query) {
      const validation = getShiftsQuerySchema.safeParse(query);
      if (!validation.success) {
        return {
          success: false,
          error: 'Paramètres de recherche invalides',
        };
      }
      validatedQuery = validation.data;
    }

    // Build query
    let dbQuery = (supabase
      .from('shifts') as any)
      .select(
        `
        id,
        employee_id,
        shift_date,
        start_time,
        end_time,
        shift_type,
        hours_worked,
        break_duration,
        notes,
        created_at,
        updated_at
      `
      )
      .eq('company_id', userData.company_id)
      .order('shift_date', { ascending: true })
      .order('start_time', { ascending: true });

    // Apply filters
    if (validatedQuery.startDate) {
      dbQuery = dbQuery.gte('shift_date', validatedQuery.startDate);
    }
    if (validatedQuery.endDate) {
      dbQuery = dbQuery.lte('shift_date', validatedQuery.endDate);
    }
    if (validatedQuery.employeeId) {
      dbQuery = dbQuery.eq('employee_id', validatedQuery.employeeId);
    }
    if (validatedQuery.shiftType) {
      dbQuery = dbQuery.eq('shift_type', validatedQuery.shiftType);
    }

    const { data, error } = await dbQuery;

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return {
      success: false,
      error: 'Une erreur est survenue',
    };
  }
}

/**
 * Create a new shift
 */
export async function createShift(
  input: CreateShiftInput
): Promise<ActionResult<any>> {
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
        error: 'Non authentifié',
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
        error: 'Utilisateur non trouvé',
      };
    }

    // Check permissions
    if (!['admin', 'manager', 'super_admin'].includes(userData.role)) {
      return {
        success: false,
        error: 'Vous n\'avez pas les permissions nécessaires',
      };
    }

    // Validate input
    const validation = createShiftSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Données invalides',
      };
    }

    const validatedData = validation.data;

    // Verify employee belongs to same company
    const { data: employeeData, error: employeeError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', validatedData.employeeId)
      .single();

    if (employeeError || !employeeData) {
      return {
        success: false,
        error: 'Employé non trouvé',
      };
    }

    if (employeeData.company_id !== userData.company_id) {
      return {
        success: false,
        error: 'Employé non autorisé',
      };
    }

    // Calculate hours worked
    const hoursWorked = calculateHoursWorked(
      validatedData.startTime,
      validatedData.endTime,
      validatedData.breakDuration
    );

    // Create shift
    const { data, error } = await (supabase
      .from('shifts') as any)
      .insert({
        company_id: userData.company_id,
        employee_id: validatedData.employeeId,
        shift_date: validatedData.shiftDate,
        start_time: validatedData.startTime,
        end_time: validatedData.endTime,
        shift_type: validatedData.shiftType,
        hours_worked: hoursWorked,
        break_duration: validatedData.breakDuration,
        notes: validatedData.notes || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/planning');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error creating shift:', error);
    return {
      success: false,
      error: 'Une erreur est survenue',
    };
  }
}

/**
 * Update a shift
 */
export async function updateShift(
  shiftId: string,
  input: UpdateShiftInput
): Promise<ActionResult<any>> {
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
        error: 'Non authentifié',
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
        error: 'Utilisateur non trouvé',
      };
    }

    // Check permissions
    if (!['admin', 'manager', 'super_admin'].includes(userData.role)) {
      return {
        success: false,
        error: 'Vous n\'avez pas les permissions nécessaires',
      };
    }

    // Validate input
    const validation = updateShiftSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || 'Données invalides',
      };
    }

    const validatedData = validation.data;

    // Get existing shift to verify company and get current values
    const { data: existingShift, error: shiftError } = await (supabase
      .from('shifts') as any)
      .select('company_id, start_time, end_time, break_duration')
      .eq('id', shiftId)
      .single();

    if (shiftError || !existingShift) {
      return {
        success: false,
        error: 'Shift non trouvé',
      };
    }

    if (existingShift.company_id !== userData.company_id) {
      return {
        success: false,
        error: 'Non autorisé',
      };
    }

    // Prepare update data
    const updateData: any = { ...validatedData };

    // Recalculate hours if times are being updated
    if (validatedData.startTime || validatedData.endTime || validatedData.breakDuration !== undefined) {
      const startTime = validatedData.startTime || existingShift.start_time;
      const endTime = validatedData.endTime || existingShift.end_time;
      const breakDuration = validatedData.breakDuration !== undefined
        ? validatedData.breakDuration
        : existingShift.break_duration;

      updateData.hours_worked = calculateHoursWorked(
        startTime,
        endTime,
        breakDuration
      );
    }

    // Update shift
    const { data, error } = await (supabase
      .from('shifts') as any)
      .update(updateData)
      .eq('id', shiftId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/planning');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error updating shift:', error);
    return {
      success: false,
      error: 'Une erreur est survenue',
    };
  }
}

/**
 * Delete a shift
 */
export async function deleteShift(shiftId: string): Promise<ActionResult> {
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
        error: 'Non authentifié',
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
        error: 'Utilisateur non trouvé',
      };
    }

    // Check permissions
    if (!['admin', 'manager', 'super_admin'].includes(userData.role)) {
      return {
        success: false,
        error: 'Vous n\'avez pas les permissions nécessaires',
      };
    }

    // Verify shift belongs to company
    const { data: shiftData, error: shiftError } = await (supabase
      .from('shifts') as any)
      .select('company_id')
      .eq('id', shiftId)
      .single();

    if (shiftError || !shiftData) {
      return {
        success: false,
        error: 'Shift non trouvé',
      };
    }

    if (shiftData.company_id !== userData.company_id) {
      return {
        success: false,
        error: 'Non autorisé',
      };
    }

    // Delete shift
    const { error } = await (supabase.from('shifts') as any).delete().eq('id', shiftId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/planning');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting shift:', error);
    return {
      success: false,
      error: 'Une erreur est survenue',
    };
  }
}
