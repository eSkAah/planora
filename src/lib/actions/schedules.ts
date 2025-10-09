'use server';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  createScheduleAssignmentSchema,
  createScheduleSchema,
  generateScheduleSchema,
  updateScheduleAssignmentSchema,
  updateScheduleSchema,
} from '@/lib/validations/schedules';

/**
 * Create a new schedule
 */
export async function createSchedule(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Get user data including company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'Utilisateur introuvable' };
    }

    // Parse and validate input
    const rawData = {
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      startDate: formData.get('startDate')
        ? new Date(formData.get('startDate') as string)
        : undefined,
      endDate: formData.get('endDate') ? new Date(formData.get('endDate') as string) : undefined,
      generationMethod: formData.get('generationMethod') || 'manual',
      aiPrompt: formData.get('aiPrompt') || undefined,
      aiConstraints: formData.get('aiConstraints')
        ? JSON.parse(formData.get('aiConstraints') as string)
        : undefined,
      aiOptimizationGoals: formData.get('aiOptimizationGoals')
        ? JSON.parse(formData.get('aiOptimizationGoals') as string)
        : undefined,
    };

    const validation = createScheduleSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Données invalides',
      };
    }

    // Create schedule
    const { data: scheduleData, error: insertError } = await supabase
      .from('schedules')
      .insert({
        company_id: userData.company_id,
        title: validation.data.title,
        description: validation.data.description || null,
        start_date: validation.data.startDate.toISOString().split('T')[0],
        end_date: validation.data.endDate.toISOString().split('T')[0],
        generated_by: user.id,
        generation_method: validation.data.generationMethod,
        ai_prompt: validation.data.aiPrompt || null,
        ai_constraints: validation.data.aiConstraints || {},
        ai_optimization_goals: validation.data.aiOptimizationGoals || [],
        status: 'draft',
        total_hours: 0,
        total_cost: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating schedule:', insertError);
      return { success: false, error: 'Erreur lors de la création du planning' };
    }

    revalidatePath('/schedules');
    return { success: true, data: scheduleData };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Update an existing schedule
 */
export async function updateSchedule(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Parse and validate input
    const rawData = {
      id: formData.get('id'),
      title: formData.get('title') || undefined,
      description: formData.get('description') || undefined,
      status: formData.get('status') || undefined,
    };

    const validation = updateScheduleSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Données invalides',
      };
    }

    // Update schedule
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validation.data.title) updateData.title = validation.data.title;
    if (validation.data.description !== undefined)
      updateData.description = validation.data.description;
    if (validation.data.status) {
      updateData.status = validation.data.status;
      if (validation.data.status === 'published') {
        updateData.published_at = new Date().toISOString();
        updateData.published_by = user.id;
      }
    }

    const { data: scheduleData, error: updateError } = await supabase
      .from('schedules')
      .update(updateData)
      .eq('id', validation.data.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating schedule:', updateError);
      return { success: false, error: 'Erreur lors de la mise à jour du planning' };
    }

    revalidatePath('/schedules');
    return { success: true, data: scheduleData };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(scheduleId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Delete schedule (this will cascade delete schedule_assignments)
    const { error: deleteError } = await supabase.from('schedules').delete().eq('id', scheduleId);

    if (deleteError) {
      console.error('Error deleting schedule:', deleteError);
      return { success: false, error: 'Erreur lors de la suppression du planning' };
    }

    revalidatePath('/schedules');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Create a schedule assignment (shift)
 */
export async function createScheduleAssignment(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Get user data including company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'Utilisateur introuvable' };
    }

    // Parse and validate input
    const rawData = {
      scheduleId: formData.get('scheduleId'),
      employeeId: formData.get('employeeId'),
      shiftTemplateId: formData.get('shiftTemplateId') || undefined,
      date: formData.get('date') ? new Date(formData.get('date') as string) : undefined,
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      breakDurationMinutes: formData.get('breakDurationMinutes')
        ? Number(formData.get('breakDurationMinutes'))
        : 0,
      notes: formData.get('notes') || undefined,
    };

    const validation = createScheduleAssignmentSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Données invalides',
      };
    }

    // Create assignment
    const { data: assignmentData, error: insertError } = await supabase
      .from('schedule_assignments')
      .insert({
        schedule_id: validation.data.scheduleId,
        employee_id: validation.data.employeeId,
        shift_template_id: validation.data.shiftTemplateId || null,
        company_id: userData.company_id,
        date: validation.data.date.toISOString().split('T')[0],
        start_time: validation.data.startTime,
        end_time: validation.data.endTime,
        break_duration_minutes: validation.data.breakDurationMinutes,
        notes: validation.data.notes || null,
        status: 'scheduled',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating assignment:', insertError);
      return { success: false, error: "Erreur lors de la création de l'assignation" };
    }

    // Update schedule total hours
    await updateScheduleTotals(validation.data.scheduleId);

    revalidatePath('/schedules');
    return { success: true, data: assignmentData };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Update a schedule assignment
 */
export async function updateScheduleAssignment(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Parse and validate input
    const rawData = {
      id: formData.get('id'),
      status: formData.get('status') || undefined,
      actualStartTime: formData.get('actualStartTime') || undefined,
      actualEndTime: formData.get('actualEndTime') || undefined,
      notes: formData.get('notes') || undefined,
      employeeNotes: formData.get('employeeNotes') || undefined,
      managerNotes: formData.get('managerNotes') || undefined,
    };

    const validation = updateScheduleAssignmentSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Données invalides',
      };
    }

    // Update assignment
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validation.data.status) {
      updateData.status = validation.data.status;
      if (validation.data.status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
        updateData.confirmed_by = user.id;
      }
    }
    if (validation.data.actualStartTime) updateData.actual_start_time = validation.data.actualStartTime;
    if (validation.data.actualEndTime) updateData.actual_end_time = validation.data.actualEndTime;
    if (validation.data.notes !== undefined) updateData.notes = validation.data.notes;
    if (validation.data.employeeNotes !== undefined)
      updateData.employee_notes = validation.data.employeeNotes;
    if (validation.data.managerNotes !== undefined)
      updateData.manager_notes = validation.data.managerNotes;

    const { data: assignmentData, error: updateError } = await supabase
      .from('schedule_assignments')
      .update(updateData)
      .eq('id', validation.data.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating assignment:', updateError);
      return { success: false, error: "Erreur lors de la mise à jour de l'assignation" };
    }

    revalidatePath('/schedules');
    return { success: true, data: assignmentData };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Delete a schedule assignment
 */
