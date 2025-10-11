'use client';

import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Edit,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';

import ShiftModal from '@/components/planning/ShiftModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Card,
  CardContent,
  useToast,
} from '@/components/ui';
import {
  createShift,
  deleteShift,
  getLeaveRequests,
  getShifts,
  updateShift,
} from '@/lib/actions';
import { getUsers } from '@/lib/actions/users';
import type { CreateShiftInput } from '@/lib/validations';

// Types
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface Shift {
  id: string;
  employee_id: string;
  shift_date: string; // YYYY-MM-DD format
  start_time: string;
  end_time: string;
  shift_type: 'morning' | 'afternoon' | 'evening' | 'night' | 'custom';
  hours_worked: number;
  break_duration: number;
  notes: string | null;
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  status: string;
  start_date: string;
  end_date: string;
  days_count: number;
}

// Shift colors
const SHIFT_COLORS = {
  morning: 'bg-amber-500/20 border-amber-500/50 text-amber-200',
  afternoon: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
  evening: 'bg-purple-500/20 border-purple-500/50 text-purple-200',
  night: 'bg-slate-500/20 border-slate-500/50 text-slate-200',
  custom: 'bg-green-500/20 border-green-500/50 text-green-200',
};

const SHIFT_LABELS = {
  morning: 'Matin',
  afternoon: 'AM',
  evening: 'Soir',
  night: 'Nuit',
  custom: 'Custom',
};

// Leave colors and labels
const LEAVE_TYPE_COLORS: Record<string, string> = {
  vacation: 'bg-teal-500/20 border-teal-500/50 text-teal-200',
  sick: 'bg-red-500/20 border-red-500/50 text-red-200',
  rtt: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200',
  unpaid: 'bg-gray-500/20 border-gray-500/50 text-gray-200',
  parental: 'bg-pink-500/20 border-pink-500/50 text-pink-200',
  other: 'bg-orange-500/20 border-orange-500/50 text-orange-200',
};

const LEAVE_TYPE_LABELS: Record<string, string> = {
  vacation: 'Congés',
  sick: 'Maladie',
  rtt: 'RTT',
  unpaid: 'Sans solde',
  parental: 'Parental',
  other: 'Autre',
};

