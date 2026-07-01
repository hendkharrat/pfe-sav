'use client';

import { useState } from 'react';
import { Intervention, InterventionStatut } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INTERVENTION_STATUS_LABELS } from '@/lib/constants';
import { getTodayDateInputValue } from '@/lib/interventions';

export interface CloseInterventionData {
  dateRealisation: string;
  diagnostic: string;
  actionsRealisees: string;
  materielUtilise: string;
  dureeMinutes: number;
  observations: string;
  statut: Extract<InterventionStatut, 'REALISEE' | 'ANNULEE'>;
}

interface CloseInterventionDialogProps {
  open: boolean;
  intervention: Intervention | null;
  onClose: () => void;
  onSubmit: (data: CloseInterventionData) => void;
}

export function CloseInterventionDialog({
  open,
  intervention,
  onClose,
  onSubmit,
}: CloseInterventionDialogProps) {
  const todayStr = getTodayDateInputValue();
  const [formData, setFormData] = useState<CloseInterventionData>({
    dateRealisation: todayStr,
    diagnostic: '',
    actionsRealisees: '',
    materielUtilise: '',
    dureeMinutes: 60,
    observations: '',
    statut: 'REALISEE',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData({
        dateRealisation: todayStr,
        diagnostic: '',
        actionsRealisees: '',
        materielUtilise: '',
        dureeMinutes: 60,
        observations: '',
        statut: 'REALISEE',
      });
      setErrors({});
      onClose();
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.dateRealisation) {
      newErrors.dateRealisation = 'La date de réalisation est obligatoire';
    } else if (formData.dateRealisation < todayStr) {
      newErrors.dateRealisation = "La date de réalisation doit être aujourd'hui ou une date future.";
    }
    if (!formData.diagnostic.trim()) {
      newErrors.diagnostic = 'Le diagnostic est obligatoire';
    }
    if (!formData.actionsRealisees.trim()) {
      newErrors.actionsRealisees = 'Les actions réalisées sont obligatoires';
    }
    if (formData.dureeMinutes <= 0) {
      newErrors.dureeMinutes = 'La durée doit être supérieure à 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Clôturer l&apos;intervention</DialogTitle>
          <DialogDescription>
            {intervention
              ? `${intervention.reference} — renseignez le compte-rendu`
              : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
          <FormRow label="Statut final *" error={errors.statut}>
            <Select
              value={formData.statut}
              onValueChange={(value: 'REALISEE' | 'ANNULEE') =>
                setFormData({ ...formData, statut: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REALISEE">
                  {INTERVENTION_STATUS_LABELS.REALISEE}
                </SelectItem>
                <SelectItem value="ANNULEE">
                  {INTERVENTION_STATUS_LABELS.ANNULEE}
                </SelectItem>
              </SelectContent>
            </Select>
          </FormRow>

          <FormRow label="Date de réalisation *" error={errors.dateRealisation}>
            <Input
              type="date"
              min={todayStr}
              value={formData.dateRealisation}
              onChange={(e) =>
                setFormData({ ...formData, dateRealisation: e.target.value })
              }
            />
          </FormRow>

          <FormRow label="Diagnostic *" error={errors.diagnostic}>
            <Textarea
              value={formData.diagnostic}
              onChange={(e) =>
                setFormData({ ...formData, diagnostic: e.target.value })
              }
              rows={2}
            />
          </FormRow>

          <FormRow label="Actions réalisées *" error={errors.actionsRealisees}>
            <Textarea
              value={formData.actionsRealisees}
              onChange={(e) =>
                setFormData({ ...formData, actionsRealisees: e.target.value })
              }
              rows={2}
            />
          </FormRow>

          <FormRow label="Matériel utilisé">
            <Textarea
              value={formData.materielUtilise}
              onChange={(e) =>
                setFormData({ ...formData, materielUtilise: e.target.value })
              }
              rows={2}
            />
          </FormRow>

          <FormRow label="Durée (minutes) *" error={errors.dureeMinutes}>
            <Input
              type="number"
              min={1}
              value={formData.dureeMinutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dureeMinutes: parseInt(e.target.value, 10) || 0,
                })
              }
            />
          </FormRow>

          <FormRow label="Observations">
            <Textarea
              value={formData.observations}
              onChange={(e) =>
                setFormData({ ...formData, observations: e.target.value })
              }
              rows={2}
            />
          </FormRow>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Clôturer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormRow({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
