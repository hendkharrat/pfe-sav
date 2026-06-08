'use client';

import { useEffect, useState } from 'react';
import { Intervention, InterventionType } from '@/types';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockClients } from '@/data/mock-clients';
import { getClientDisplayName } from '@/lib/utils';
import { mockClientEquipements } from '@/data/mock-client-equipements';
import { INTERVENTION_TYPE_LABELS } from '@/lib/constants';
import {
  getActiveTechnicians,
  getClientEquipements,
  getClientEquipementByEquipmentAndClient,
  getEquipementForClientEquipement,
  findActiveContractForClientEquipement,
  isTechnicianAvailable,
  TECHNICIAN_UNAVAILABLE_MESSAGE,
} from '@/lib/interventions';

export interface InterventionFormData {
  type: InterventionType;
  clientId: string;
  equipementId: string;
  clientEquipementId?: string;
  technicienId?: string;
  contractId?: string;
  datePrevue: string;
  description: string;
  couvertureContrat: boolean;
}

interface InterventionFormProps {
  open: boolean;
  intervention?: Intervention;
  interventions: Intervention[];
  onClose: () => void;
  onSubmit: (data: InterventionFormData) => void;
  isLoading?: boolean;
}

function FormField({
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
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function InterventionForm({
  open,
  intervention,
  interventions,
  onClose,
  onSubmit,
  isLoading = false,
}: InterventionFormProps) {
  const [formData, setFormData] = useState({
    type: intervention?.type ?? ('PREVENTIVE' as InterventionType),
    clientId: intervention?.clientId ?? '',
    clientEquipementId: intervention?.clientEquipementId ?? '',
    equipementId: intervention?.equipementId ?? '',
    technicienId: intervention?.technicienId,
    contractId: intervention?.contractId,
    datePrevue: intervention?.datePrevue ?? '',
    description: intervention?.description ?? '',
    couvertureContrat: intervention?.couvertureContrat ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      // Derive CE id from intervention — prefer explicit field, fall back to pair lookup
      let ceId = intervention?.clientEquipementId ?? '';
      if (!ceId && intervention?.clientId && intervention?.equipementId) {
        const ce = getClientEquipementByEquipmentAndClient(
          intervention.clientId,
          intervention.equipementId
        );
        ceId = ce?.id ?? '';
      }
      setFormData({
        type: intervention?.type ?? 'PREVENTIVE',
        clientId: intervention?.clientId ?? '',
        clientEquipementId: ceId,
        equipementId: intervention?.equipementId ?? '',
        technicienId: intervention?.technicienId,
        contractId: intervention?.contractId,
        datePrevue: intervention?.datePrevue ?? '',
        description: intervention?.description ?? '',
        couvertureContrat: intervention?.couvertureContrat ?? false,
      });
      setErrors({});
    }
  }, [open, intervention]);

  const availableCEs = getClientEquipements(formData.clientId);
  const technicians = getActiveTechnicians();

  const updateCoverage = (ceId: string, clientId: string) => {
    if (!ceId || !clientId) {
      setFormData((prev) => ({ ...prev, couvertureContrat: false, contractId: undefined }));
      return;
    }
    const contract = findActiveContractForClientEquipement(ceId, clientId);
    setFormData((prev) => ({
      ...prev,
      couvertureContrat: contract !== undefined,
      contractId: contract?.id,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) newErrors.type = 'Le type est obligatoire';
    if (!formData.clientId) newErrors.clientId = 'Le client est obligatoire';
    if (!formData.equipementId) {
      newErrors.equipementId = "L'équipement est obligatoire";
    }
    if (!formData.datePrevue) {
      newErrors.datePrevue = 'La date prévue est obligatoire';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    }

    if (
      formData.technicienId &&
      formData.datePrevue &&
      !isTechnicianAvailable(
        formData.technicienId,
        formData.datePrevue,
        interventions,
        intervention?.id
      )
    ) {
      newErrors.technicienId = TECHNICIAN_UNAVAILABLE_MESSAGE;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({
      type: formData.type,
      clientId: formData.clientId,
      equipementId: formData.equipementId,
      clientEquipementId: formData.clientEquipementId || undefined,
      technicienId: formData.technicienId,
      contractId: formData.contractId,
      datePrevue: formData.datePrevue,
      description: formData.description,
      couvertureContrat: formData.couvertureContrat,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {intervention ? "Modifier l'intervention" : 'Nouvelle intervention'}
          </DialogTitle>
          <DialogDescription>
            {intervention
              ? "Modifiez les informations de l'intervention"
              : 'Créez une nouvelle intervention technique'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <FormField label="Type *" error={errors.type}>
            <Select
              value={formData.type}
              onValueChange={(value: InterventionType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INTERVENTION_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Client *" error={errors.clientId}>
            <Select
              value={formData.clientId}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  clientId: value,
                  clientEquipementId: '',
                  equipementId: '',
                  couvertureContrat: false,
                  contractId: undefined,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {mockClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {getClientDisplayName(client)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Équipement *" error={errors.equipementId}>
            <Select
              value={formData.clientEquipementId}
              disabled={!formData.clientId}
              onValueChange={(ceId) => {
                const ce = mockClientEquipements.find((c) => c.id === ceId);
                const eqId = ce?.equipementId ?? '';
                setFormData({ ...formData, clientEquipementId: ceId, equipementId: eqId });
                updateCoverage(ceId, formData.clientId);
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    formData.clientId
                      ? 'Sélectionner un équipement'
                      : "Sélectionnez d'abord un client"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableCEs.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    Aucun équipement affecté à ce client
                  </SelectItem>
                ) : (
                  availableCEs.map((ce) => {
                    const eq = getEquipementForClientEquipement(ce.id);
                    const label = eq
                      ? `${eq.reference} — ${eq.marque} ${eq.modele} (${ce.localisation})`
                      : ce.equipementId;
                    return (
                      <SelectItem key={ce.id} value={ce.id}>
                        {label}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
            {formData.clientId && availableCEs.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Ce client n&apos;a aucun équipement affecté. Rendez-vous sur la fiche client pour en affecter.
              </p>
            )}
          </FormField>

          <div className="rounded-lg border border-border p-3 bg-muted/30 space-y-1">
            <p className="text-sm font-medium">Couverture contrat</p>
            <p className="text-sm">
              {formData.couvertureContrat ? (
                <span className="text-green-700">
                  Couvert par un contrat actif
                  {formData.contractId ? ` (${formData.contractId})` : ''}
                </span>
              ) : (
                <span className="text-muted-foreground">Hors contrat</span>
              )}
            </p>
          </div>

          <FormField label="Date prévue *" error={errors.datePrevue}>
            <Input
              type="date"
              value={formData.datePrevue}
              onChange={(e) =>
                setFormData({ ...formData, datePrevue: e.target.value })
              }
            />
          </FormField>

          <FormField label="Technicien" error={errors.technicienId}>
            <Select
              value={formData.technicienId ?? 'none'}
              disabled={!formData.datePrevue}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  technicienId: value === 'none' ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Non affecté" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Non affecté</SelectItem>
                {technicians.map((tech) => {
                  const available = formData.datePrevue
                    ? isTechnicianAvailable(tech.id, formData.datePrevue, interventions, intervention?.id)
                    : true;
                  return (
                    <SelectItem key={tech.id} value={tech.id} disabled={!available}>
                      {tech.prenom} {tech.nom} — {available ? 'Disponible' : 'Occupé ce jour'}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {!formData.datePrevue && (
              <p className="text-xs text-muted-foreground mt-1">
                Sélectionnez d&apos;abord une date pour vérifier la disponibilité des techniciens.
              </p>
            )}
          </FormField>

          <FormField label="Description *" error={errors.description}>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Décrivez l'intervention à réaliser..."
            />
          </FormField>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Enregistrement...' : intervention ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
