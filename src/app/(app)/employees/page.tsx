'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Edit,
  LayoutGrid,
  List,
  Mail,
  MoreVertical,
  Phone,
  PlusCircle,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '@/components/ui';
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from '@/lib/actions/employees';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  contractTypes,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from '@/lib/validations/employees';
import { cn } from '@/lib/utils';

type Employee = NonNullable<Awaited<ReturnType<typeof getEmployees>>['data']>[number];

export default function EmployeesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const createForm = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema) as any,
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: new Date(),
      address: '',
      city: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      hireDate: new Date(),
      contractType: 'full_time',
      position: '',
      department: '',
      employeeNumber: '',
      managerId: '',
    },
  });

  const editForm = useForm<UpdateEmployeeInput>({
    resolver: zodResolver(updateEmployeeSchema) as any,
  });

  const loadEmployees = async () => {
    setIsLoading(true);
    const result = await getEmployees();
    if (result.success && result.data) {
      setEmployees(result.data);
    } else if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: result.error,
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleCreateEmployee = async (data: CreateEmployeeInput) => {
    const result = await createEmployee(data);

    if (result.success && result.data) {
      toast({
        title: 'Employé créé',
        description: `Un email avec un lien de connexion a été envoyé à ${data.email}`,
      });

      setCreateDialogOpen(false);
      createForm.reset();

      // Force refresh from server and reload data
      router.refresh();
      await loadEmployees();
    } else if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: result.error,
      });
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    editForm.reset({
      firstName: employee.user?.firstName,
      lastName: employee.user?.lastName,
      phone: employee.user?.phone || undefined,
      position: employee.position || undefined,
      department: employee.department || undefined,
      employeeNumber: employee.employeeNumber || undefined,
      isActive: employee.isActive,
    });
    setEditDialogOpen(true);
  };

  const onSubmitEdit = async (data: UpdateEmployeeInput) => {
    if (!selectedEmployee) return;

    const result = await updateEmployee(selectedEmployee.id, data);

    if (result.success) {
      toast({
        title: 'Employé modifié',
        description: 'Les informations de l\'employé ont été mises à jour',
      });
      setEditDialogOpen(false);
      router.refresh();
      await loadEmployees();
    } else if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: result.error,
      });
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`Voulez-vous vraiment désactiver ${employee.user?.firstName} ${employee.user?.lastName} ?`)) {
      return;
    }

    const result = await deleteEmployee(employee.id);

    if (result.success) {
      toast({
        title: 'Employé désactivé',
        description: 'L\'employé a été désactivé avec succès',
      });
      router.refresh();
      await loadEmployees();
    } else if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: result.error,
      });
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      searchQuery === '' ||
      employee.user?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.user?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.user?.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      departmentFilter === '' ||
      (employee.department &&
        employee.department.toLowerCase().includes(departmentFilter.toLowerCase()));

    const matchesStatus =
      statusFilter === '' || (statusFilter === 'active' ? employee.isActive : !employee.isActive);

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Get unique departments
  const departments = Array.from(
    new Set(employees.map((e) => e.department).filter((d): d is string => Boolean(d)))
  );

  // Stats
  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.isActive).length,
    inactive: employees.filter((e) => !e.isActive).length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-white">Employés</h1>
          <p className="mt-2 text-white/70">Gérez vos employés et leurs informations</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="rounded-2xl bg-[#F2E94E] px-6 py-6 text-[#0A1A2F] transition-all duration-300 hover:bg-[#F2E94E]/90 hover:shadow-lg hover:shadow-[#F2E94E]/20"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Nouvel employé
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Total</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stats.total}</p>
                <p className="mt-1 text-xs text-white/50">Employés</p>
              </div>
              <div className="rounded-full bg-[#F2E94E]/20 p-3">
                <Users className="h-6 w-6 text-[#F2E94E]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Actifs</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stats.active}</p>
                <p className="mt-1 text-xs text-white/50">En poste</p>
              </div>
              <div className="rounded-full bg-green-500/20 p-3">
                <Users className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Inactifs</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stats.inactive}</p>
                <p className="mt-1 text-xs text-white/50">Partis</p>
              </div>
              <div className="rounded-full bg-red-500/20 p-3">
                <Users className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-2xl border-white/20 bg-white/5 pl-10 text-white placeholder:text-white/50"
              />
            </div>

            <Select value={departmentFilter || 'all'} onValueChange={(v) => setDepartmentFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="rounded-2xl border-white/20 bg-white/5 text-white">
                <SelectValue placeholder="Département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les départements</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="rounded-2xl border-white/20 bg-white/5 text-white">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employees List */}
      <Card className="rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white">Liste des employés</CardTitle>
              <CardDescription className="text-white/65">
                {filteredEmployees.length} employé{filteredEmployees.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            {/* View Toggle */}
            <div className="flex items-center gap-1 rounded-2xl bg-white/5 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-xl p-2.5 transition-all duration-300',
                  viewMode === 'list'
                    ? 'bg-white/10 text-white shadow-lg shadow-white/10'
                    : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                )}
                title="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-xl p-2.5 transition-all duration-300',
                  viewMode === 'grid'
                    ? 'bg-white/10 text-white shadow-lg shadow-white/10'
                    : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                )}
                title="Vue grille"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/50">Chargement...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-4 h-12 w-12 text-white/30" />
              <p className="text-sm text-white/50">
                {employees.length === 0
                  ? 'Aucun employé pour le moment'
                  : 'Aucun employé ne correspond à votre recherche'}
              </p>
            </div>
          ) : viewMode === 'list' ? (
            /* List View - Enhanced with premium hover effects */
            <div className="space-y-3">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:scale-[1.01] hover:border-white/20 hover:bg-white/10 hover:shadow-lg hover:shadow-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F2E94E]/20 text-lg font-semibold text-[#F2E94E] transition-all duration-300 group-hover:bg-[#F2E94E]/30 group-hover:shadow-lg group-hover:shadow-[#F2E94E]/20">
                      {employee.user?.firstName[0]}
                      {employee.user?.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {employee.user?.firstName} {employee.user?.lastName}
                      </p>
                      <p className="text-sm text-white/60">{employee.user?.email}</p>
                      {employee.position && (
                        <p className="text-xs text-white/50">{employee.position}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {employee.department && (
                      <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
                        {employee.department}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        employee.isActive
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {employee.isActive ? 'Actif' : 'Inactif'}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-xl p-0 text-white/70 hover:bg-white/10 hover:text-white"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleEditEmployee(employee)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteEmployee(employee)}
                          className="cursor-pointer text-red-400 focus:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Désactiver
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid View - Premium card design */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/8 hover:shadow-2xl hover:shadow-white/10"
                >
                  {/* Actions Dropdown - Top Right */}
                  <div className="absolute right-4 top-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 rounded-xl p-0 text-white/50 opacity-0 transition-all duration-300 hover:bg-white/10 hover:text-white group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleEditEmployee(employee)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteEmployee(employee)}
                          className="cursor-pointer text-red-400 focus:text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Désactiver
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Avatar & Name */}
                  <div className="mb-4 flex flex-col items-center text-center">
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2E94E]/20 text-2xl font-bold text-[#F2E94E] shadow-lg shadow-[#F2E94E]/10 transition-all duration-300 group-hover:bg-[#F2E94E]/30 group-hover:shadow-2xl group-hover:shadow-[#F2E94E]/20">
                      {employee.user?.firstName[0]}
                      {employee.user?.lastName[0]}
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {employee.user?.firstName} {employee.user?.lastName}
                    </h3>
                    {employee.position && (
                      <p className="mt-1 text-sm text-white/60">{employee.position}</p>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Mail className="h-4 w-4 text-white/50" />
                      <span className="truncate">{employee.user?.email}</span>
                    </div>
                    {employee.user?.phone && (
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Phone className="h-4 w-4 text-white/50" />
                        <span>{employee.user.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {employee.department && (
                      <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
                        {employee.department}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        employee.isActive
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {employee.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Employee Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[32px] border-white/20 bg-[#0A1A2F] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-white">Nouvel employé</DialogTitle>
            <DialogDescription className="text-white/70">
              Créer un nouvel employé avec compte utilisateur
            </DialogDescription>
          </DialogHeader>

          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateEmployee)} className="space-y-6">
              {/* User Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white">Informations utilisateur</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={createForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Prénom</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="rounded-2xl border-white/20 bg-white/5 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Nom</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="rounded-2xl border-white/20 bg-white/5 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="rounded-2xl border-white/20 bg-white/5 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Téléphone (optionnel)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-2xl border-white/20 bg-white/5 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white">Informations personnelles</h3>

                <FormField
                  control={createForm.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Date de naissance</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          className="rounded-2xl border-white/20 bg-white/5 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Adresse</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-2xl border-white/20 bg-white/5 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={createForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Ville</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="rounded-2xl border-white/20 bg-white/5 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Code postal</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="rounded-2xl border-white/20 bg-white/5 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white">Informations professionnelles</h3>

                <FormField
                  control={createForm.control}
                  name="hireDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Date d&apos;embauche</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          className="rounded-2xl border-white/20 bg-white/5 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Type de contrat</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-2xl border-white/20 bg-white/5 text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contractTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type === 'full_time'
                                ? 'Temps plein'
                                : type === 'part_time'
                                  ? 'Temps partiel'
                                  : type === 'temporary'
                                    ? 'Temporaire'
                                    : type === 'intern'
                                      ? 'Stage'
                                      : 'Freelance'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={createForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Poste (optionnel)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="rounded-2xl border-white/20 bg-white/5 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Département (optionnel)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="rounded-2xl border-white/20 bg-white/5 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="employeeNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Numéro employé (optionnel)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-2xl border-white/20 bg-white/5 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white">Contact d&apos;urgence (optionnel)</h3>

                <FormField
                  control={createForm.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nom</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-2xl border-white/20 bg-white/5 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Téléphone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-2xl border-white/20 bg-white/5 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCreateDialogOpen(false)}
                  className="rounded-2xl text-white hover:bg-white/10"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={createForm.formState.isSubmitting}
                  className="rounded-2xl bg-[#F2E94E] text-[#0A1A2F] hover:bg-[#F2E94E]/90"
                >
                  {createForm.formState.isSubmitting ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[32px] border-white/20 bg-[#0A1A2F] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier l&apos;employé</DialogTitle>
            <DialogDescription className="text-white/70">
              Modifiez les informations de {selectedEmployee?.user?.firstName} {selectedEmployee?.user?.lastName}
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={editForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Prénom</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-2xl border-white/20 bg-white/5 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nom</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-2xl border-white/20 bg-white/5 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="rounded-2xl border-white/20 bg-white/5 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={editForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Poste</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-2xl border-white/20 bg-white/5 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Département</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-2xl border-white/20 bg-white/5 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="employeeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Numéro employé</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="rounded-2xl border-white/20 bg-white/5 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditDialogOpen(false)}
                  className="rounded-2xl text-white hover:bg-white/10"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={editForm.formState.isSubmitting}
                  className="rounded-2xl bg-[#F2E94E] text-[#0A1A2F] hover:bg-[#F2E94E]/90"
                >
                  {editForm.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
