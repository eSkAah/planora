import { NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  employeeListQuerySchema,
  type EmployeeListQueryInput,
} from '@/lib/validations';

function buildFilters(params: URLSearchParams): EmployeeListQueryInput {
  const parsed = employeeListQuerySchema.safeParse({
    search: params.get('search') ?? undefined,
    department: params.get('department') ?? undefined,
    status: params.get('status') ?? undefined,
    page: params.get('page') ?? undefined,
    limit: params.get('limit') ?? undefined,
  });

  if (!parsed.success) {
    throw parsed.error;
  }

  return parsed.data;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filters = buildFilters(url.searchParams);

    const supabase = await createServerSupabaseClient();

    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;

    let query = supabase
      .from('employees')
      .select(
        `id, employee_number, is_active, hire_date, department, position,
         user:user_id(first_name,last_name,email,phone)`,
        { count: 'exact' }
      )
      .order('hire_date', { ascending: false })
      .range(from, to);

    if (filters.department) {
      query = query.eq('department', filters.department);
    }

    if (filters.status) {
      query = query.eq('is_active', filters.status === 'active');
    }

    if (filters.search) {
      const search = filters.search.trim();
      query = query.or(
        `user.email.ilike.%${search}%` +
          `,user.first_name.ilike.%${search}%` +
          `,user.last_name.ilike.%${search}%` +
          `,employee_number.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      employees: data ?? [],
      total: count ?? 0,
      page: filters.page,
      limit: filters.limit,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Unable to fetch employees' },
      { status: 500 }
    );
  }
}
