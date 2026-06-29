'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { List } from 'lucide-react';
import { Intervention, InterventionStatut, InterventionType, User } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { PlanningCalendar, type PlanningViewMode } from '@/components/shared/PlanningCalendar';
import { InterventionDetail } from '@/components/shared/InterventionDetail';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  INTERVENTION_STATUS_LABELS,
  INTERVENTION_TYPE_LABELS,
  ROLES,
} from '@/lib/constants';
import {
  filterInterventionsByRole,
  getWeekStart,
} from '@/lib/interventions';
import { cn } from '@/lib/utils';

const VIEW_MODES: PlanningViewMode[] = ['week', 'twoWeeks', 'month'];

const VIEW_MODE_LABELS: Record<PlanningViewMode, string> = {
  week: '1 semaine',
  twoWeeks: '2 semaines',
  month: 'Mois',
};

export default function PlanningPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { showError } = useToast();

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [viewMode, setViewMode] = useState<PlanningViewMode>('week');
  const [viewStart, setViewStart] = useState<Date>(() => getWeekStart(new Date()));
  const [technicianFilter, setTechnicianFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailIntervention, setDetailIntervention] = useState<Intervention | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    Promise.all([
      fetch('/api/interventions').then((r) => r.json()),
      fetch('/api/users').then((r) => r.json()),
    ])
      .then(([ivs, us]) => {
        if (Array.isArray(ivs)) setInterventions(ivs);
        if (Array.isArray(us)) setUsers(us);
      })
      .catch(() => showError('Erreur lors du chargement des données.'));
  }, [showError]);

  const handleModeChange = (newMode: PlanningViewMode) => {
    setViewMode(newMode);
    setViewStart(newMode === 'month' ? new Date() : getWeekStart(new Date()));
  };

  const activeTechnicians = useMemo(
    () => users.filter((u) => u.role === 'technician' && u.actif),
    [users]
  );

  const filteredForPlanning = useMemo(() => {
    if (!user) return [];
    let result = filterInterventionsByRole(interventions, user);

    if (technicianFilter !== 'all') {
      result = result.filter((i) => i.technicienId === technicianFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter((i) => i.type === (typeFilter as InterventionType));
    }
    if (statusFilter !== 'all') {
      result = result.filter((i) => i.statut === (statusFilter as InterventionStatut));
    }

    return result;
  }, [interventions, user, technicianFilter, typeFilter, statusFilter]);

  const showTechnicianFilter = user?.role === ROLES.ADMIN;

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Planning</h1>
            <p className="text-muted-foreground mt-2">
              Vue des interventions planifiées
            </p>
          </div>
          <Button variant="outline" asChild className="gap-2 w-full sm:w-auto">
            <Link href="/interventions">
              <List size={16} />
              Liste des interventions
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Vue :</span>
          <div className="inline-flex rounded-md border border-border overflow-hidden">
            {VIEW_MODES.map((mode, i) => (
              <Button
                key={mode}
                type="button"
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                className={cn('rounded-none', i > 0 && 'border-l border-border')}
                onClick={() => handleModeChange(mode)}
              >
                {VIEW_MODE_LABELS[mode]}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {showTechnicianFilter && (
            <Select value={technicianFilter === 'all' ? 'all' : String(technicianFilter)} onValueChange={(v) => setTechnicianFilter(v === 'all' ? 'all' : Number(v))}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Technicien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les techniciens</SelectItem>
                {activeTechnicians.map((tech) => (
                  <SelectItem key={tech.id} value={String(tech.id)}>
                    {tech.prenom} {tech.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(INTERVENTION_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(INTERVENTION_STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <PlanningCalendar
          interventions={filteredForPlanning}
          viewStart={viewStart}
          mode={viewMode}
          onViewChange={setViewStart}
          onCardClick={setDetailIntervention}
        />

        <InterventionDetail
          open={!!detailIntervention}
          intervention={detailIntervention}
          onClose={() => setDetailIntervention(null)}
        />
      </div>
    </AppLayout>
  );
}
