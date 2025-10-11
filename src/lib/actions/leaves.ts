/**
 * Leave Request Server Actions
 *
 * Server actions for managing employee leave/absence requests.
 */

'use server';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  createLeaveRequestSchema,
  getLeaveRequestsQuerySchema,
  updateLeaveRequestSchema,
  updateLeaveStatusSchema,
  type CreateLeaveRequestInput,
  type GetLeaveRequestsQuery,
  type UpdateLeaveRequestInput,
  type UpdateLeaveStatusInput,
} from '@/lib/validations';

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Get leave requests with optional filters
 */
export async function getLeaveRequests(
  query?: GetLeaveRequestsQuery
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

    // Validate query params
    let validatedQuery: GetLeaveRequestsQuery = {};
    if (query) {
      const validation = getLeaveRequestsQuerySchema.safeParse(query);
      if (!validation.success) {
        return {
          success: false,
          error: 'Paramètres de recherche invalides',
        };
      }
      validatedQuery = validation.data;
    }

    // Build query
    let dbQuery = supabase
      .from('leave_requests')
      .select(
        `
        id,
        employee_id,
        leave_type,
        status,
        start_date,
        end_date,
        days_count,
        reason,
        reviewed_by,
        reviewed_at,
        review_notes,
        created_at,
        updated_at,
        employee:users!leave_requests_employee_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        reviewer:users!leave_requests_reviewed_by_fkey(
          id,
          first_name,
          last_name
        )
      `
      )
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false });

    // If regular employee, only show their own requests
    if (userData.role === 'employee') {
      dbQuery = dbQuery.eq('employee_id', user.id);
    }

    // Apply filters
    if (validatedQuery.employeeId) {
      dbQuery = dbQuery.eq('employee_id', validatedQuery.employeeId);
    }
    if (validatedQuery.status) {
      dbQuery = dbQuery.eq('status', validatedQuery.status);
    }
    if (validatedQuery.leaveType) {
      dbQuery = dbQuery.eq('leave_type', validatedQuery.leaveType);
    }
    if (validatedQuery.startDate) {
      dbQuery = dbQuery.gte('start_date', validatedQuery.startDate);
    }
    if (validatedQuery.endDate) {
      dbQuery = dbQuery.lte('end_date', validatedQuery.endDate);
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
    console.error('Error fetching leave requests:', error);
    return {
      success: false,
      error: 'Une erreur est survenue',
    };
  }
}

/**
 * Create a new leave request
 */
export async function createLeaveRequest(
  input: CreateLeaveRequestInput
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

    // Validate input
    const validation = createLeaveRequestSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Données invalides',
      };
    }

    const validatedData = validation.data;

    // Check if requesting for self or another employee
    const isForSelf = validatedData.employeeId === user.id;
    const isManager = ['admin', 'manager', 'super_admin'].includes(userData.role);

    // Regular employees can only request for themselves
    if (!isForSelf && !isManager) {
      return {
        success: false,
        error: 'Vous ne pouvez créer des demandes que pour vous-même',
      };
    }

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

    // Check for overlapping leave requests
    const { data: overlapping, error: overlapError } = await supabase
      .from('leave_requests')
      .select('id')
      .eq('employee_id', validatedData.employeeId)
      .eq('status', 'approved')
      .or(
        `and(start_date.lte.${validatedData.endDate},end_date.gte.${validatedData.startDate})`
      );

    if (overlapError) {
      console.error('Error checking overlaps:', overlapError);
    }

    if (overlapping && overlapping.length > 0) {
      return {
        success: false,
        error: 'Il existe déjà une demande approuvée pour cette période',
      };
    }

    // Create leave request
    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        company_id: userData.company_id,
        employee_id: validatedData.employeeId,
        leave_type: validatedData.leaveType,
        start_date: validatedData.startDate,
        end_date: validatedData.endDate,
        days_count: validatedData.daysCount,
        reason: validatedData.reason || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/leaves');
    revalidatePath('/planning');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error creating leave request:', error);
    return {
      success: false,
      error: 'Une erreur est survenue',
    };
  }
}

/**
 * Update leave request status (approve/reject/cancel)
 */
