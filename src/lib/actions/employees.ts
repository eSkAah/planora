/**
 * Employee Management Server Actions
 *
 * Server actions for managing employees within a company.
 * Each employee has an associated user account.
 */

'use server';

import { revalidatePath } from 'next/cache';

import { supabaseAdmin } from '@/lib/database/client';
import { sendWelcomeEmail } from '@/lib/services/email';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from '@/lib/validations';

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// Note: Temporary passwords are no longer used - we now use magic link authentication

/**
 * Get all employees for the current company
 */
export async function getEmployees(): Promise<
  ActionResult<
    Array<{
      id: string;
      userId: string | null;
      employeeNumber: string | null;
      hireDate: string;
      department: string | null;
      position: string | null;
      managerId: string | null;
      isActive: boolean;
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
      } | null;
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

    // Check permissions (admin, manager, viewer can see all; employee can see only themselves)
    if (userData.role === 'employee') {
      // Get only this employee's data
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select(`
          id,
          user_id,
          employee_number,
          hire_date,
          department,
          position,
          manager_id,
          is_active,
          users!inner (
            id,
            email,
            first_name,
            last_name,
            phone
          )
        `)
        .eq('user_id', user.id)
        .eq('company_id', userData.company_id)
        .single();

      if (employeeError || !employee) {
        return {
          success: false,
          error: 'Profil employé non trouvé',
        };
      }

      const userRecord = Array.isArray(employee.users) ? employee.users[0] : employee.users;

      return {
        success: true,
        data: [
          {
            id: employee.id,
            userId: employee.user_id,
            employeeNumber: employee.employee_number,
            hireDate: employee.hire_date,
            department: employee.department,
            position: employee.position,
            managerId: employee.manager_id,
            isActive: employee.is_active ?? true,
            user: userRecord ? {
              id: userRecord.id,
              email: userRecord.email,
              firstName: userRecord.first_name,
              lastName: userRecord.last_name,
              phone: userRecord.phone,
            } : null,
          },
        ],
      };
    }

    // Admin, manager, viewer can see all employees
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select(`
        id,
        user_id,
        employee_number,
        hire_date,
        department,
        position,
        manager_id,
        is_active,
        users (
          id,
          email,
          first_name,
          last_name,
          phone
        )
      `)
      .eq('company_id', userData.company_id)
      .order('created_at', { ascending: false });

    if (employeesError) {
      console.error('Error fetching employees:', employeesError);
      return {
        success: false,
        error: 'Erreur lors de la récupération des employés',
      };
    }

    return {
      success: true,
      data: employees.map((emp) => {
        const userRecord = Array.isArray(emp.users) ? emp.users[0] : emp.users;
        return {
          id: emp.id,
          userId: emp.user_id,
          employeeNumber: emp.employee_number,
          hireDate: emp.hire_date,
          department: emp.department,
          position: emp.position,
          managerId: emp.manager_id,
          isActive: emp.is_active ?? true,
          user: userRecord ? {
            id: userRecord.id,
            email: userRecord.email,
            firstName: userRecord.first_name,
            lastName: userRecord.last_name,
            phone: userRecord.phone,
          } : null,
        };
      }),
    };
  } catch (error) {
    console.error('Error in getEmployees:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}

/**
 * Create a new employee (creates user account + employee record)
 * Sends a magic link via email for the employee to access their account
 */
export async function createEmployee(
  data: CreateEmployeeInput
): Promise<ActionResult<{ id: string }>> {
  try {
    if (!supabaseAdmin) {
      return {
        success: false,
        error: 'Configuration serveur manquante',
      };
    }

    const supabase = await createServerSupabaseClient();

    // Validate data
    const validation = createEmployeeSchema.safeParse(data);
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

    // Check permissions (only admin can create employees)
    if (userData.role !== 'admin') {
      return {
        success: false,
        error: 'Seuls les administrateurs peuvent créer des employés',
      };
    }

    // Ensure company_id exists
    if (!userData.company_id) {
      return {
        success: false,
        error: 'Vous n\'êtes pas associé à une entreprise',
      };
    }

    // Create user in Supabase Auth without password (will use magic link)
    const { data: authData, error: createAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email: validation.data.email,
        email_confirm: false, // Will confirm via magic link
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
    const { error: insertUserError } = await supabaseAdmin.from('users').insert({
      id: authData.user.id,
      email: validation.data.email,
      first_name: validation.data.firstName,
      last_name: validation.data.lastName,
      role: 'employee', // All employees have employee role
      phone: validation.data.phone || null,
      company_id: userData.company_id as string,
      is_active: true,
    });

    if (insertUserError) {
      console.error('Error inserting user:', insertUserError);

      // Cleanup: delete auth user if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return {
        success: false,
        error: 'Erreur lors de la création de l\'utilisateur',
      };
    }

    // Create employee record
    const { data: employeeData, error: insertEmployeeError } = await supabaseAdmin
      .from('employees')
      .insert({
        user_id: authData.user.id,
        company_id: userData.company_id as string,
        employee_number: validation.data.employeeNumber || null,
        date_of_birth: validation.data.dateOfBirth.toISOString().split('T')[0],
        address: validation.data.address,
        city: validation.data.city,
        postal_code: validation.data.postalCode,
        emergency_contact_name: validation.data.emergencyContactName || null,
        emergency_contact_phone: validation.data.emergencyContactPhone || null,
        hire_date: validation.data.hireDate.toISOString().split('T')[0],
        department: validation.data.department || null,
        position: validation.data.position || null,
        manager_id: validation.data.managerId || null,
        is_active: true,
      } as any)
      .select('id')
      .single();

    if (insertEmployeeError || !employeeData) {
      console.error('Error inserting employee:', insertEmployeeError);

      // Cleanup: delete user and auth user
      await supabaseAdmin.from('users').delete().eq('id', authData.user.id);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return {
        success: false,
        error: 'Erreur lors de la création de l\'employé',
      };
    }

    // Get company legal settings for default hours per week
    const { data: companyData } = await supabaseAdmin
      .from('companies')
      .select('legal_work_hours_per_week')
      .eq('id', userData.company_id as string)
      .single();

    const defaultHoursPerWeek = companyData?.legal_work_hours_per_week || 35;

    // Create contract record with all required fields
    const { error: insertContractError } = await supabaseAdmin
      .from('contracts')
      .insert({
        employee_id: employeeData.id,
        company_id: userData.company_id as string,
        contract_type: validation.data.contractType,
        title: `Contrat ${validation.data.contractType === 'full_time' ? 'Temps plein' : validation.data.contractType === 'part_time' ? 'Temps partiel' : validation.data.contractType === 'temporary' ? 'Temporaire' : validation.data.contractType === 'intern' ? 'Stage' : validation.data.contractType === 'freelance' ? 'Freelance' : 'Apprentissage'}`,
        hours_per_week: defaultHoursPerWeek,
        start_date: validation.data.hireDate.toISOString().split('T')[0],
        effective_from: validation.data.hireDate.toISOString().split('T')[0],
        is_active: true,
      } as any);

    if (insertContractError) {
      console.error('Error inserting contract:', insertContractError);
      // Don't rollback for contract error, just log it
    }

    // Get company name for email
    const { data: companyNameData } = await supabaseAdmin
      .from('companies')
      .select('name')
      .eq('id', userData.company_id as string)
      .single();

    const companyName = companyNameData?.name || 'Planora';

    // Generate magic link for employee
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: validation.data.email,
      });

    if (linkError || !linkData) {
      console.error('Error generating magic link:', linkError);
      // Don't fail the employee creation if email fails, just log it
      console.warn('⚠️  Employee created but magic link email could not be sent');
    } else {
      // Send welcome email with magic link
      try {
        await sendWelcomeEmail({
          email: validation.data.email,
          employeeName: `${validation.data.firstName} ${validation.data.lastName}`,
          companyName,
          magicLink: linkData.properties.action_link,
        });
        console.log('✅ Welcome email sent successfully');
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the employee creation if email fails
        console.warn('⚠️  Employee created but welcome email could not be sent');
      }
    }

    revalidatePath('/employees');

    return {
      success: true,
      data: {
        id: employeeData.id,
      },
    };
  } catch (error) {
    console.error('Error in createEmployee:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}

/**
 * Update an existing employee
 */
export async function updateEmployee(
  employeeId: string,
  data: UpdateEmployeeInput
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
    const validation = updateEmployeeSchema.safeParse(data);
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

    // Check permissions (only admin can update employees)
    if (userData.role !== 'admin') {
      return {
        success: false,
        error: 'Seuls les administrateurs peuvent modifier les employés',
      };
    }

    // Get target employee to verify same company
    const { data: targetEmployee, error: targetError } = await supabase
      .from('employees')
      .select('company_id, user_id')
      .eq('id', employeeId)
      .single();

    if (targetError || !targetEmployee) {
      return {
        success: false,
        error: 'Employé non trouvé',
      };
    }

    if (targetEmployee.company_id !== userData.company_id) {
      return {
        success: false,
        error: 'Accès non autorisé',
      };
    }

    // Update user record if user fields are provided
    if (
      validation.data.firstName ||
      validation.data.lastName ||
      validation.data.phone !== undefined
    ) {
      const userUpdateData: Record<string, unknown> = {};
      if (validation.data.firstName) {
        userUpdateData.first_name = validation.data.firstName;
      }
      if (validation.data.lastName) {
        userUpdateData.last_name = validation.data.lastName;
      }
      if (validation.data.phone !== undefined) {
        userUpdateData.phone = validation.data.phone || null;
      }

      if (targetEmployee.user_id) {
        const { error: updateUserError } = await supabaseAdmin
          .from('users')
          .update(userUpdateData)
          .eq('id', targetEmployee.user_id);

        if (updateUserError) {
          console.error('Error updating user:', updateUserError);
          return {
            success: false,
            error: 'Erreur lors de la mise à jour de l\'utilisateur',
          };
        }
      }
    }

    // Update employee record
    const employeeUpdateData: Record<string, unknown> = {};
    if (validation.data.dateOfBirth) {
      employeeUpdateData.date_of_birth = validation.data.dateOfBirth.toISOString().split('T')[0];
    }
    if (validation.data.address) {
      employeeUpdateData.address = validation.data.address;
    }
    if (validation.data.city) {
      employeeUpdateData.city = validation.data.city;
    }
    if (validation.data.postalCode) {
      employeeUpdateData.postal_code = validation.data.postalCode;
    }
    if (validation.data.emergencyContactName !== undefined) {
      employeeUpdateData.emergency_contact_name = validation.data.emergencyContactName || null;
    }
    if (validation.data.emergencyContactPhone !== undefined) {
      employeeUpdateData.emergency_contact_phone = validation.data.emergencyContactPhone || null;
    }
    if (validation.data.hireDate) {
      employeeUpdateData.hire_date = validation.data.hireDate.toISOString().split('T')[0];
    }
    if (validation.data.department !== undefined) {
      employeeUpdateData.department = validation.data.department || null;
    }
    if (validation.data.position !== undefined) {
      employeeUpdateData.position = validation.data.position || null;
    }
    if (validation.data.employeeNumber !== undefined) {
      employeeUpdateData.employee_number = validation.data.employeeNumber || null;
    }
    if (validation.data.managerId !== undefined) {
      employeeUpdateData.manager_id = validation.data.managerId || null;
    }
    if (validation.data.isActive !== undefined) {
      employeeUpdateData.is_active = validation.data.isActive;
    }

    if (Object.keys(employeeUpdateData).length > 0) {
      const { error: updateEmployeeError } = await supabaseAdmin
        .from('employees')
        .update(employeeUpdateData)
        .eq('id', employeeId);

      if (updateEmployeeError) {
        console.error('Error updating employee:', updateEmployeeError);
        return {
          success: false,
          error: 'Erreur lors de la mise à jour de l\'employé',
        };
      }
    }

    revalidatePath('/employees');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error in updateEmployee:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}

/**
 * Delete (deactivate) an employee
 */
export async function deleteEmployee(employeeId: string): Promise<ActionResult> {
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

    // Check permissions (only admin can delete employees)
    if (userData.role !== 'admin') {
      return {
        success: false,
        error: 'Seuls les administrateurs peuvent supprimer des employés',
      };
    }

    // Get target employee to verify same company
    const { data: targetEmployee, error: targetError } = await supabase
      .from('employees')
      .select('company_id, user_id')
      .eq('id', employeeId)
      .single();

    if (targetError || !targetEmployee) {
      return {
        success: false,
        error: 'Employé non trouvé',
      };
    }

    if (targetEmployee.company_id !== userData.company_id) {
      return {
        success: false,
        error: 'Accès non autorisé',
      };
    }

    // Prevent self-deletion
    if (targetEmployee.user_id === user.id) {
      return {
        success: false,
        error: 'Vous ne pouvez pas supprimer votre propre compte',
      };
    }

    // Deactivate employee (soft delete)
    const { error: deactivateError } = await supabaseAdmin
      .from('employees')
      .update({ is_active: false })
      .eq('id', employeeId);

    if (deactivateError) {
      console.error('Error deactivating employee:', deactivateError);
      return {
        success: false,
        error: 'Erreur lors de la désactivation de l\'employé',
      };
    }

    // Also deactivate associated user
    if (targetEmployee.user_id) {
      await supabaseAdmin
        .from('users')
        .update({ is_active: false })
        .eq('id', targetEmployee.user_id);
    }

    revalidatePath('/employees');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error in deleteEmployee:', error);
    return {
      success: false,
      error: 'Une erreur inattendue est survenue',
    };
  }
}
