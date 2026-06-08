'use client';

import { useState, useEffect } from 'react';
import { Panne, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockClients } from '@/data/mock-clients';
import { mockEquipments } from '@/data/mock-equipments';
import { getActiveTechnicians, getContractCoverage } from '@/lib/interventions';
import { getClientDisplayName } from '@/lib/utils';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface CreateCurativeFromPanneDialogProps {
  open: boolean;
  panne: Panne | null;
  onClose: () => void;
  onConfirm: (data: {
    technicienId?: string;
    datePrevue: string;
    description: string;
  }) => void;
}

export function CreateCurativeFromPanneDialog({
  open,
  panne,
  onClose,
  onConfirm,
}: CreateCurativeFromPanneDialogProps) {
  const [technicienId, setTechnicienId] = useState<string>('none');
  const [datePrevue, setDatePrevue] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const technicians = getActiveTechnicians();

  useEffect(() => {
    if (panne) {
      setDescription(panne.description);
      setDatePrevue('');
      setTechnicienId('none');
      setErrors({});
    }
  }, [panne]);

  if (!panne) return null;

  const client = mockClients.find((c) => c.id === panne.clientId);
  const equipment = mockEquipments.find((e) => e.id === panne.equipementId);

  // Check contract coverage
  const { couvertureContrat, contractId } = getContractCoverage(
    panne.equipementId,
    panne.clientId
  );

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!datePrevue) {
      newErrors.datePrevue = "La date d'intervention est obligatoire";
    } else {
      const selectedDate = new Date(datePrevue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.datePrevue = "La date prévue ne peut pas être dans le passé";
      }
    }
    if (!description.trim()) {
      newErrors.description = 'La description de l’intervention est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onConfirm({
      technicienId: technicienId === 'none' ? undefined : technicienId,
      datePrevue,
      description,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[550px] overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-bold">Créer une intervention curative</DialogTitle>
          <DialogDescription>
            Convertissez la panne déclarée en intervention de type CURATIVE.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Read-only Panne details */}
          <div className="p-3 bg-muted/50 border border-border rounded-lg space-y-2 text-xs">
            <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider mb-2">
              Informations Panne (Lecture seule)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-muted-foreground">Panne :</span>{' '}
                <span className="font-semibold text-foreground">{panne.reference}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Client :</span>{' '}
                <span className="font-semibold text-foreground">{client ? getClientDisplayName(client) : 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Équipement :</span>{' '}
                <span className="font-semibold text-foreground">{equipment?.reference ?? 'N/A'}</span>
              </div>
            </div>

            {/* Contract Coverage info badge */}
            <div className="pt-2 border-t border-border mt-2">
              {couvertureContrat ? (
                <div className="flex items-center gap-1.5 text-green-700 font-medium bg-green-50 p-1.5 rounded border border-green-150">
                  <ShieldCheck size={14} className="text-green-600" />
                  <span>Couvert par le contrat actif {contractId ? `(${contractId})` : ''}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-700 font-medium bg-amber-50 p-1.5 rounded border border-amber-150">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span>Hors contrat (aucune couverture active détectée)</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Technician */}
            <div className="space-y-2">
              <Label htmlFor="technicien" className="text-sm font-semibold">
                Affecter un technicien (facultatif)
              </Label>
              <Select value={technicienId} onValueChange={setTechnicienId}>
                <SelectTrigger id="technicien">
                  <SelectValue placeholder="Choisir un technicien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non affecté</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.prenom} {tech.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Planned Date */}
            <div className="space-y-2">
              <Label htmlFor="datePrevue" className="text-sm font-semibold">
                Date prévue *
              </Label>
              <Input
                id="datePrevue"
                type="date"
                value={datePrevue}
                onChange={(e) => setDatePrevue(e.target.value)}
                className="h-10"
              />
              {errors.datePrevue && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.datePrevue}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="descIntervention" className="text-sm font-semibold">
                Description de l&apos;intervention *
              </Label>
              <Textarea
                id="descIntervention"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails des instructions pour l'intervention..."
                className="min-h-[100px]"
              />
              {errors.description && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-3 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              Créer l&apos;intervention
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
