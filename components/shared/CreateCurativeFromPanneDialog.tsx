'use client';

import { useState, useEffect } from 'react';
import { Client, Contract, Equipment, Intervention, Panne, User } from '@/types';
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
import { mockInterventions } from '@/data/mock-interventions';
import { mockContracts } from '@/data/mock-contracts';
import {
  getActiveTechnicians,
  findActiveContractForClientEquipement,
  isTechnicianAvailable,
  TECHNICIAN_UNAVAILABLE_MESSAGE,
  getTodayDateInputValue,
} from '@/lib/interventions';
import { getClientDisplayName } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
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
  clients?: Client[];
  equipments?: Equipment[];
  interventions?: Intervention[];
  users?: User[];
  contracts?: Contract[];
}

export function CreateCurativeFromPanneDialog({
  open,
  panne,
  onClose,
  onConfirm,
  clients = mockClients,
  equipments = mockEquipments,
  interventions = mockInterventions,
  users = [],
  contracts = mockContracts,
}: CreateCurativeFromPanneDialogProps) {
  const [technicienId, setTechnicienId] = useState<string>('none');
  const [datePrevue, setDatePrevue] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { showError } = useToast();
  const todayStr = getTodayDateInputValue();

  const technicians = users.length > 0
    ? users.filter((u) => u.role === 'technician' && u.actif)
    : getActiveTechnicians();

  useEffect(() => {
    if (panne) {
      setDescription(panne.description);
      setDatePrevue('');
      setTechnicienId('none');
      setErrors({});
    }
  }, [panne]);

  if (!panne) return null;

  const client = clients.find((c) => c.id === panne.clientId);
  const equipment = equipments.find((e) => e.id === panne.equipementId);

  // Compute contract coverage from CE-based lookup (preferred) with passed contracts
  const coveringContract = panne.clientEquipementId
    ? findActiveContractForClientEquipement(panne.clientEquipementId, panne.clientId, contracts)
    : undefined;
  const couvertureContrat = coveringContract !== undefined;
  const contractId = coveringContract?.id;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!datePrevue) {
      newErrors.datePrevue = "La date d'intervention est obligatoire";
    } else if (datePrevue < todayStr) {
      newErrors.datePrevue = 'La date prévue doit être aujourd\'hui ou une date future.';
    }
    if (!description.trim()) {
      newErrors.description = "La description de l'intervention est obligatoire";
    }

    if (
      technicienId !== 'none' &&
      datePrevue &&
      !isTechnicianAvailable(Number(technicienId), datePrevue, interventions)
    ) {
      newErrors.technicienId = TECHNICIAN_UNAVAILABLE_MESSAGE;
    }

    if (newErrors.datePrevue) {
      showError('Veuillez corriger la date prévue avant de continuer.');
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
            {/* Planned Date — must come before technician */}
            <div className="space-y-2">
              <Label htmlFor="datePrevue" className="text-sm font-semibold">
                Date prévue *
              </Label>
              <Input
                id="datePrevue"
                type="date"
                value={datePrevue}
                min={todayStr}
                onChange={(e) => {
                  setDatePrevue(e.target.value);
                  if (errors.datePrevue) setErrors((prev) => ({ ...prev, datePrevue: '' }));
                }}
                className="h-10"
              />
              {errors.datePrevue && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.datePrevue}
                </p>
              )}
            </div>

            {/* Technician — disabled until date is selected */}
            <div className="space-y-2">
              <Label htmlFor="technicien" className="text-sm font-semibold">
                Affecter un technicien (facultatif)
              </Label>
              <Select
                value={technicienId}
                onValueChange={(v) => {
                  setTechnicienId(v);
                  if (errors.technicienId) setErrors((prev) => ({ ...prev, technicienId: '' }));
                }}
                disabled={!datePrevue}
              >
                <SelectTrigger id="technicien">
                  <SelectValue placeholder={datePrevue ? 'Choisir un technicien' : "Sélectionnez d'abord une date"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non affecté</SelectItem>
                  {technicians.map((tech) => {
                    const unavailable = datePrevue && !isTechnicianAvailable(tech.id, datePrevue, interventions);
                    return (
                      <SelectItem key={tech.id} value={String(tech.id)} disabled={!!unavailable}>
                        {tech.prenom} {tech.nom}{unavailable ? ' (indisponible)' : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.technicienId && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.technicienId}
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
