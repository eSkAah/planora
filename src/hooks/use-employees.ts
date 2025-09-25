'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export interface EmployeeUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
}

export interface Employee {
  id: string;
  employeeNumber: string | null;
  hireDate: Date | null;
  department: string | null;
  position: string | null;
  isActive: boolean;
  user: EmployeeUser | null;
}

export interface UseEmployeesOptions {
  search?: string;
  department?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UseEmployeesResult {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  refetch: () => Promise<void>;
}

interface ApiEmployee {
  id: string;
  employee_number: string | null;
  hire_date: string | null;
  department: string | null;
  position: string | null;
  is_active: boolean | null;
  user: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

interface ApiResponse {
  employees: ApiEmployee[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

const DEFAULT_LIMIT = 10;

function buildQueryParams(options: UseEmployeesOptions): string {
  const params = new URLSearchParams();

  if (options.search) {
    params.set('search', options.search);
  }
  if (options.department) {
    params.set('department', options.department);
  }
  if (typeof options.isActive === 'boolean') {
    params.set('status', options.isActive ? 'active' : 'inactive');
  }
  params.set('page', String(options.page ?? 1));
  params.set('limit', String(options.limit ?? DEFAULT_LIMIT));

  return params.toString();
}

function transformEmployee(apiEmployee: ApiEmployee): Employee {
  return {
    id: apiEmployee.id,
    employeeNumber: apiEmployee.employee_number,
    hireDate: apiEmployee.hire_date ? new Date(apiEmployee.hire_date) : null,
    department: apiEmployee.department,
    position: apiEmployee.position,
    isActive: apiEmployee.is_active ?? false,
    user: apiEmployee.user
      ? {
          firstName: apiEmployee.user.first_name ?? '',
          lastName: apiEmployee.user.last_name ?? '',
          email: apiEmployee.user.email ?? '',
          phone: apiEmployee.user.phone,
        }
      : null,
  };
}

export function useEmployees(
  options: UseEmployeesOptions = {}
): UseEmployeesResult {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(options.page ?? 1);
  const [limit, setLimit] = useState(options.limit ?? DEFAULT_LIMIT);

  const stableOptions = useMemo(() => {
    const normalized: UseEmployeesOptions = {
      page: options.page ?? 1,
      limit: options.limit ?? DEFAULT_LIMIT,
    };

    if (typeof options.isActive === 'boolean') {
      normalized.isActive = options.isActive;
    }

    if (options.search && options.search.trim()) {
      normalized.search = options.search.trim();
    }

    if (options.department && options.department.trim()) {
      normalized.department = options.department.trim();
    }

    return normalized;
  }, [
    options.search,
    options.department,
    options.isActive,
    options.page,
    options.limit,
  ]);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = buildQueryParams(stableOptions);
      const response = await fetch(`/api/employees?${query}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const body = (await response.json()) as ApiResponse;
        throw new Error(body.error || 'Impossible de récupérer les employés.');
      }

      const body = (await response.json()) as ApiResponse;
      setEmployees(body.employees.map(transformEmployee));
      setTotal(body.total);
      setPage(body.page);
      setLimit(body.limit);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      setEmployees([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [stableOptions]);

  useEffect(() => {
    void fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    total,
    page,
    limit,
    refetch: fetchEmployees,
  };
}
