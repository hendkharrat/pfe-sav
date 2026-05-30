'use client';

import { useState } from 'react';
import { Intervention, InterventionStatut } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INTERVENTION_STATUS_LABELS } from '@/lib/constants';

interface ChangeStatusDialogProps {
  open: boolean;
  intervention: Intervention | null;
  onClose: () => void;
  onConfirm: (statut: InterventionStatut) => void;
}

const STATUS_OPTIONS: InterventionStatut[] = [
  'PLANIFIEE',
  'EN_COURS',
  'REALISEE',
  'ANNULEE',
];

export function ChangeStatusDialog({
  open,
  intervention,
  onClose,
  onConfirm,
}: ChangeStatusDialogProps) {
  const [statut, setStatut] = useState<InterventionStatut>(
    intervention?.statut ?? 'PLANIFIEE'
  );

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    } else if (intervention) {
      setStatut(intervention.statut);
    }
  };

  const handleSubmit = () => {
    onConfirm(statut);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer le statut</DialogTitle>
          <DialogDescription>
            {intervention ? `Intervention ${intervention.reference}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nouveau statut</Label>
            <Select
              value={statut}
              onValueChange={(value: InterventionStatut) => setStatut(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {INTERVENTION_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
