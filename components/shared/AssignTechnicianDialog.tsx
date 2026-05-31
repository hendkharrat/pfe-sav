'use client';

import { useState } from 'react';
import { Intervention } from '@/types';
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
import {
  getActiveTechnicians,
  isTechnicianAvailable,
  TECHNICIAN_UNAVAILABLE_MESSAGE,
} from '@/lib/interventions';
import { formatDate } from '@/lib/utils';

interface AssignTechnicianDialogProps {
  open: boolean;
  intervention: Intervention | null;
  interventions: Intervention[];
  onClose: () => void;
  onAssign: (technicienId: string) => void;
}

export function AssignTechnicianDialog({
  open,
  intervention,
  interventions,
  onClose,
  onAssign,
}: AssignTechnicianDialogProps) {
  const [technicienId, setTechnicienId] = useState('');
  const [error, setError] = useState('');

  const technicians = getActiveTechnicians();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTechnicienId('');
      setError('');
      onClose();
    } else if (intervention?.technicienId) {
      setTechnicienId(intervention.technicienId);
    }
  };

  const handleSubmit = () => {
    if (!intervention || !technicienId) {
      setError('Veuillez sélectionner un technicien');
      return;
    }

    if (
      !isTechnicianAvailable(
        technicienId,
        intervention.datePrevue,
        interventions,
        intervention.id
      )
    ) {
      setError(TECHNICIAN_UNAVAILABLE_MESSAGE);
      return;
    }

    onAssign(technicienId);
    setTechnicienId('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Affecter un technicien</DialogTitle>
          <DialogDescription>
            {intervention
              ? `Intervention ${intervention.reference} — ${formatDate(intervention.datePrevue)}`
              : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Technicien</Label>
            <Select value={technicienId} onValueChange={setTechnicienId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un technicien" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.prenom} {tech.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Affecter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
