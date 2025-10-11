'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  UserCheck,
  Plus,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge, Button, Card, CardContent } from '@/components/ui';
import { getShifts } from '@/lib/actions';
import { getUsers } from '@/lib/actions/users';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Shift {
  id: string;
  employee_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  hours_worked: number;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [todayShifts, setTodayShifts] = useState<Shift[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeToday: 0,
    hoursThisWeek: 0,
    totalCost: 0,
    shiftsToday: 0,
    shiftsThisWeek: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);

    const employeesResult = await getUsers();
    if (employeesResult.success && employeesResult.data) {
      const active = employeesResult.data.filter((u) => u.isActive).map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
      }));
      setEmployees(active);
    }

    const today = new Date().toISOString().split('T')[0];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    const weekStart = startOfWeek.toISOString().split('T')[0];
    const weekEnd = new Date(startOfWeek);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const todayResult = await getShifts({ startDate: today, endDate: today });
    if (todayResult.success && todayResult.data) {
      setTodayShifts(todayResult.data);
    }

    const weekResult = await getShifts({ startDate: weekStart, endDate: weekEndStr });
    if (weekResult.success && weekResult.data) {
      const hoursThisWeek = weekResult.data.reduce((sum, s) => sum + s.hours_worked, 0);
      const uniqueToday = new Set(todayResult.data?.map((s) => s.employee_id) || []).size;

      setStats({
        totalEmployees: employeesResult.data?.filter((u) => u.isActive).length || 0,
        activeToday: uniqueToday,
        hoursThisWeek,
        totalCost: hoursThisWeek * 15,
        shiftsToday: todayResult.data?.length || 0,
        shiftsThisWeek: weekResult.data.length,
      });
    }

    setIsLoading(false);
  };

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Employé';
  };

  const isShiftActive = (shift: Shift) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];
    return shift.shift_date === today && time >= shift.start_time.slice(0, 5) && time <= shift.end_time.slice(0, 5);
  };

  if (isLoading) {
    return <div className="flex min-h-[600px] items-center justify-center"><div className="text-white/70">Chargement...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-white">Dashboard</h1>
          <p className="mt-2 text-white/70">Vue d&apos;ensemble de votre activité</p>
        </div>
        <Link href="/planning">
          <Button className="rounded-2xl bg-[#F2E94E] px-6 py-6 text-[#0A1A2F] transition-all duration-300 hover:bg-[#f6f07a] hover:shadow-lg hover:shadow-[#F2E94E]/20">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Voir le planning
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="group rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Employés actifs</p>
                  <p className="text-3xl font-semibold text-white">{stats.totalEmployees}</p>
                  <p className="mt-1 text-xs text-white/50">{stats.activeToday} en service</p>
                </div>
                <Users className="h-8 w-8 text-[#F2E94E]" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="group rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Shifts aujourd&apos;hui</p>
                  <p className="text-3xl font-semibold text-white">{stats.shiftsToday}</p>
                  <p className="mt-1 text-xs text-white/50">{stats.shiftsThisWeek} cette semaine</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card className="group rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Heures semaine</p>
                  <p className="text-3xl font-semibold text-white">{stats.hoursThisWeek.toFixed(0)}h</p>
                  <p className="mt-1 text-xs text-green-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />+12% vs dernière
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
          <Card className="group rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Coût semaine</p>
                  <p className="text-3xl font-semibold text-white">{stats.totalCost.toFixed(0)}€</p>
                  <p className="mt-1 text-xs text-white/50">~{(stats.totalCost / 5).toFixed(0)}€/jour</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }} className="lg:col-span-2">
          <Card className="group rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Shifts aujourd&apos;hui</h2>
                  <p className="mt-1 text-sm text-white/60">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <Link href="/planning">
                  <Button variant="ghost" size="sm" className="rounded-xl text-white/70 hover:bg-white/10 hover:text-white">
                    Voir tout<ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {todayShifts.length > 0 ? todayShifts.map((shift) => {
                  const emp = employees.find((e) => e.id === shift.employee_id);
                  const active = isShiftActive(shift);
                  return (
                    <div key={shift.id} className={`flex items-center justify-between rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-white/5 ${active ? 'border-[#F2E94E]/40 bg-[#F2E94E]/10' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}`}>
                      <div className="flex items-center gap-4">
                        {emp && <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#F2E94E] text-sm font-semibold text-[#0A1A2F]">{getInitials(emp.firstName, emp.lastName)}</div>}
                        <div>
                          <p className="font-medium text-white">{getEmployeeName(shift.employee_id)}</p>
                          <p className="text-sm text-white/60">{shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)} • {shift.hours_worked}h</p>
                        </div>
                      </div>
                      {active && <Badge className="bg-[#F2E94E]/20 text-[#F2E94E] border-[#F2E94E]/40"><UserCheck className="mr-1 h-3 w-3" />En service</Badge>}
                    </div>
                  );
                }) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-12 text-center">
                    <CalendarIcon className="mx-auto h-12 w-12 text-white/20" />
                    <p className="mt-4 text-sm text-white/50">Aucun shift aujourd&apos;hui</p>
                    <Link href="/planning"><Button variant="ghost" size="sm" className="mt-4 rounded-xl text-white/70 hover:bg-white/10"><Plus className="mr-2 h-4 w-4" />Ajouter un shift</Button></Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.5 }} className="space-y-6">
          <Card className="group rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Actions rapides</h2>
              <div className="space-y-3">
                <Link href="/planning">
                  <button className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2E94E]/20"><Plus className="h-5 w-5 text-[#F2E94E]" /></div>
                    <div><p className="font-medium text-white">Créer un shift</p><p className="text-xs text-white/50">Ajouter un nouveau shift</p></div>
                  </button>
                </Link>
                <Link href="/settings/team">
                  <button className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20"><Users className="h-5 w-5 text-blue-400" /></div>
                    <div><p className="font-medium text-white">Gérer l&apos;équipe</p><p className="text-xs text-white/50">Ajouter des employés</p></div>
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="group rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Notifications</h2>
              <div className="space-y-3">
                {stats.shiftsToday === 0 && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400" />
                    <div><p className="text-sm font-medium text-white">Aucun shift aujourd&apos;hui</p><p className="mt-1 text-xs text-white/60">Pensez à planifier des shifts</p></div>
                  </div>
                )}
                {stats.totalEmployees === 0 && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                    <div><p className="text-sm font-medium text-white">Aucun employé actif</p><p className="mt-1 text-xs text-white/60">Ajoutez des employés</p></div>
                  </div>
                )}
                {stats.shiftsToday > 0 && stats.totalEmployees > 0 && (
                  <div className="flex items-start gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
                    <UserCheck className="h-5 w-5 flex-shrink-0 text-green-400" />
                    <div><p className="text-sm font-medium text-white">Tout est en ordre</p><p className="mt-1 text-xs text-white/60">{stats.activeToday} employé(s) en service</p></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
