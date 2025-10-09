'use client';

import { Calendar, Clock, Sparkles, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { createClientSupabaseClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createClientSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single();

          if (userData) {
            setUserName(`${userData.first_name} ${userData.last_name}`);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#F2E94E]">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">PLANORA</span>
        </div>
        <h1 className="mt-2 text-4xl font-semibold text-white">
          {isLoading ? 'Bienvenue' : `Bienvenue, ${userName}`}
        </h1>
        <p className="mt-2 text-white/70">
          Votre tableau de bord pour piloter vos plannings et vos équipes
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Employés</p>
                <p className="mt-2 text-3xl font-semibold text-white">—</p>
                <p className="mt-1 text-xs text-white/50">Total actifs</p>
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
                <p className="text-sm text-white/70">Plannings</p>
                <p className="mt-2 text-3xl font-semibold text-white">—</p>
                <p className="mt-1 text-xs text-white/50">Cette semaine</p>
              </div>
              <div className="rounded-full bg-blue-500/20 p-3">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Heures planifiées</p>
                <p className="mt-2 text-3xl font-semibold text-white">—</p>
                <p className="mt-1 text-xs text-white/50">Cette semaine</p>
              </div>
              <div className="rounded-full bg-purple-500/20 p-3">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Taux occupation</p>
                <p className="mt-2 text-3xl font-semibold text-white">—</p>
                <p className="mt-1 text-xs text-white/50">Moyenne</p>
              </div>
              <div className="rounded-full bg-green-500/20 p-3">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Actions rapides</CardTitle>
            <CardDescription className="text-white/65">
              Accédez rapidement aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/employees">
              <Button
                variant="ghost"
                className="h-auto w-full justify-start rounded-2xl p-4 text-left hover:bg-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-[#F2E94E]/20 p-2">
                    <Users className="h-5 w-5 text-[#F2E94E]" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Gérer les employés</p>
                    <p className="text-sm text-white/60">
                      Ajouter, modifier ou voir vos employés
                    </p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/schedules">
              <Button
                variant="ghost"
                className="h-auto w-full justify-start rounded-2xl p-4 text-left hover:bg-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-500/20 p-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Créer un planning</p>
                    <p className="text-sm text-white/60">
                      Générer un nouveau planning pour vos équipes
                    </p>
                  </div>
                </div>
              </Button>
            </Link>

            <Link href="/settings/team">
              <Button
                variant="ghost"
                className="h-auto w-full justify-start rounded-2xl p-4 text-left hover:bg-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-purple-500/20 p-2">
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Gérer l&apos;équipe</p>
                    <p className="text-sm text-white/60">
                      Inviter et gérer les utilisateurs
                    </p>
                  </div>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">Activité récente</CardTitle>
            <CardDescription className="text-white/65">
              Les dernières modifications et événements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-white/5 p-4 mb-4">
                <Clock className="h-8 w-8 text-white/30" />
              </div>
              <p className="text-sm text-white/50">
                Aucune activité récente pour le moment
              </p>
              <p className="mt-1 text-xs text-white/30">
                Les événements apparaîtront ici
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="rounded-[32px] border border-[#F2E94E]/20 bg-gradient-to-br from-[#F2E94E]/10 to-transparent backdrop-blur-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#F2E94E]" />
            <CardTitle className="text-white">Premiers pas</CardTitle>
          </div>
          <CardDescription className="text-white/65">
            Configurez votre espace de travail pour commencer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-sm font-semibold text-white">
              ✓
            </div>
            <span className="text-white/70">Onboarding complété</span>
          </div>

          <Link href="/employees">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/30 text-sm font-semibold text-white/50">
                1
              </div>
              <span className="text-white/70">Ajouter vos premiers employés</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 opacity-50">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/30 text-sm font-semibold text-white/50">
              2
            </div>
            <span className="text-white/70">Créer votre premier planning</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
