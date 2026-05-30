'use client';

import { useState } from 'react';
import { Equipment } from '@/types';
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
import { EQUIPMENT_TYPE_LABELS, EQUIPMENT_STATUS_LABELS } from '@/lib/constants';

interface EquipmentFormProps {
  open: boolean;
  equipment?: Equipment;
  onClose: () => void;
  onSubmit: (data: Omit<Equipment, 'id'>) => void;
  isLoading?: boolean;
}

export function EquipmentForm({
  open,
  equipment,
  onClose,
  onSubmit,
  isLoading = false,
}: EquipmentFormProps) {
  const [formData, setFormData] = useState({
    reference: equipment?.reference || '',
    clientId: equipment?.clientId || '',
    type: equipment?.type || ('CLIMATISEUR' as const),
    marque: equipment?.marque || '',
    modele: equipment?.modele || '',
    numeroSerie: equipment?.numeroSerie || '',
    localisation: equipment?.localisation || '',
    dateInstallation: equipment?.dateInstallation || '',
    statut: equipment?.statut || ('EN_SERVICE' as const),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.reference.trim()) newErrors.reference = 'La référence est obligatoire';
    if (!formData.clientId) newErrors.clientId = 'Le client est obligatoire';
    if (!formData.type) newErrors.type = 'Le type est obligatoire';
    if (!formData.marque.trim()) newErrors.marque = 'La marque est obligatoire';
    if (!formData.modele.trim()) newErrors.modele = 'Le modèle est obligatoire';
    if (!formData.localisation.trim()) newErrors.localisation = 'La localisation est obligatoire';
    if (!formData.dateInstallation) newErrors.dateInstallation = 'La date d\'installation est obligatoire';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      reference: formData.reference,
      clientId: formData.clientId,
      type: formData.type,
      marque: formData.marque,
      modele: formData.modele,
      numeroSerie: formData.numeroSerie || '',
      localisation: formData.localisation,
      dateInstallation: formData.dateInstallation,
      statut: formData.statut,
    });

    setFormData({
      reference: '',
      clientId: '',
      type: 'CLIMATISEUR',
      marque: '',
      modele: '',
      numeroSerie: '',
      localisation: '',
      dateInstallation: '',
      statut: 'EN_SERVICE',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{equipment ? 'Modifier l\'équipement' : 'Ajouter un équipement'}</DialogTitle>
          <DialogDescription>
            {equipment ? 'Modifiez les informations de l\'équipement' : 'Créez un nouvel équipement'}
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
              placeholder="EQ-001"
            />
            {errors.reference && <p className="text-xs text-red-500">{errors.reference}</p>}
          </div>

          {/* Client */}
          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            <Select
              value={formData.clientId}
              onValueChange={(value) => setFormData({ ...formData, clientId: value })}
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

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as 'CLIMATISEUR' | 'SYSTEME_SURPRESSION' })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLIMATISEUR">{EQUIPMENT_TYPE_LABELS['CLIMATISEUR']}</SelectItem>
                <SelectItem value="SYSTEME_SURPRESSION">{EQUIPMENT_TYPE_LABELS['SYSTEME_SURPRESSION']}</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
          </div>

          {/* Marque et Modèle */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marque">Marque *</Label>
              <Input
                id="marque"
                value={formData.marque}
                onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                disabled={isLoading}
                placeholder="CoolMax"
              />
              {errors.marque && <p className="text-xs text-red-500">{errors.marque}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="modele">Modèle *</Label>
              <Input
                id="modele"
                value={formData.modele}
                onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                disabled={isLoading}
                placeholder="3000"
              />
              {errors.modele && <p className="text-xs text-red-500">{errors.modele}</p>}
            </div>
          </div>

          {/* Numéro de série */}
          <div className="space-y-2">
            <Label htmlFor="numeroSerie">Numéro de série</Label>
            <Input
              id="numeroSerie"
              value={formData.numeroSerie}
              onChange={(e) => setFormData({ ...formData, numeroSerie: e.target.value })}
              disabled={isLoading}
              placeholder="SN-2024-001"
            />
          </div>

          {/* Localisation */}
          <div className="space-y-2">
            <Label htmlFor="localisation">Localisation *</Label>
            <Input
              id="localisation"
              value={formData.localisation}
              onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
              disabled={isLoading}
              placeholder="Bureau Étage 2"
            />
            {errors.localisation && <p className="text-xs text-red-500">{errors.localisation}</p>}
          </div>

          {/* Date d'installation */}
          <div className="space-y-2">
            <Label htmlFor="dateInstallation">Date d'installation *</Label>
            <Input
              id="dateInstallation"
              type="date"
              value={formData.dateInstallation}
              onChange={(e) => setFormData({ ...formData, dateInstallation: e.target.value })}
              disabled={isLoading}
            />
            {errors.dateInstallation && (
              <p className="text-xs text-red-500">{errors.dateInstallation}</p>
            )}
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label htmlFor="statut">Statut *</Label>
            <Select
              value={formData.statut}
              onValueChange={(value) =>
                setFormData({ ...formData, statut: value as 'EN_SERVICE' | 'EN_PANNE' | 'HORS_SERVICE' })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN_SERVICE">{EQUIPMENT_STATUS_LABELS['EN_SERVICE']}</SelectItem>
                <SelectItem value="EN_PANNE">{EQUIPMENT_STATUS_LABELS['EN_PANNE']}</SelectItem>
                <SelectItem value="HORS_SERVICE">{EQUIPMENT_STATUS_LABELS['HORS_SERVICE']}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {equipment ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
