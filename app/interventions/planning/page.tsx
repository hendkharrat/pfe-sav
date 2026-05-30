'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { List } from 'lucide-react';
import { Intervention, InterventionStatut, InterventionType } from '@/types';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { PlanningCalendar } from '@/components/shared/PlanningCalendar';
import { InterventionDetail } from '@/components/shared/InterventionDetail';
import { mockInterventions } from '@/data/mock-interventions';
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
  getActiveTechnicians,
  getWeekStart,
} from '@/lib/interventions';

export default function PlanningPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailIntervention, setDetailIntervention] = useState<Intervention | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    setInterventions(mockInterventions);
  }, []);

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
              Vue hebdomadaire des interventions
            </p>
          </div>
          <Button variant="outline" asChild className="gap-2 w-full sm:w-auto">
            <Link href="/interventions">
              <List size={16} />
              Liste des interventions
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {showTechnicianFilter && (
            <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Technicien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les techniciens</SelectItem>
                {getActiveTechnicians().map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
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
          weekStart={weekStart}
          onWeekChange={setWeekStart}
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