export async function deleteScheduleAssignment(assignmentId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Get schedule_id before deleting
    const { data: assignmentData } = await supabase
      .from('schedule_assignments')
      .select('schedule_id')
      .eq('id', assignmentId)
      .single();

    // Delete assignment
    const { error: deleteError } = await supabase
      .from('schedule_assignments')
      .delete()
      .eq('id', assignmentId);

    if (deleteError) {
      console.error('Error deleting assignment:', deleteError);
      return { success: false, error: "Erreur lors de la suppression de l'assignation" };
    }

    // Update schedule totals if we have the schedule_id
    if (assignmentData?.schedule_id) {
      await updateScheduleTotals(assignmentData.schedule_id);
    }

    revalidatePath('/schedules');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Helper function to update schedule totals (hours, cost, coverage)
 */
async function updateScheduleTotals(scheduleId: string) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get all assignments for this schedule
    const { data: assignments } = await supabase
      .from('schedule_assignments')
      .select('start_time, end_time, break_duration_minutes')
      .eq('schedule_id', scheduleId);

    if (!assignments) return;

    // Calculate total hours
    let totalHours = 0;
    assignments.forEach((assignment) => {
      const start = new Date(`2000-01-01T${assignment.start_time}`);
      const end = new Date(`2000-01-01T${assignment.end_time}`);
      let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      hours -= assignment.break_duration_minutes / 60;
      totalHours += hours;
    });

    // Update schedule
    await supabase
      .from('schedules')
      .update({
        total_hours: totalHours,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scheduleId);
  } catch (error) {
    console.error('Error updating schedule totals:', error);
  }
}

