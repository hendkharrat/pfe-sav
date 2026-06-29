'use client';

import { useState } from 'react';
import {
  PreventiveInterventionPreview,
  Intervention,
  ClientEquipement,
  Equipment,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  isTechnicianAvailable,
  getActiveTechnicians,
  getClientEquipementLabel,
} from '@/lib/interventions';
import { mockClientEquipements } from '@/data/mock-client-equipements';
import { mockEquipments } from '@/data/mock-equipments';
import { mockInterventions } from '@/data/mock-interventions';
import { formatDate } from '@/lib/utils';
import { AlertCircle, Users } from 'lucide-react';

interface PreventiveInterventionPreviewTableProps {
  previews: PreventiveInterventionPreview[];
  onChange: (previews: PreventiveInterventionPreview[]) => void;
  interventions?: Intervention[];
  clientEquipements?: ClientEquipement[];
  equipments?: Equipment[];
}

export function PreventiveInterventionPreviewTable({
  previews,
  onChange,
  interventions = mockInterventions,
  clientEquipements = mockClientEquipements,
  equipments = mockEquipments,
}: PreventiveInterventionPreviewTableProps) {
  const [bulkTechId, setBulkTechId] = useState('');
  const technicians = getActiveTechnicians();

  const updateRowTech = (previewId: string, techIdStr: string | undefined) => {
    const technicienId = techIdStr != null ? Number(techIdStr) : undefined;
    onChange(previews.map((p) => (p.id === previewId ? { ...p, technicienId } : p)));
  };

  const rowHasConflict = (p: PreventiveInterventionPreview): boolean => {
    if (!p.technicienId) return false;
    const others = previews.filter((r) => r.id !== p.id);
    return !isTechnicianAvailable(p.technicienId, p.datePrevue, interventions, undefined, others);
  };

  const handleBulkAssign = () => {
    if (!bulkTechId) return;
    const usedDates = new Set<string>();
    const bulkTechNum = Number(bulkTechId);
    const updated = previews.map((p) => {
      if (usedDates.has(p.datePrevue)) return p;
      if (!isTechnicianAvailable(bulkTechNum, p.datePrevue, interventions)) return p;
      usedDates.add(p.datePrevue);
      return { ...p, technicienId: bulkTechNum };
    });
    onChange(updated);
  };

  const handleClearAll = () => {
    onChange(previews.map((p) => ({ ...p, technicienId: undefined })));
  };

  const conflictCount = previews.filter(rowHasConflict).length;
  const assignedCount = previews.filter((p) => p.technicienId).length;

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">
            {previews.length} intervention{previews.length > 1 ? 's' : ''} préventive
            {previews.length > 1 ? 's' : ''}
          </span>
          {assignedCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {assignedCount}/{previews.length} affectée{assignedCount > 1 ? 's' : ''}
            </Badge>
          )}
          {conflictCount > 0 && (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertCircle size={10} />
              {conflictCount} conflit{conflictCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {assignedCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={handleClearAll}
          >
            Effacer tout
          </Button>
        )}
      </div>

      {/* Bulk assign toolbar */}
      <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border">
        <Users size={14} className="text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground shrink-0">Affecter en masse :</span>
        <Select value={bulkTechId} onValueChange={setBulkTechId}>
          <SelectTrigger className="h-7 text-xs flex-1 max-w-64">
            <SelectValue placeholder="Sélectionner un technicien" />
          </SelectTrigger>
          <SelectContent>
            {technicians.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.prenom} {t.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs shrink-0"
          disabled={!bulkTechId}
          onClick={handleBulkAssign}
        >
          Appliquer
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="max-h-64 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Date prévue</TableHead>
                <TableHead className="text-xs">Équipement</TableHead>
                <TableHead className="text-xs">Technicien</TableHead>
                <TableHead className="text-xs w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {previews.map((p) => {
                const label = getClientEquipementLabel(
                  p.clientEquipementId,
                  clientEquipements,
                  equipments
                );
                const conflict = rowHasConflict(p);
                return (
                  <TableRow key={p.id} className={conflict ? 'bg-destructive/5' : undefined}>
                    <TableCell className="text-xs py-1.5">{formatDate(p.datePrevue)}</TableCell>
                    <TableCell
                      className="text-xs py-1.5 max-w-40 truncate"
                      title={label}
                    >
                      {label}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Select
                        value={p.technicienId != null ? String(p.technicienId) : '__none__'}
                        onValueChange={(v) =>
                          updateRowTech(p.id, v === '__none__' ? undefined : v)
                        }
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Non affecté</SelectItem>
                          {technicians.map((t) => {
                            const others = previews.filter((r) => r.id !== p.id);
                            const available = isTechnicianAvailable(
                              t.id,
                              p.datePrevue,
                              interventions,
                              undefined,
                              others
                            );
                            return (
                              <SelectItem key={t.id} value={String(t.id)} disabled={!available}>
                                {t.prenom} {t.nom}
                                {!available ? ' (indisponible)' : ''}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-1.5">
                      {conflict ? (
                        <Badge variant="destructive" className="text-[10px] gap-1 h-5">
                          <AlertCircle size={9} />
                          Conflit
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] h-5 text-muted-foreground">
                          Planifiée
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
