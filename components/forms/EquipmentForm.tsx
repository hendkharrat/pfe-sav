'use client';

import { useEffect, useState } from 'react';
import { Equipment, EquipmentImage } from '@/types';
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
import { EquipmentImageUpload } from '@/components/shared/EquipmentImageUpload';
import { EQUIPMENT_TYPE_LABELS } from '@/lib/constants';

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
    reference: equipment?.reference ?? '',
    type: equipment?.type ?? ('CLIMATISEUR' as const),
    marque: equipment?.marque ?? '',
    modele: equipment?.modele ?? '',
    numeroSerie: equipment?.numeroSerie ?? '',
    description: equipment?.description ?? '',
  });

  const [images, setImages] = useState<EquipmentImage[]>(equipment?.images ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Rehydrate the form from the selected equipment whenever the dialog opens
  useEffect(() => {
    if (!open) return;
    setFormData({
      reference: equipment?.reference ?? '',
      type: equipment?.type ?? ('CLIMATISEUR' as const),
      marque: equipment?.marque ?? '',
      modele: equipment?.modele ?? '',
      numeroSerie: equipment?.numeroSerie ?? '',
      description: equipment?.description ?? '',
    });
    setImages(equipment?.images ?? []);
    setErrors({});
  }, [open, equipment]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.type) newErrors.type = 'Le type est obligatoire';
    if (!formData.marque.trim()) newErrors.marque = 'La marque est obligatoire';
    if (!formData.modele.trim()) newErrors.modele = 'Le modèle est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      reference: '',
      type: 'CLIMATISEUR',
      marque: '',
      modele: '',
      numeroSerie: '',
      description: '',
    });
    setImages([]);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      reference: formData.reference.trim(),
      type: formData.type,
      marque: formData.marque.trim(),
      modele: formData.modele.trim(),
      numeroSerie: formData.numeroSerie.trim(),
      description: formData.description.trim() || undefined,
      images,
    });

    if (!equipment) resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {equipment ? "Modifier l'équipement" : 'Ajouter un équipement'}
          </DialogTitle>
          <DialogDescription>
            {equipment
              ? "Modifiez les informations du catalogue équipement"
              : "Créez un nouvel équipement dans le catalogue"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Référence */}
          <div className="space-y-2">
            <Label htmlFor="reference">Référence</Label>
            <Input
              id="reference"
              value={formData.reference}
              disabled
              placeholder="Généré automatiquement à la création"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Type *</Label>
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
                <SelectItem value="SYSTEME_SURPRESSION">
                  {EQUIPMENT_TYPE_LABELS['SYSTEME_SURPRESSION']}
                </SelectItem>
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
                placeholder="Daikin"
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
                placeholder="FTXS50K"
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description / Spécifications</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              placeholder="Description technique, caractéristiques, puissance..."
              rows={3}
            />
          </div>

          {/* Images */}
          <div className="space-y-2 border-t border-border pt-4">
            <Label>Images de l&apos;équipement</Label>
            <p className="text-xs text-muted-foreground">
              Ajoutez des photos de l&apos;équipement. La première image ajoutée sera définie comme
              image principale.
            </p>
            <EquipmentImageUpload images={images} onChange={setImages} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
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