/**
 * Generate a schedule using AI or templates
 */
export async function generateSchedule(formData: FormData) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Non authentifié' };
    }

    // Get user data including company_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'Utilisateur introuvable' };
    }

    // Parse and validate input
    const rawData = {
      title: formData.get('title'),
      startDate: formData.get('startDate')
        ? new Date(formData.get('startDate') as string)
        : undefined,
      endDate: formData.get('endDate') ? new Date(formData.get('endDate') as string) : undefined,
      includeWeekends: formData.get('includeWeekends') === 'true',
      optimizationGoals: formData.get('optimizationGoals')
        ? JSON.parse(formData.get('optimizationGoals') as string)
        : undefined,
      constraints: formData.get('constraints')
        ? JSON.parse(formData.get('constraints') as string)
        : undefined,
    };

    const validation = generateScheduleSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || 'Données invalides',
      };
    }

    // Get employees
    const { data: employees } = await supabase
      .from('employees')
      .select('*, user:users(*)')
      .eq('company_id', userData.company_id)
      .eq('is_active', true);

    if (!employees || employees.length === 0) {
      return { success: false, error: 'Aucun employé actif trouvé' };
    }

    // Get shift templates
    const { data: shiftTemplates } = await supabase
      .from('shift_templates')
      .select('*')
      .eq('company_id', userData.company_id)
      .eq('is_active', true);

    if (!shiftTemplates || shiftTemplates.length === 0) {
      return { success: false, error: 'Aucun template de shift trouvé' };
    }

    // Create schedule
    const { data: scheduleData, error: insertError } = await supabase
      .from('schedules')
      .insert({
        company_id: userData.company_id,
        title: validation.data.title,
        start_date: validation.data.startDate.toISOString().split('T')[0],
        end_date: validation.data.endDate.toISOString().split('T')[0],
        generated_by: user.id,
        generation_method: 'ai',
        ai_constraints: validation.data.constraints,
        ai_optimization_goals: validation.data.optimizationGoals,
        status: 'draft',
        total_hours: 0,
        total_cost: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating schedule:', insertError);
      return { success: false, error: 'Erreur lors de la création du planning' };
    }

    // Generate assignments using a simple algorithm
    // This is a basic implementation - can be enhanced with AI later
    const assignments = [];
    const startDate = new Date(validation.data.startDate);
    const endDate = new Date(validation.data.endDate);

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (!validation.data.includeWeekends && isWeekend) {
        continue;
      }

      // Assign shifts for each day
      // Use morning, afternoon, and evening shifts
      const dailyShifts = shiftTemplates.filter((t) =>
        isWeekend ? t.is_weekend_shift : !t.is_weekend_shift
      );

      for (const shift of dailyShifts.slice(0, 3)) {
        // Max 3 shifts per day
        // Assign to a random employee (simple algorithm)
        const employee = employees[Math.floor(Math.random() * employees.length)];

        assignments.push({
          schedule_id: scheduleData.id,
          employee_id: employee.id,
          shift_template_id: shift.id,
          company_id: userData.company_id,
          date: date.toISOString().split('T')[0],
          start_time: shift.start_time,
          end_time: shift.end_time,
          break_duration_minutes: shift.break_duration_minutes,
          status: 'scheduled',
        });
      }
    }

    // Insert all assignments
    if (assignments.length > 0) {
      const { error: assignmentsError } = await supabase
        .from('schedule_assignments')
        .insert(assignments);

      if (assignmentsError) {
        console.error('Error creating assignments:', assignmentsError);
        // Don't fail the whole operation, just log the error
      }
    }

    // Update totals
    await updateScheduleTotals(scheduleData.id);

    revalidatePath('/schedules');
    return { success: true, data: scheduleData };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}
