'use client';

import { useState } from 'react';
import { ClientEquipement, Equipment } from '@/types';
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
import { EQUIPMENT_STATUS_LABELS, EQUIPMENT_TYPE_LABELS } from '@/lib/constants';

interface ClientEquipementAssignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  existingAssignments: ClientEquipement[];
  equipments: Equipment[];
  editingAssignment?: ClientEquipement;
  onSubmit: (assignment: ClientEquipement) => void;
}

export function ClientEquipementAssignForm({
  open,
  onOpenChange,
  clientId,
  existingAssignments,
  equipments,
  editingAssignment,
  onSubmit,
}: ClientEquipementAssignFormProps) {
  const isEditing = !!editingAssignment;

  const [formData, setFormData] = useState({
    equipementId: editingAssignment?.equipementId ?? '',
    localisation: editingAssignment?.localisation ?? '',
    dateInstallation: editingAssignment?.dateInstallation ?? '',
    statut: editingAssignment?.statut ?? ('EN_SERVICE' as const),
    notes: editingAssignment?.notes ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // When creating, exclude equipments already assigned to this client.
  // When editing, include the currently selected equipment.
  const alreadyAssignedIds = new Set(
    existingAssignments
      .filter((ce) => !isEditing || ce.id !== editingAssignment?.id)
      .map((ce) => ce.equipementId)
  );
  const availableEquipments = equipments.filter((eq) => !alreadyAssignedIds.has(eq.id));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.equipementId) newErrors.equipementId = "Veuillez sélectionner un équipement";
    if (!formData.localisation.trim()) newErrors.localisation = "La localisation est obligatoire";
    if (!formData.dateInstallation) newErrors.dateInstallation = "La date d'installation est obligatoire";
    if (!formData.statut) newErrors.statut = "Le statut est obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const assignment: ClientEquipement = {
      id: editingAssignment?.id ?? `ce-local-${Date.now()}`,
      clientId,
      equipementId: formData.equipementId,
      localisation: formData.localisation.trim(),
      dateInstallation: formData.dateInstallation,
      statut: formData.statut,
      notes: formData.notes.trim() || undefined,
    };

    onSubmit(assignment);
    onOpenChange(false);
  };

  const handleClose = () => {
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'affectation" : "Affecter un équipement"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations d'installation de cet équipement."
              : "Sélectionnez un équipement et renseignez les informations d'installation chez ce client."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Équipement */}
          <div className="space-y-2">
            <Label>Équipement *</Label>
            <Select
              value={formData.equipementId}
              onValueChange={(v) => setFormData({ ...formData, equipementId: v })}
              disabled={isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un équipement" />
              </SelectTrigger>
              <SelectContent>
                {availableEquipments.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Tous les équipements sont déjà affectés
                  </div>
                ) : (
                  availableEquipments.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.reference} — {eq.modele} ({EQUIPMENT_TYPE_LABELS[eq.type]})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.equipementId && (
              <p className="text-xs text-red-500">{errors.equipementId}</p>
            )}
          </div>

          {/* Localisation */}
          <div className="space-y-2">
            <Label htmlFor="localisation">Localisation chez le client *</Label>
            <Input
              id="localisation"
              value={formData.localisation}
              onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
              placeholder="Bureau Étage 2, Salle serveurs..."
            />
            {errors.localisation && (
              <p className="text-xs text-red-500">{errors.localisation}</p>
            )}
          </div>

          {/* Date d'installation */}
          <div className="space-y-2">
            <Label htmlFor="dateInstallation">Date d&apos;installation *</Label>
            <Input
              id="dateInstallation"
              type="date"
              value={formData.dateInstallation}
              onChange={(e) => setFormData({ ...formData, dateInstallation: e.target.value })}
            />
            {errors.dateInstallation && (
              <p className="text-xs text-red-500">{errors.dateInstallation}</p>
            )}
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label>Statut chez le client *</Label>
            <Select
              value={formData.statut}
              onValueChange={(v) =>
                setFormData({ ...formData, statut: v as 'EN_SERVICE' | 'EN_PANNE' | 'HORS_SERVICE' })
              }
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
            {errors.statut && <p className="text-xs text-red-500">{errors.statut}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Remarques, informations complémentaires..."
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? "Enregistrer" : "Affecter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