export async function updateLeaveStatus(
  leaveRequestId: string,
  input: UpdateLeaveStatusInput
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

    // Validate input
    const validation = updateLeaveStatusSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Données invalides',
      };
    }

    const validatedData = validation.data;

    // Get existing leave request
    const { data: existingLeave, error: leaveError } = await supabase
      .from('leave_requests')
      .select('company_id, employee_id, status')
      .eq('id', leaveRequestId)
      .single();

    if (leaveError || !existingLeave) {
      return {
        success: false,
        error: 'Demande de congé non trouvée',
      };
    }

    if (existingLeave.company_id !== userData.company_id) {
      return {
        success: false,
        error: 'Non autorisé',
      };
    }

    // Check permissions
    const isManager = ['admin', 'manager', 'super_admin'].includes(userData.role);
    const isOwnRequest = existingLeave.employee_id === user.id;

    // Only managers can approve/reject, employees can only cancel their own
    if (validatedData.status === 'cancelled') {
      if (!isOwnRequest && !isManager) {
        return {
          success: false,
          error: 'Vous ne pouvez annuler que vos propres demandes',
        };
      }
    } else {
      if (!isManager) {
        return {
          success: false,
          error: 'Seuls les managers peuvent approuver ou rejeter les demandes',
        };
      }
    }

    // Can't modify already processed requests (except cancelling)
    if (
      existingLeave.status !== 'pending' &&
      validatedData.status !== 'cancelled'
    ) {
      return {
        success: false,
        error: 'Cette demande a déjà été traitée',
      };
    }

    // Prepare update data
    const updateData: any = {
      status: validatedData.status,
    };

    // Only add reviewer info if manager is approving/rejecting
    if (validatedData.status !== 'cancelled') {
      updateData.reviewed_by = user.id;
      updateData.reviewed_at = new Date().toISOString();
      updateData.review_notes = validatedData.reviewNotes || null;
    }

    // Update leave request
    const { data, error } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', leaveRequestId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/leaves');
    revalidatePath('/planning');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error updating leave status:', error);
    return {
      success: false,
      error: 'Une erreur est survenue',
    };
  }
}

/**
 * Update leave request details (before approval)
 */
export async function updateLeaveRequest(
  leaveRequestId: string,
  input: UpdateLeaveRequestInput
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

    // Validate input
    const validation = updateLeaveRequestSchema.safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Données invalides',
      };
    }

    const validatedData = validation.data;

    // Get existing leave request
    const { data: existingLeave, error: leaveError } = await supabase
      .from('leave_requests')
      .select('company_id, employee_id, status')
      .eq('id', leaveRequestId)
      .single();

    if (leaveError || !existingLeave) {
      return {
        success: false,
        error: 'Demande de congé non trouvée',
      };
    }

    if (existingLeave.company_id !== userData.company_id) {
      return {
        success: false,
        error: 'Non autorisé',
      };
    }

    // Check permissions
    const isManager = ['admin', 'manager', 'super_admin'].includes(userData.role);
    const isOwnRequest = existingLeave.employee_id === user.id;

    if (!isOwnRequest && !isManager) {
      return {
        success: false,
        error: 'Vous ne pouvez modifier que vos propres demandes',
      };
    }

    // Can only modify pending requests
    if (existingLeave.status !== 'pending') {
      return {
        success: false,
        error: 'Vous ne pouvez modifier que les demandes en attente',
      };
    }

    // Update leave request
    const { data, error } = await supabase
      .from('leave_requests')
      .update(validatedData)
      .eq('id', leaveRequestId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/leaves');
    revalidatePath('/planning');

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error updating leave request:', error);
    return {
      success: false,
      error: 'Une erreur est survenue',
    };
  }
}

/**
 * Delete a leave request (only pending requests)
 */
export async function deleteLeaveRequest(
  leaveRequestId: string
): Promise<ActionResult> {
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

    // Get leave request
    const { data: leaveData, error: leaveError } = await supabase
      .from('leave_requests')
      .select('company_id, employee_id, status')
      .eq('id', leaveRequestId)
      .single();

    if (leaveError || !leaveData) {
      return {
        success: false,
        error: 'Demande de congé non trouvée',
      };
    }

    if (leaveData.company_id !== userData.company_id) {
      return {
        success: false,
        error: 'Non autorisé',
      };
    }

    // Check permissions
    const isManager = ['admin', 'manager', 'super_admin'].includes(userData.role);
    const isOwnRequest = leaveData.employee_id === user.id;

    if (!isOwnRequest && !isManager) {
      return {
        success: false,
        error: 'Vous ne pouvez supprimer que vos propres demandes',
      };
    }

    // Can only delete pending requests
    if (leaveData.status !== 'pending') {
      return {
        success: false,
        error: 'Vous ne pouvez supprimer que les demandes en attente',
      };
    }

    // Delete leave request
    const { error } = await supabase
      .from('leave_requests')
      .delete()
      .eq('id', leaveRequestId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath('/leaves');
    revalidatePath('/planning');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting leave request:', error);
    return {
      success: false,
      error: 'Une erreur est survenue',
    };
  }
}
