'use client';

import { useState } from 'react';
import { Contract } from '@/types';
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
import { mockClients } from '@/data/mock-clients';
import { mockEquipments } from '@/data/mock-equipments';
import { CONTRACT_FREQUENCY_LABELS } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';

interface ContractFormProps {
  open: boolean;
  contract?: Contract;
  onClose: () => void;
  onSubmit: (data: Omit<Contract, 'id'>) => void;
  isLoading?: boolean;
}

export function ContractForm({
  open,
  contract,
  onClose,
  onSubmit,
  isLoading = false,
}: ContractFormProps) {
  const [formData, setFormData] = useState({
    reference: contract?.reference || '',
    clientId: contract?.clientId || '',
    equipementIds: contract?.equipementIds || [],
    dateDebut: contract?.dateDebut || '',
    dateFin: contract?.dateFin || '',
    periodicite: contract?.periodicite || ('MENSUELLE' as const),
    description: contract?.description || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedClient = mockClients.find((c) => c.id === formData.clientId);
  const availableEquipments = mockEquipments.filter((e) => e.clientId === formData.clientId);

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
    if (formData.equipementIds.length === 0) {
      newErrors.equipementIds = 'Au moins un équipement est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Calculer le statut basé sur la date de fin
    const today = new Date();
    const dateFin = new Date(formData.dateFin);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    let statut: 'ACTIF' | 'EXPIRE' | 'BIENTOT_EXPIRE' = 'ACTIF';
    if (dateFin < today) {
      statut = 'EXPIRE';
    } else if (dateFin < thirtyDaysFromNow) {
      statut = 'BIENTOT_EXPIRE';
    }

    onSubmit({
      reference: formData.reference,
      clientId: formData.clientId,
      equipementIds: formData.equipementIds,
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      periodicite: formData.periodicite,
      statut: statut,
      description: formData.description || undefined,
    });

    setFormData({
      reference: '',
      clientId: '',
      equipementIds: [],
      dateDebut: '',
      dateFin: '',
      periodicite: 'MENSUELLE',
      description: '',
    });
  };

  const toggleEquipment = (equipmentId: string) => {
    setFormData((prev) => ({
      ...prev,
      equipementIds: prev.equipementIds.includes(equipmentId)
        ? prev.equipementIds.filter((id) => id !== equipmentId)
        : [...prev.equipementIds, equipmentId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contract ? 'Modifier le contrat' : 'Créer un contrat'}</DialogTitle>
          <DialogDescription>
            {contract
              ? 'Modifiez les informations du contrat'
              : 'Créez un nouveau contrat de maintenance'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
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
                setFormData({ ...formData, clientId: value, equipementIds: [] })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {mockClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.societe}
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
                <SelectItem value="TRIMESTRIELLE">{CONTRACT_FREQUENCY_LABELS['TRIMESTRIELLE']}</SelectItem>
                <SelectItem value="SEMESTRIELLE">
                  {CONTRACT_FREQUENCY_LABELS['SEMESTRIELLE']}
                </SelectItem>
                <SelectItem value="ANNUELLE">{CONTRACT_FREQUENCY_LABELS['ANNUELLE']}</SelectItem>
              </SelectContent>
            </Select>
            {errors.periodicite && <p className="text-xs text-red-500">{errors.periodicite}</p>}
          </div>

          {/* Équipements couverts */}
          <div className="space-y-3 border border-border rounded-lg p-4">
            <Label className="text-sm font-semibold">Équipements couverts *</Label>

            {!formData.clientId ? (
              <p className="text-sm text-muted-foreground italic">
                Veuillez sélectionner un client d'abord
              </p>
            ) : availableEquipments.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Aucun équipement disponible pour ce client
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableEquipments.map((equipment) => (
                  <div key={equipment.id} className="flex items-center gap-2">
                    <Checkbox
                      id={equipment.id}
                      checked={formData.equipementIds.includes(equipment.id)}
                      onCheckedChange={() => toggleEquipment(equipment.id)}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor={equipment.id}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {equipment.reference} - {equipment.marque} {equipment.modele}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {errors.equipementIds && <p className="text-xs text-red-500">{errors.equipementIds}</p>}
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

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {contract ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