export default function PlanningPage() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [modalDefaultValues, setModalDefaultValues] = useState<
    Partial<CreateShiftInput>
  >({});

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);

  // Load employees and shifts
  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    setIsLoading(true);

    // Load employees
    const employeesResult = await getUsers();
    if (employeesResult.success && employeesResult.data) {
      const activeEmployees = employeesResult.data
        .filter((u) => u.isActive)
        .map((u) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          isActive: u.isActive,
        }));

      setEmployees(activeEmployees);
    }

    // Load shifts for current month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const shiftsResult = await getShifts({ startDate, endDate });
    if (shiftsResult.success && shiftsResult.data) {
      setShifts(shiftsResult.data);
    } else if (shiftsResult.error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: shiftsResult.error,
      });
    }

    // Load approved leaves for current month
    const leavesResult = await getLeaveRequests({
      startDate,
      endDate,
      status: 'approved',
    });
    if (leavesResult.success && leavesResult.data) {
      setLeaves(leavesResult.data);
    }

    setIsLoading(false);
  };

  // Modal handlers
  const handleOpenCreateModal = (employeeId?: string, date?: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const shiftDate = date
      ? `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
      : new Date().toISOString().split('T')[0];

    setModalMode('create');
    setModalDefaultValues({
      employeeId: employeeId || '',
      shiftDate,
      startTime: '09:00',
      endTime: '17:00',
      shiftType: 'morning',
      breakDuration: 0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (shift: Shift) => {
    setModalMode('edit');
    setEditingShift(shift);
    setModalDefaultValues({
      employeeId: shift.employee_id,
      shiftDate: shift.shift_date,
      startTime: shift.start_time.slice(0, 5),
      endTime: shift.end_time.slice(0, 5),
      shiftType: shift.shift_type,
      breakDuration: shift.break_duration,
      notes: shift.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: CreateShiftInput) => {
    startTransition(async () => {
      let result;

      if (modalMode === 'create') {
        result = await createShift(data);
      } else if (editingShift) {
        result = await updateShift(editingShift.id, {
          shiftDate: data.shiftDate,
          startTime: data.startTime,
          endTime: data.endTime,
          shiftType: data.shiftType,
          breakDuration: data.breakDuration,
          notes: data.notes,
        });
      }

      if (result?.success) {
        toast({
          title: 'Succès',
          description:
            modalMode === 'create'
              ? 'Le shift a été créé avec succès'
              : 'Le shift a été modifié avec succès',
        });
        setIsModalOpen(false);
        setEditingShift(null);
        loadData();
      } else if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: result.error,
        });
      }
    });
  };

  const handleDeleteShift = (shiftId: string) => {
    setShiftToDelete(shiftId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!shiftToDelete) return;

    startTransition(async () => {
      const result = await deleteShift(shiftToDelete);

      if (result.success) {
        toast({
          title: 'Succès',
          description: 'Le shift a été supprimé',
        });
        setDeleteDialogOpen(false);
        setShiftToDelete(null);
        loadData();
      } else if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: result.error,
        });
      }
    });
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    return { daysInMonth, year, month };
  };

  const { daysInMonth, year, month } = getDaysInMonth(currentDate);

  // Generate array of days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format date
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  };

  // Get day name
  const getDayName = (day: number) => {
    const date = new Date(year, month, day);
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  };

  // Check if day is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  // Check if day is weekend
  const isWeekend = (day: number) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  // Get shifts for employee and day
  const getShiftsForEmployeeAndDay = (employeeId: string, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return shifts.filter(
      (shift) => shift.employee_id === employeeId && shift.shift_date === dateStr
    );
  };

  // Check if employee has a leave on a specific day
  const getLeaveForEmployeeAndDay = (employeeId: string, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return leaves.find(
      (leave) =>
        leave.employee_id === employeeId &&
        leave.start_date <= dateStr &&
        leave.end_date >= dateStr
    );
  };

  // Calculate stats
  const totalHours = shifts.reduce((sum, shift) => sum + shift.hours_worked, 0);
  const totalEmployees = employees.length;
  const avgHoursPerEmployee =
    totalEmployees > 0 ? totalHours / totalEmployees : 0;

  // Get initials
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="text-white/70">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-white">Planning</h1>
          <p className="mt-2 text-white/70">
            Gérez les horaires de votre équipe en temps réel
          </p>
        </div>
        <Button
          onClick={() => handleOpenCreateModal()}
          className="rounded-2xl bg-[#F2E94E] px-6 py-6 text-[#0A1A2F] transition-all duration-300 hover:bg-[#f6f07a] hover:shadow-lg hover:shadow-[#F2E94E]/20"
        >
          <Plus className="mr-2 h-5 w-5" />
          Ajouter un shift
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="group rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Employés actifs</p>
                <p className="text-3xl font-semibold text-white">
                  {totalEmployees}
                </p>
              </div>
              <Users className="h-8 w-8 text-[#F2E94E]" />
            </div>
          </CardContent>
        </Card>

        <Card className="group rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Heures planifiées</p>
                <p className="text-3xl font-semibold text-white">
                  {totalHours.toFixed(0)}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="group rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Moy. par employé</p>
                <p className="text-3xl font-semibold text-white">
                  {avgHoursPerEmployee.toFixed(0)}h
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="group rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Coût estimé</p>
                <p className="text-3xl font-semibold text-white">
                  {(totalHours * 15).toFixed(0)}€
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Navigation */}
      <Card className="group rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={goToPreviousMonth}
              variant="ghost"
              className="rounded-2xl text-white transition-all duration-300 hover:scale-105 hover:bg-white/10"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Précédent
            </Button>

            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold capitalize text-white">
                {formatMonth(currentDate)}
              </h2>
              <Button
                onClick={goToToday}
                variant="outline"
                size="sm"
                className="rounded-xl border-white/20 bg-white/5 text-white/70 transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:text-white"
              >
                Aujourd&apos;hui
              </Button>
            </div>

            <Button
              onClick={goToNextMonth}
              variant="ghost"
              className="rounded-2xl text-white transition-all duration-300 hover:scale-105 hover:bg-white/10"
            >
              Suivant
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Calendar - Timeline View */}
      <Card className="group rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            {/* Header with days */}
            <div className="mb-4 flex gap-2">
              {/* Employee names column header */}
              <div className="w-48 flex-shrink-0" />

              {/* Days columns */}
              {days.map((day) => (
                <div
                  key={day}
                  className={`flex w-32 flex-shrink-0 flex-col items-center rounded-2xl border p-2 transition-all duration-300 ${
                    isToday(day)
                      ? 'border-[#F2E94E]/40 bg-[#F2E94E]/10'
                      : isWeekend(day)
                        ? 'border-white/5 bg-white/5'
                        : 'border-white/10 bg-white/5'
                  }`}
                >
                  <span className="text-xs font-medium uppercase text-white/50">
                    {getDayName(day)}
                  </span>
                  <span
                    className={`text-lg font-semibold ${
                      isToday(day) ? 'text-[#F2E94E]' : 'text-white'
                    }`}
                  >
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* Employees rows */}
            <div className="space-y-2">
              {employees.map((employee) => (
                <motion.div
                  key={employee.id}
                  className="flex gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Employee info */}
                  <div className="flex w-48 flex-shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:border-white/20 hover:bg-white/10">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F2E94E] text-xs font-semibold text-[#0A1A2F]">
                      {getInitials(employee.firstName, employee.lastName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="truncate text-xs text-white/50">
                        {employee.role}
                      </p>
                    </div>
                  </div>

                  {/* Days cells */}
                  {days.map((day) => {
                    const dayShifts = getShiftsForEmployeeAndDay(
                      employee.id,
                      day
                    );
                    const dayLeave = getLeaveForEmployeeAndDay(employee.id, day);

                    return (
                      <div
                        key={day}
                        className={`flex w-32 flex-shrink-0 flex-col gap-1 rounded-2xl border p-2 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-lg hover:shadow-white/5 ${
                          isWeekend(day)
                            ? 'border-white/5 bg-white/5'
                            : 'border-white/10 bg-white/5'
                        }`}
                      >
                        {/* Show leave if exists */}
                        {dayLeave && (
                          <motion.div
                            className={`rounded-xl border p-2 text-xs ${LEAVE_TYPE_COLORS[dayLeave.leave_type] || LEAVE_TYPE_COLORS.other}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <div className="flex items-center gap-1 font-semibold">
                              <CalendarIcon className="h-3 w-3" />
                              {LEAVE_TYPE_LABELS[dayLeave.leave_type] || 'Congé'}
                            </div>
                          </motion.div>
                        )}

                        {/* Show shifts */}
                        {dayShifts.length > 0 ? (
                          dayShifts.map((shift) => (
                            <motion.div
                              key={shift.id}
                              className={`group/shift relative cursor-pointer rounded-xl border p-2 text-xs transition-all duration-300 hover:scale-105 hover:shadow-md ${SHIFT_COLORS[shift.shift_type]}`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <div className="font-semibold">
                                {SHIFT_LABELS[shift.shift_type]}
                              </div>
                              <div className="mt-1 text-[10px] opacity-80">
                                {shift.start_time.slice(0, 5)} -{' '}
                                {shift.end_time.slice(0, 5)}
                              </div>
                              <div className="mt-1 text-[10px] font-medium opacity-90">
                                {shift.hours_worked}h
                              </div>

                              {/* Action buttons on hover */}
                              <div className="absolute right-1 top-1 hidden gap-1 group-hover/shift:flex">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditModal(shift);
                                  }}
                                  className="rounded bg-white/20 p-1 backdrop-blur-sm transition-colors hover:bg-white/30"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteShift(shift.id);
                                  }}
                                  className="rounded bg-white/20 p-1 backdrop-blur-sm transition-colors hover:bg-red-500/50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </motion.div>
                          ))
                        ) : !dayLeave ? (
                          <button
                            onClick={() => handleOpenCreateModal(employee.id, day)}
                            className="group/cell h-full min-h-[60px] rounded-xl border border-dashed border-white/10 bg-white/0 text-xs text-white/20 transition-all duration-300 hover:border-white/30 hover:bg-white/5 hover:text-white/40"
                          >
                            <Plus className="mx-auto h-4 w-4 opacity-0 transition-opacity group-hover/cell:opacity-100" />
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </motion.div>
              ))}
            </div>

            {employees.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-white/50">
                  Aucun employé actif. Ajoutez des employés dans la section
                  Équipe.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shift Modal */}
      <ShiftModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        employees={employees}
        onSubmit={handleModalSubmit}
        isSubmitting={isPending}
        defaultValues={modalDefaultValues}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[32px] border border-white/15 bg-[#0A1A2F]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Supprimer ce shift ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/65">
              Cette action est irréversible. Le shift sera définitivement
              supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl text-white/70">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPending}
              className="rounded-2xl bg-red-600 text-white hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
