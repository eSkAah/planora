'use client';

import { motion } from 'framer-motion';
import {
  Calendar,
  Check,
  Clock,
  Filter,
  Plus,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui';
import LeaveRequestModal from '@/components/leaves/LeaveRequestModal';
import {
  getLeaveRequests,
  deleteLeaveRequest,
  updateLeaveStatus,
} from '@/lib/actions';
import { getUsers } from '@/lib/actions/users';
import type { LeaveStatus, LeaveType } from '@/lib/validations';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: LeaveType;
  status: LeaveStatus;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  reviewer: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  vacation: 'Congés payés',
  sick: 'Maladie',
  rtt: 'RTT',
  unpaid: 'Sans solde',
  parental: 'Parental',
  other: 'Autre',
};

const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  vacation: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
  sick: 'bg-red-500/20 border-red-500/50 text-red-200',
  rtt: 'bg-green-500/20 border-green-500/50 text-green-200',
  unpaid: 'bg-gray-500/20 border-gray-500/50 text-gray-200',
  parental: 'bg-purple-500/20 border-purple-500/50 text-purple-200',
  other: 'bg-amber-500/20 border-amber-500/50 text-amber-200',
};

const STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  cancelled: 'Annulé',
};

const STATUS_COLORS: Record<LeaveStatus, string> = {
  pending: 'bg-amber-500/20 border-amber-500/50 text-amber-200',
  approved: 'bg-green-500/20 border-green-500/50 text-green-200',
  rejected: 'bg-red-500/20 border-red-500/50 text-red-200',
  cancelled: 'bg-gray-500/20 border-gray-500/50 text-gray-200',
};

