'use client';

import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Badge,
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
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { GenerateScheduleForm } from './_components/GenerateScheduleForm';

interface Schedule {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: 'draft' | 'published' | 'archived';
  generation_method: 'manual' | 'ai' | 'template';
  total_hours: number;
  coverage_score: number | null;
  created_at: string;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | 'all'>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    loadSchedules();
  }, [filterStatus]);

  const loadSchedules = async () => {
    try {
      const supabase = createClientSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userData?.company_id) return;

      let query = supabase
        .from('schedules')
        .select('*')
        .eq('company_id', userData.company_id)
        .order('start_date', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as 'draft' | 'published' | 'archived');
      }

      const { data, error } = await query;

      if (error) throw error;
      setSchedules((data as any) || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    return `${start.toLocaleDateString('fr-FR', options)} - ${end.toLocaleDateString('fr-FR', options)}`;
  };

  const getStatusBadge = (status: Schedule['status']) => {
    const variants: Record<
      Schedule['status'],
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
    > = {
      draft: { variant: 'outline', label: 'Brouillon' },
      published: { variant: 'default', label: 'Publié' },
      archived: { variant: 'secondary', label: 'Archivé' },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className="rounded-full">
        {config.label}
      </Badge>
    );
  };

  const getGenerationMethodLabel = (method: Schedule['generation_method']) => {
    const labels: Record<Schedule['generation_method'], string> = {
      manual: 'Manuel',
      ai: 'IA',
      template: 'Template',
    };
    return labels[method];
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const currentMonthName = currentDate.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const handleGenerateSuccess = () => {
    setShowGenerateForm(false);
    setIsCreateDialogOpen(false);
    loadSchedules();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#F2E94E]">
          <CalendarDays className="h-5 w-5" />
          <span className="text-sm font-medium">PLANNINGS</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-white">Plannings</h1>
            <p className="mt-2 text-white/70">Gérez et générez vos plannings d&apos;équipe</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="rounded-2xl bg-[#F2E94E] px-6 text-[#071427] hover:bg-[#F2E94E]/90"
              >
                <Plus className="mr-2 h-5 w-5" />
                Nouveau planning
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/15 bg-[#071427] backdrop-blur-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">
                  {showGenerateForm ? 'Générer un planning' : 'Créer un planning'}
                </DialogTitle>
                <DialogDescription className="text-white/70">
                  {showGenerateForm
                    ? 'Configurez les paramètres de génération automatique'
                    : 'Choisissez comment vous souhaitez créer votre planning'}
                </DialogDescription>
              </DialogHeader>

              {showGenerateForm ? (
                <div className="pt-4">
                  <GenerateScheduleForm onSuccess={handleGenerateSuccess} />
                  <Button
                    variant="ghost"
                    onClick={() => setShowGenerateForm(false)}
                    className="mt-4 w-full rounded-xl text-white hover:bg-white/10"
                  >
                    Retour aux options
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <Card
                    onClick={() => setShowGenerateForm(true)}
                    className="cursor-pointer rounded-[24px] border-2 border-white/10 bg-white/5 transition-all hover:border-[#F2E94E]/50 hover:bg-white/10"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-[#F2E94E]/20 p-3">
                          <Sparkles className="h-6 w-6 text-[#F2E94E]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            Génération automatique (IA)
                          </h3>
                          <p className="mt-1 text-sm text-white/60">
                            Laissez l&apos;IA créer un planning optimisé en fonction de vos
                            contraintes et préférences
                          </p>
                          <div className="mt-3">
                            <Badge className="rounded-full bg-[#F2E94E]/20 text-[#F2E94E]">
                              Recommandé
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-not-allowed rounded-[24px] border-2 border-white/10 bg-white/5 opacity-50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-blue-500/20 p-3">
                          <Calendar className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            Partir d&apos;un template
                          </h3>
                          <p className="mt-1 text-sm text-white/60">
                            Utilisez vos templates de shifts existants pour créer rapidement un
                            planning
                          </p>
                          <div className="mt-3">
                            <Badge variant="outline" className="rounded-full">
                              Bientôt disponible
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-not-allowed rounded-[24px] border-2 border-white/10 bg-white/5 opacity-50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-purple-500/20 p-3">
                          <Users className="h-6 w-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            Création manuelle
                          </h3>
                          <p className="mt-1 text-sm text-white/60">
                            Créez votre planning de A à Z en assignant manuellement les shifts
                          </p>
                          <div className="mt-3">
                            <Badge variant="outline" className="rounded-full">
                              Bientôt disponible
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Plannings actifs</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {schedules.filter((s) => s.status === 'published').length}
                </p>
              </div>
              <div className="rounded-full bg-green-500/20 p-3">
                <CalendarDays className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Brouillons</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {schedules.filter((s) => s.status === 'draft').length}
                </p>
              </div>
              <div className="rounded-full bg-orange-500/20 p-3">
                <Calendar className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Total heures</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {schedules
                    .filter((s) => s.status === 'published')
                    .reduce((acc, s) => acc + Number(s.total_hours), 0)
                    .toFixed(0)}
                </p>
              </div>
              <div className="rounded-full bg-blue-500/20 p-3">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Couverture moy.</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {schedules.filter((s) => s.coverage_score !== null).length > 0
                    ? (
                        schedules
                          .filter((s) => s.coverage_score !== null)
                          .reduce((acc, s) => acc + Number(s.coverage_score), 0) /
                        schedules.filter((s) => s.coverage_score !== null).length
                      ).toFixed(0)
                    : '—'}
                  {schedules.filter((s) => s.coverage_score !== null).length > 0 && '%'}
                </p>
              </div>
              <div className="rounded-full bg-purple-500/20 p-3">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Calendar Navigation */}
      <Card className="rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-white/70" />
                <span className="text-sm font-medium text-white">Filtres</span>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] rounded-xl border-white/15 bg-white/5 text-white">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/15 bg-[#071427]">
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="published">Publiés</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
                  <SelectItem value="archived">Archivés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousMonth}
                className="rounded-xl text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="min-w-[200px] text-center text-lg font-medium capitalize text-white">
                {currentMonthName}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                className="rounded-xl text-white hover:bg-white/10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedules List */}
      <Card className="rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white">Plannings existants</CardTitle>
              <CardDescription className="text-white/65">
                {schedules.length} planning{schedules.length !== 1 ? 's' : ''} trouvé
                {schedules.length !== 1 ? 's' : ''}
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
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#F2E94E]"></div>
              <p className="mt-4 text-sm text-white/50">Chargement...</p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-white/5 p-4">
                <Calendar className="h-8 w-8 text-white/30" />
              </div>
              <p className="text-sm text-white/50">Aucun planning trouvé</p>
              <p className="mt-1 text-xs text-white/30">
                Créez votre premier planning pour commencer
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-6 rounded-2xl bg-[#F2E94E] text-[#071427] hover:bg-[#F2E94E]/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un planning
              </Button>
            </div>
          ) : viewMode === 'list' ? (
            /* List View - Enhanced with premium hover effects */
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <Card
                  key={schedule.id}
                  className="group cursor-pointer rounded-[24px] border border-white/10 bg-white/5 transition-all duration-300 hover:scale-[1.005] hover:border-white/20 hover:bg-white/10 hover:shadow-lg hover:shadow-white/5"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-[#F2E94E]">
                            {schedule.title}
                          </h3>
                          {getStatusBadge(schedule.status)}
                        </div>
                        {schedule.description && (
                          <p className="mt-2 text-sm text-white/60">{schedule.description}</p>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-white/50">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDateRange(schedule.start_date, schedule.end_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{Number(schedule.total_hours).toFixed(0)}h</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            <span>{getGenerationMethodLabel(schedule.generation_method)}</span>
                          </div>
                          {schedule.coverage_score !== null && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{Number(schedule.coverage_score).toFixed(0)}% couverture</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Grid View - Premium compact cards */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {schedules.map((schedule) => (
                <Card
                  key={schedule.id}
                  className="group cursor-pointer rounded-[24px] border border-white/10 bg-white/5 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:bg-white/8 hover:shadow-2xl hover:shadow-white/10"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Title & Status */}
                      <div>
                        <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-[#F2E94E]">
                          {schedule.title}
                        </h3>
                        <div className="mt-2">
                          {getStatusBadge(schedule.status)}
                        </div>
                      </div>

                      {/* Description */}
                      {schedule.description && (
                        <p className="line-clamp-2 text-sm text-white/60">
                          {schedule.description}
                        </p>
                      )}

                      {/* Stats Grid */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Calendar className="h-4 w-4 text-white/50" />
                          <span className="truncate">
                            {formatDateRange(schedule.start_date, schedule.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Clock className="h-4 w-4 text-white/50" />
                          <span>{Number(schedule.total_hours).toFixed(0)} heures</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <Sparkles className="h-4 w-4 text-white/50" />
                          <span>{getGenerationMethodLabel(schedule.generation_method)}</span>
                        </div>
                        {schedule.coverage_score !== null && (
                          <div className="flex items-center gap-2 text-sm text-white/70">
                            <Users className="h-4 w-4 text-white/50" />
                            <span>{Number(schedule.coverage_score).toFixed(0)}% couverture</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
