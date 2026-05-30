'use client';

import { Intervention } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockClients } from '@/data/mock-clients';
import { mockEquipments } from '@/data/mock-equipments';
import { INTERVENTION_TYPE_LABELS } from '@/lib/constants';
import {
  addDays,
  formatDateFr,
  getTechnicianName,
  getWeekStart,
  toDateInputValue,
} from '@/lib/interventions';
import { cn } from '@/lib/utils';

const WEEKDAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface PlanningCalendarProps {
  interventions: Intervention[];
  weekStart: Date;
  onWeekChange: (weekStart: Date) => void;
  onCardClick: (intervention: Intervention) => void;
}

export function PlanningCalendar({
  interventions,
  weekStart,
  onWeekChange,
  onCardClick,
}: PlanningCalendarProps) {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = addDays(weekStart, 6);

  const weekLabel = `${formatDateFr(toDateInputValue(weekStart))} — ${formatDateFr(toDateInputValue(weekEnd))}`;

  const goToPreviousWeek = () => {
    onWeekChange(addDays(weekStart, -7));
  };

  const goToNextWeek = () => {
    onWeekChange(addDays(weekStart, 7));
  };

  const goToCurrentWeek = () => {
    onWeekChange(getWeekStart(new Date()));
  };

  const getInterventionsForDay = (day: Date): Intervention[] => {
    const dayStr = toDateInputValue(day);
    return interventions.filter((i) => i.datePrevue === dayStr);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft size={18} />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={goToCurrentWeek}>
            Semaine en cours
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight size={18} />
          </Button>
        </div>
        <p className="text-sm font-medium text-foreground capitalize">{weekLabel}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDays.map((day, index) => {
          const dayInterventions = getInterventionsForDay(day);
          const isToday = toDateInputValue(day) === toDateInputValue(new Date());

          return (
            <div
              key={toDateInputValue(day)}
              className={cn(
                'min-h-[200px] rounded-lg border border-border bg-card',
                isToday && 'ring-2 ring-primary/30'
              )}
            >
              <div
                className={cn(
                  'px-3 py-2 border-b border-border text-sm font-semibold',
                  isToday ? 'bg-primary/10' : 'bg-muted/40'
                )}
              >
                <p>{WEEKDAY_LABELS[index]}</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </p>
              </div>

              <div className="p-2 space-y-2 max-h-[320px] overflow-y-auto">
                {dayInterventions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Aucune intervention
                  </p>
                ) : (
                  dayInterventions.map((intervention) => (
                    <InterventionCard
                      key={intervention.id}
                      intervention={intervention}
                      onClick={() => onCardClick(intervention)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InterventionCard({
  intervention,
  onClick,
}: {
  intervention: Intervention;
  onClick: () => void;
}) {
  const client = mockClients.find((c) => c.id === intervention.clientId);
  const equipment = mockEquipments.find((e) => e.id === intervention.equipementId);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-md border border-border p-2 hover:bg-accent/50 transition-colors space-y-1.5"
    >
      <Badge variant="outline" className="text-xs">
        {INTERVENTION_TYPE_LABELS[intervention.type] ?? intervention.type}
      </Badge>
      <p className="text-xs font-semibold">{intervention.reference}</p>
      <p className="text-xs text-muted-foreground truncate">{client?.societe}</p>
      <p className="text-xs text-muted-foreground truncate">
        {equipment?.reference ?? 'Équipement'}
      </p>
      <p className="text-xs text-muted-foreground">
        {getTechnicianName(intervention.technicienId)}
      </p>
      <div className="flex flex-wrap gap-1">
        <StatusBadge status={intervention.statut} type="intervention" />
        <PriorityBadge priority={intervention.priorite} />
      </div>
    </button>
  );
}