export default function LeavesPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<LeaveType | 'all'>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [approveConfirmId, setApproveConfirmId] = useState<string | null>(null);
  const [rejectConfirmId, setRejectConfirmId] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leaveRequests, statusFilter, typeFilter, employeeFilter]);

  const loadData = async () => {
    setIsLoading(true);

    // Load employees
    const employeesResult = await getUsers();
    if (employeesResult.success && employeesResult.data) {
      const active = employeesResult.data
        .filter((u) => u.isActive)
        .map((u) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
        }));
      setEmployees(active);
    }

    // Load leave requests
    const leavesResult = await getLeaveRequests();
    if (leavesResult.success && leavesResult.data) {
      setLeaveRequests(leavesResult.data);
      calculateStats(leavesResult.data);
    } else if (leavesResult.error) {
      toast({
        title: 'Erreur',
        description: leavesResult.error,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  const calculateStats = (requests: LeaveRequest[]) => {
    setStats({
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    });
  };

  const applyFilters = () => {
    let filtered = [...leaveRequests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((r) => r.leave_type === typeFilter);
    }

    if (employeeFilter !== 'all') {
      filtered = filtered.filter((r) => r.employee_id === employeeFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleCreateRequest = async (_data: any) => {
    // This will be handled by the modal component
    await loadData();
    setIsCreateModalOpen(false);
    toast({
      title: 'Succès',
      description: 'Demande de congé créée avec succès',
    });
  };

  const handleApprove = async (id: string) => {
    startTransition(async () => {
      const result = await updateLeaveStatus(id, {
        status: 'approved',
      });

      if (result.success) {
        toast({
          title: 'Approuvé',
          description: 'La demande a été approuvée',
        });
        await loadData();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Une erreur est survenue',
          variant: 'destructive',
        });
      }
    });
    setApproveConfirmId(null);
  };

  const handleReject = async (id: string) => {
    startTransition(async () => {
      const result = await updateLeaveStatus(id, {
        status: 'rejected',
      });

      if (result.success) {
        toast({
          title: 'Rejeté',
          description: 'La demande a été rejetée',
        });
        await loadData();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Une erreur est survenue',
          variant: 'destructive',
        });
      }
    });
    setRejectConfirmId(null);
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const result = await deleteLeaveRequest(id);

      if (result.success) {
        toast({
          title: 'Supprimé',
          description: 'La demande a été supprimée',
        });
        await loadData();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Une erreur est survenue',
          variant: 'destructive',
        });
      }
    });
    setDeleteConfirmId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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
          <h1 className="text-4xl font-semibold text-white">Congés & Absences</h1>
          <p className="mt-2 text-white/70">
            Gérez les demandes de congés de votre équipe
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-2xl bg-[#F2E94E] px-6 py-6 text-[#0A1A2F] transition-all duration-300 hover:bg-[#f6f07a] hover:shadow-lg hover:shadow-[#F2E94E]/20"
        >
          <Plus className="mr-2 h-5 w-5" />
          Nouvelle demande
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="group rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Total demandes</p>
                  <p className="text-3xl font-semibold text-white">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-[#F2E94E]" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="group rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">En attente</p>
                  <p className="text-3xl font-semibold text-white">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="group rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Approuvées</p>
                  <p className="text-3xl font-semibold text-white">{stats.approved}</p>
                </div>
                <Check className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="group rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-white/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Rejetées</p>
                  <p className="text-3xl font-semibold text-white">{stats.rejected}</p>
                </div>
                <X className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card className="rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-white/70" />
            <div className="flex flex-1 gap-4">
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="h-12 w-[200px] rounded-2xl border-white/20 bg-white/20 text-white">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                <SelectTrigger className="h-12 w-[200px] rounded-2xl border-white/20 bg-white/20 text-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="vacation">Congés payés</SelectItem>
                  <SelectItem value="sick">Maladie</SelectItem>
                  <SelectItem value="rtt">RTT</SelectItem>
                  <SelectItem value="unpaid">Sans solde</SelectItem>
                  <SelectItem value="parental">Parental</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>

              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="h-12 w-[250px] rounded-2xl border-white/20 bg-white/20 text-white">
                  <SelectValue placeholder="Employé" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les employés</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="space-y-3">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#F2E94E] text-sm font-semibold text-[#0A1A2F]">
                        {request.employee.first_name.charAt(0)}
                        {request.employee.last_name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">
                            {request.employee.first_name} {request.employee.last_name}
                          </p>
                          <Badge
                            className={`border ${LEAVE_TYPE_COLORS[request.leave_type]}`}
                          >
                            {LEAVE_TYPE_LABELS[request.leave_type]}
                          </Badge>
                          <Badge className={`border ${STATUS_COLORS[request.status]}`}>
                            {STATUS_LABELS[request.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(request.start_date)} - {formatDate(request.end_date)}
                          </span>
                          <span>{request.days_count} jour(s)</span>
                        </div>
                        {request.reason && (
                          <p className="text-sm text-white/50">{request.reason}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => setApproveConfirmId(request.id)}
                            className="rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setRejectConfirmId(request.id)}
                            className="rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {request.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirmId(request.id)}
                          className="rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
                        >
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-12 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-white/20" />
                  <p className="mt-4 text-sm text-white/50">
                    Aucune demande de congé trouvée
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 rounded-xl text-white/70 hover:bg-white/10"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une demande
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Modal */}
      <LeaveRequestModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        employees={employees}
        onSubmit={handleCreateRequest}
        isSubmitting={isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent className="rounded-[32px] border border-white/15 bg-[#0A1A2F]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Supprimer la demande ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/65">
              Cette action est irréversible. La demande de congé sera définitivement
              supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl text-white/70 hover:bg-white/10">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="rounded-2xl bg-red-500 text-white hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Confirmation */}
      <AlertDialog
        open={approveConfirmId !== null}
        onOpenChange={(open) => !open && setApproveConfirmId(null)}
      >
        <AlertDialogContent className="rounded-[32px] border border-white/15 bg-[#0A1A2F]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Approuver la demande ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/65">
              Confirmer l&apos;approbation de cette demande de congé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl text-white/70 hover:bg-white/10">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => approveConfirmId && handleApprove(approveConfirmId)}
              className="rounded-2xl bg-green-500 text-white hover:bg-green-600"
            >
              Approuver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation */}
      <AlertDialog
        open={rejectConfirmId !== null}
        onOpenChange={(open) => !open && setRejectConfirmId(null)}
      >
        <AlertDialogContent className="rounded-[32px] border border-white/15 bg-[#0A1A2F]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Rejeter la demande ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/65">
              Confirmer le rejet de cette demande de congé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl text-white/70 hover:bg-white/10">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectConfirmId && handleReject(rejectConfirmId)}
              className="rounded-2xl bg-red-500 text-white hover:bg-red-600"
            >
              Rejeter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
