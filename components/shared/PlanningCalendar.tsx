'use client';

import { Intervention } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockClients } from '@/data/mock-clients';
import { mockEquipments } from '@/data/mock-equipments';
import { INTERVENTION_TYPE_LABELS } from '@/lib/constants';
import {
  addDays,
  addMonths,
  formatDateFr,
  formatMonthYearFr,
  getMonthGridDays,
  getTechnicianName,
  getWeekStart,
  toDateInputValue,
} from '@/lib/interventions';
import { cn, getClientDisplayName } from '@/lib/utils';

export type PlanningViewMode = 'week' | 'twoWeeks' | 'month';

const WEEKDAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const WEEKDAY_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface PlanningCalendarProps {
  interventions: Intervention[];
  viewStart: Date;
  mode: PlanningViewMode;
  onViewChange: (date: Date) => void;
  onCardClick: (intervention: Intervention) => void;
}

export function PlanningCalendar({
  interventions,
  viewStart,
  mode,
  onViewChange,
  onCardClick,
}: PlanningCalendarProps) {
  const goToPrev = () => {
    if (mode === 'week') onViewChange(addDays(viewStart, -7));
    else if (mode === 'twoWeeks') onViewChange(addDays(viewStart, -14));
    else onViewChange(addMonths(viewStart, -1));
  };

  const goToNext = () => {
    if (mode === 'week') onViewChange(addDays(viewStart, 7));
    else if (mode === 'twoWeeks') onViewChange(addDays(viewStart, 14));
    else onViewChange(addMonths(viewStart, 1));
  };

  const goToCurrent = () => {
    onViewChange(mode === 'month' ? new Date() : getWeekStart(new Date()));
  };

  const getInterventionsForDay = (day: Date): Intervention[] => {
    const dayStr = toDateInputValue(day);
    return interventions.filter((i) => i.datePrevue === dayStr);
  };

  let label: string;
  if (mode === 'month') {
    label = formatMonthYearFr(viewStart);
  } else {
    const rangeEnd = addDays(viewStart, mode === 'week' ? 6 : 13);
    label = `${formatDateFr(toDateInputValue(viewStart))} — ${formatDateFr(toDateInputValue(rangeEnd))}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" onClick={goToPrev}>
            <ChevronLeft size={18} />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={goToCurrent}>
            {mode === 'month' ? 'Mois en cours' : 'Semaine en cours'}
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight size={18} />
          </Button>
        </div>
        <p className="text-sm font-medium text-foreground capitalize">{label}</p>
      </div>

      {mode !== 'month' ? (
        <LinearDaysGrid
          days={Array.from(
            { length: mode === 'week' ? 7 : 14 },
            (_, i) => addDays(viewStart, i)
          )}
          getInterventionsForDay={getInterventionsForDay}
          onCardClick={onCardClick}
        />
      ) : (
        <MonthGrid
          viewStart={viewStart}
          getInterventionsForDay={getInterventionsForDay}
          onCardClick={onCardClick}
        />
      )}
    </div>
  );
}

function LinearDaysGrid({
  days,
  getInterventionsForDay,
  onCardClick,
}: {
  days: Date[];
  getInterventionsForDay: (day: Date) => Intervention[];
  onCardClick: (intervention: Intervention) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
      {days.map((day, index) => {
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
              <p>{WEEKDAY_LABELS[index % 7]}</p>
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
  );
}

function MonthGrid({
  viewStart,
  getInterventionsForDay,
  onCardClick,
}: {
  viewStart: Date;
  getInterventionsForDay: (day: Date) => Intervention[];
  onCardClick: (intervention: Intervention) => void;
}) {
  const gridDays = getMonthGridDays(viewStart);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAY_SHORT.map((lbl) => (
            <div
              key={lbl}
              className="text-center text-xs font-semibold text-muted-foreground py-2"
            >
              {lbl}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {gridDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-[110px] rounded-lg" />;
            }
            const dayInterventions = getInterventionsForDay(day);
            const isToday = toDateInputValue(day) === toDateInputValue(new Date());
            return (
              <div
                key={toDateInputValue(day)}
                className={cn(
                  'min-h-[110px] rounded-lg border border-border bg-card',
                  isToday && 'ring-2 ring-primary/30'
                )}
              >
                <div
                  className={cn(
                    'px-2 py-1.5 border-b border-border',
                    isToday ? 'bg-primary/10' : 'bg-muted/40'
                  )}
                >
                  <p className="text-xs font-semibold">
                    {day.toLocaleDateString('fr-FR', { day: 'numeric' })}
                  </p>
                </div>
                <div className="p-1 space-y-1 max-h-[160px] overflow-y-auto">
                  {dayInterventions.map((intervention) => (
                    <InterventionCard
                      key={intervention.id}
                      intervention={intervention}
                      onClick={() => onCardClick(intervention)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
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
      <p className="text-xs text-muted-foreground truncate">{client ? getClientDisplayName(client) : ''}</p>
      <p className="text-xs text-muted-foreground truncate">
        {equipment?.reference ?? 'Équipement'}
      </p>
      <p className="text-xs text-muted-foreground">
        {getTechnicianName(intervention.technicienId)}
      </p>
      <div className="flex flex-wrap gap-1">
        <StatusBadge status={intervention.statut} type="intervention" />
      </div>
    </button>
  );
}
