'use client';

import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Upload,
  UserX,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useEmployees } from '@/hooks/use-employees';
import type { UseEmployeesOptions } from '@/hooks/use-employees';

const PAGE_LIMIT = 10;

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const employeeQueryOptions = useMemo(() => {
    const options: UseEmployeesOptions = {
      page,
      limit: PAGE_LIMIT,
    };

    const trimmedSearch = search.trim();
    if (trimmedSearch.length > 0) {
      options.search = trimmedSearch;
    }

    if (departmentFilter) {
      options.department = departmentFilter;
    }

    if (statusFilter === 'active') {
      options.isActive = true;
    } else if (statusFilter === 'inactive') {
      options.isActive = false;
    }

    return options;
  }, [search, departmentFilter, statusFilter, page]);

  const { employees, loading, error, total } =
    useEmployees(employeeQueryOptions);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const departments = useMemo(() => {
    const unique = new Set<string>();
    employees.forEach(employee => {
      if (employee.department) {
        unique.add(employee.department);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [employees]);

  const activeCount = useMemo(
    () => employees.filter(employee => employee.isActive).length,
    [employees]
  );

  const formatDate = (date: Date | null) => {
    if (!date) {
      return '—';
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const initials = `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`;
    return initials ? initials.toUpperCase() : 'E';
  };

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center'>
          <UserX className='mx-auto mb-4 h-12 w-12 text-red-500' />
          <h2 className='mb-2 text-lg font-semibold text-gray-900 dark:text-white'>
            Erreur de chargement
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto space-y-6 px-4 py-8'>
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold text-gray-900 dark:text-white'>
            <Users className='h-8 w-8 text-blue-600' />
            Employés
          </h1>
          <p className='mt-1 text-gray-600 dark:text-gray-400'>
            Gérez vos équipes et leurs informations
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' size='sm'>
            <Download className='mr-2 h-4 w-4' />
            Exporter
          </Button>
          <Button variant='outline' size='sm'>
            <Upload className='mr-2 h-4 w-4' />
            Importer
          </Button>
          <Link href='/employees/new'>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Nouvel employé
            </Button>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Total employés
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {loading ? '...' : total}
                </p>
              </div>
              <Users className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Actifs
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {loading ? '...' : activeCount}
                </p>
              </div>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Départements
                </p>
                <p className='text-2xl font-bold text-purple-600'>
                  {loading ? '...' : departments.length || '—'}
                </p>
              </div>
              <Calendar className='h-8 w-8 text-purple-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Heures/sem. moy.
                </p>
                <p className='text-2xl font-bold text-orange-600'>—</p>
              </div>
              <Clock className='h-8 w-8 text-orange-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des employés</CardTitle>
          <CardDescription>
            Filtrez et visualisez les membres de votre organisation.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
            <div className='relative flex-1'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Rechercher un employé…'
                value={search}
                onChange={event => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className='pl-9'
              />
            </div>

            <div className='flex flex-wrap gap-2'>
              <Select
                value={departmentFilter}
                onValueChange={value => {
                  setDepartmentFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Département' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>Tous</SelectItem>
                  {departments.map(department => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={value => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder='Statut' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>Tous</SelectItem>
                  <SelectItem value='active'>Actifs</SelectItem>
                  <SelectItem value='inactive'>Inactifs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-4'>
            {loading
              ? 'Chargement…'
              : employees.map(employee => (
                  <Card key={employee.id} className='border-border/60'>
                    <CardContent className='flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between'>
                      <div className='flex items-center gap-4'>
                        <Avatar className='h-12 w-12'>
                          <AvatarFallback>
                            {getInitials(
                              employee.user?.firstName,
                              employee.user?.lastName
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                            {employee.user?.firstName} {employee.user?.lastName}
                          </h3>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            {employee.position || 'Poste non renseigné'}
                          </p>
                          <div className='mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
                            <span className='inline-flex items-center gap-1'>
                              <Mail className='h-3.5 w-3.5' />
                              {employee.user?.email}
                            </span>
                            {employee.user?.phone ? (
                              <span className='inline-flex items-center gap-1'>
                                <Phone className='h-3.5 w-3.5' />
                                {employee.user.phone}
                              </span>
                            ) : null}
                            <span className='inline-flex items-center gap-1'>
                              <Calendar className='h-3.5 w-3.5' />
                              Embauché le {formatDate(employee.hireDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        {employee.isActive ? (
                          <span className='text-xs font-medium tracking-wide text-green-600 uppercase'>
                            Actif
                          </span>
                        ) : (
                          <span className='text-xs font-medium tracking-wide text-red-500 uppercase'>
                            Inactif
                          </span>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='outline' size='icon'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem className='gap-2'>
                              <Eye className='h-4 w-4' />
                              Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem className='gap-2'>
                              <Edit className='h-4 w-4' />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='gap-2 text-red-600'>
                              <UserX className='h-4 w-4' />
                              Désactiver
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}

            {!loading && employees.length === 0 && (
              <div className='rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400'>
                Aucun employé ne correspond à votre recherche.
              </div>
            )}
          </div>

          <div className='flex items-center justify-between text-sm text-gray-600 dark:text-gray-400'>
            <span>
              Page {page} sur {totalPages}
            </span>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={page === 1 || loading}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              >
                Précédent
              </Button>
              <Button
                variant='outline'
                size='sm'
                disabled={page === totalPages || loading}
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              >
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
