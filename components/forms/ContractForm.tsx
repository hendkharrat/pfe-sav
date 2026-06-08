'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Contract,
  ClientEquipement,
  Intervention,
  PreventiveInterventionPreview,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Checkbox } from '@/components/ui/checkbox';
import { mockClients } from '@/data/mock-clients';
import { mockClientEquipements } from '@/data/mock-client-equipements';
import { CONTRACT_FREQUENCY_LABELS } from '@/lib/constants';
import { getClientDisplayName } from '@/lib/utils';
import {
  generatePreventiveInterventionPreviews,
  getClientEquipementLabel,
} from '@/lib/interventions';
import { PreventiveInterventionPreviewTable } from '@/components/shared/PreventiveInterventionPreviewTable';

export type ContractFormSubmitPayload = {
  contract: Omit<Contract, 'id'>;
  preventiveInterventions: PreventiveInterventionPreview[];
};

interface ContractFormProps {
  open: boolean;
  contract?: Contract;
  onClose: () => void;
  onSubmit: (payload: ContractFormSubmitPayload) => void;
  isLoading?: boolean;
  clientEquipements?: ClientEquipement[];
  interventions?: Intervention[];
}

export function ContractForm({
  open,
  contract,
  onClose,
  onSubmit,
  isLoading = false,
  clientEquipements = mockClientEquipements,
  interventions,
}: ContractFormProps) {
  const [formData, setFormData] = useState({
    reference: contract?.reference ?? '',
    clientId: contract?.clientId ?? '',
    clientEquipementIds: contract?.clientEquipementIds ?? [],
    dateDebut: contract?.dateDebut ?? '',
    dateFin: contract?.dateFin ?? '',
    periodicite: contract?.periodicite ?? ('MENSUELLE' as const),
    description: contract?.description ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewRows, setPreviewRows] = useState<PreventiveInterventionPreview[]>([]);

  const availableCEs = useMemo(
    () => clientEquipements.filter((ce) => ce.clientId === formData.clientId),
    [clientEquipements, formData.clientId]
  );

  // Stable string key capturing all preview-relevant fields
  const previewTrigger = useMemo(
    () =>
      [
        formData.clientId,
        formData.dateDebut,
        formData.dateFin,
        formData.periodicite,
        [...formData.clientEquipementIds].sort().join(','),
      ].join('|'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formData.clientId, formData.dateDebut, formData.dateFin, formData.periodicite, formData.clientEquipementIds]
  );

  // Regenerate previews (create mode only) when key fields change
  useEffect(() => {
    if (contract) {
      setPreviewRows([]);
      return;
    }
    const { clientId, dateDebut, dateFin, periodicite, clientEquipementIds } = formData;
    if (
      !clientId ||
      !dateDebut ||
      !dateFin ||
      dateFin <= dateDebut ||
      clientEquipementIds.length === 0
    ) {
      setPreviewRows([]);
      return;
    }
    const generated = generatePreventiveInterventionPreviews({
      clientId,
      clientEquipementIds,
      dateDebut,
      dateFin,
      periodicite,
    });
    setPreviewRows(generated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewTrigger, !!contract]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.reference.trim()) newErrors.reference = 'La référence est obligatoire';
    if (!formData.clientId) newErrors.clientId = 'Le client est obligatoire';
    if (!formData.dateDebut) newErrors.dateDebut = 'La date de début est obligatoire';
    if (!formData.dateFin) newErrors.dateFin = 'La date de fin est obligatoire';
    if (formData.dateFin && formData.dateDebut && formData.dateFin <= formData.dateDebut) {
      newErrors.dateFin = 'La date de fin doit être après la date de début';
    }
    if (!formData.periodicite) newErrors.periodicite = 'La périodicité est obligatoire';
    if (formData.clientEquipementIds.length === 0) {
      newErrors.clientEquipementIds = 'Au moins une installation est obligatoire';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const today = new Date();
    const dateFin = new Date(formData.dateFin);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    let statut: 'ACTIF' | 'EXPIRE' | 'BIENTOT_EXPIRE' = 'ACTIF';
    if (dateFin < today) statut = 'EXPIRE';
    else if (dateFin < thirtyDaysFromNow) statut = 'BIENTOT_EXPIRE';

    onSubmit({
      contract: {
        reference: formData.reference,
        clientId: formData.clientId,
        clientEquipementIds: formData.clientEquipementIds,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        periodicite: formData.periodicite,
        statut,
        description: formData.description || undefined,
      },
      preventiveInterventions: previewRows,
    });

    setFormData({
      reference: '',
      clientId: '',
      clientEquipementIds: [],
      dateDebut: '',
      dateFin: '',
      periodicite: 'MENSUELLE',
      description: '',
    });
    setPreviewRows([]);
  };

  const toggleCE = (ceId: string) => {
    setFormData((prev) => ({
      ...prev,
      clientEquipementIds: prev.clientEquipementIds.includes(ceId)
        ? prev.clientEquipementIds.filter((id) => id !== ceId)
        : [...prev.clientEquipementIds, ceId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-7xl sm:max-w-7xl h-[92vh] max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle>{contract ? 'Modifier le contrat' : 'Créer un contrat'}</DialogTitle>
          <DialogDescription>
            {contract
              ? 'Modifiez les informations du contrat'
              : 'Créez un nouveau contrat de maintenance'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto px-6 py-4 space-y-6">
          {/* Référence */}
          <div className="space-y-2">
            <Label htmlFor="reference">Référence *</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              disabled={isLoading}
              placeholder="CTR-001"
            />
            {errors.reference && <p className="text-xs text-red-500">{errors.reference}</p>}
          </div>

          {/* Client */}
          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            <Select
              value={formData.clientId}
              onValueChange={(value) =>
                setFormData({ ...formData, clientId: value, clientEquipementIds: [] })
              }
              disabled={isLoading}
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
            {errors.clientId && <p className="text-xs text-red-500">{errors.clientId}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateDebut">Date de début *</Label>
              <Input
                id="dateDebut"
                type="date"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                disabled={isLoading}
              />
              {errors.dateDebut && <p className="text-xs text-red-500">{errors.dateDebut}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFin">Date de fin *</Label>
              <Input
                id="dateFin"
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                disabled={isLoading}
              />
              {errors.dateFin && <p className="text-xs text-red-500">{errors.dateFin}</p>}
            </div>
          </div>

          {/* Périodicité */}
          <div className="space-y-2">
            <Label htmlFor="periodicite">Périodicité *</Label>
            <Select
              value={formData.periodicite}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  periodicite: value as 'MENSUELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE',
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MENSUELLE">{CONTRACT_FREQUENCY_LABELS['MENSUELLE']}</SelectItem>
                <SelectItem value="TRIMESTRIELLE">
                  {CONTRACT_FREQUENCY_LABELS['TRIMESTRIELLE']}
                </SelectItem>
                <SelectItem value="SEMESTRIELLE">
                  {CONTRACT_FREQUENCY_LABELS['SEMESTRIELLE']}
                </SelectItem>
                <SelectItem value="ANNUELLE">{CONTRACT_FREQUENCY_LABELS['ANNUELLE']}</SelectItem>
              </SelectContent>
            </Select>
            {errors.periodicite && <p className="text-xs text-red-500">{errors.periodicite}</p>}
          </div>

          {/* Installations couvertes (via ClientEquipement) */}
          <div className="space-y-3 border border-border rounded-lg p-4">
            <Label className="text-sm font-semibold">Installations couvertes *</Label>

            {!formData.clientId ? (
              <p className="text-sm text-muted-foreground italic">
                Veuillez sélectionner un client d'abord
              </p>
            ) : availableCEs.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Aucune installation affectée à ce client — ajoutez des équipements depuis la fiche client
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableCEs.map((ce) => {
                  const label = getClientEquipementLabel(ce.id, clientEquipements);
                  return (
                    <div key={ce.id} className="flex items-center gap-2">
                      <Checkbox
                        id={ce.id}
                        checked={formData.clientEquipementIds.includes(ce.id)}
                        onCheckedChange={() => toggleCE(ce.id)}
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor={ce.id}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {errors.clientEquipementIds && (
              <p className="text-xs text-red-500">{errors.clientEquipementIds}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description / Notes</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              placeholder="Notes sur le contrat..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md text-sm font-sans"
            />
          </div>

          {/* Preventive planning (create mode only, shown when previews are ready) */}
          {!contract && previewRows.length > 0 && (
            <div className="space-y-3 border border-border rounded-lg p-4 bg-muted/20">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Planification préventive</Label>
                <p className="text-xs text-muted-foreground">
                  Ces interventions seront créées automatiquement à la validation du contrat.
                  L'affectation des techniciens est optionnelle.
                </p>
              </div>
              <div className="overflow-x-auto">
                <PreventiveInterventionPreviewTable
                  previews={previewRows}
                  onChange={setPreviewRows}
                  interventions={interventions}
                />
              </div>
            </div>
          )}

          </div>

          {/* Actions */}
          <div className="shrink-0 border-t border-border px-6 py-4 flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {contract
                ? 'Modifier'
                : previewRows.length > 0
                  ? `Créer (${previewRows.length} intervention${previewRows.length > 1 ? 's' : ''})`
                  : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
