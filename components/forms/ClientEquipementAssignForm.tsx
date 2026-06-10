'use client';

import { useState } from 'react';
import { Client, ClientEquipement, Equipment } from '@/types';
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
import { EQUIPMENT_TYPE_LABELS } from '@/lib/constants';
import { getClientDisplayName } from '@/lib/utils';

interface ClientEquipementAssignFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fixed when called from the client side. Pass '' when using fixedEquipementId mode. */
  clientId: string;
  existingAssignments: ClientEquipement[];
  equipments: Equipment[];
  editingAssignment?: ClientEquipement;
  onSubmit: (assignment: ClientEquipement) => void;
  /** When set, hides the equipment select and shows a client select instead. */
  fixedEquipementId?: string;
  /** Required when fixedEquipementId is set — list of clients for selection. */
  clients?: Client[];
}

const today = () => new Date().toISOString().split('T')[0];

export function ClientEquipementAssignForm({
  open,
  onOpenChange,
  clientId,
  existingAssignments,
  equipments,
  editingAssignment,
  onSubmit,
  fixedEquipementId,
  clients,
}: ClientEquipementAssignFormProps) {
  const isEditing = !!editingAssignment;
  const isEquipmentMode = !!fixedEquipementId;

  const [formData, setFormData] = useState({
    equipementId: editingAssignment?.equipementId ?? (fixedEquipementId ?? ''),
    selectedClientId: '',
    dateAchat: editingAssignment?.dateAchat ?? today(),
    localisation: editingAssignment?.localisation ?? '',
    dateInstallation: editingAssignment?.dateInstallation ?? '',
    notes: editingAssignment?.notes ?? '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Client-side mode: which equipment IDs are already assigned to this client
  const alreadyAssignedEquipmentIds = new Set(
    existingAssignments
      .filter((ce) => !isEditing || ce.id !== editingAssignment?.id)
      .map((ce) => ce.equipementId)
  );
  const availableEquipments = equipments.filter(
    (eq) => !alreadyAssignedEquipmentIds.has(eq.id)
  );

  // Equipment-side mode: which client IDs already have this equipment assigned
  const alreadyAssignedClientIds = new Set(existingAssignments.map((ce) => ce.clientId));
  const availableClients = (clients ?? []).filter(
    (c) => !alreadyAssignedClientIds.has(c.id)
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (isEquipmentMode) {
      if (!formData.selectedClientId) newErrors.selectedClientId = 'Veuillez sélectionner un client';
    } else {
      if (!formData.equipementId) newErrors.equipementId = 'Veuillez sélectionner un équipement';
    }
    if (!formData.dateAchat) newErrors.dateAchat = "La date d'achat est obligatoire";
    if (!formData.dateInstallation) newErrors.dateInstallation = "La date d'installation est obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const assignment: ClientEquipement = {
      id: editingAssignment?.id ?? `ce-local-${Date.now()}`,
      clientId: isEquipmentMode ? formData.selectedClientId : clientId,
      equipementId: isEquipmentMode ? (fixedEquipementId as string) : formData.equipementId,
      dateAchat: formData.dateAchat || undefined,
      localisation: formData.localisation.trim() || undefined,
      dateInstallation: formData.dateInstallation,
      notes: formData.notes.trim() || undefined,
    };

    onSubmit(assignment);
    onOpenChange(false);
  };

  const handleClose = () => {
    setErrors({});
    setFormData({
      equipementId: fixedEquipementId ?? '',
      selectedClientId: '',
      dateAchat: today(),
      localisation: '',
      dateInstallation: '',
      notes: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'affectation" : 'Affecter un équipement'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations d'installation de cet équipement."
              : isEquipmentMode
              ? 'Sélectionnez un client et renseignez les informations d\'installation pour cet équipement.'
              : "Sélectionnez un équipement et renseignez les informations d'installation chez ce client."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Row 1: Date d'achat + Client (equipment mode) or Équipement (client mode) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateAchat">Date d&apos;achat *</Label>
              <Input
                id="dateAchat"
                type="date"
                value={formData.dateAchat}
                onChange={(e) => setFormData({ ...formData, dateAchat: e.target.value })}
              />
              {errors.dateAchat && (
                <p className="text-xs text-red-500">{errors.dateAchat}</p>
              )}
            </div>

            {isEquipmentMode ? (
              /* Equipment-side mode: select client */
              <div className="space-y-2">
                <Label>Client *</Label>
                <Select
                  value={formData.selectedClientId}
                  onValueChange={(v) => setFormData({ ...formData, selectedClientId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClients.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Tous les clients ont déjà cet équipement
                      </div>
                    ) : (
                      availableClients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {getClientDisplayName(c)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.selectedClientId && (
                  <p className="text-xs text-red-500">{errors.selectedClientId}</p>
                )}
              </div>
            ) : (
              /* Client-side mode: select equipment */
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
            )}
          </div>

          {/* Row 2: Date d'installation / Localisation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="localisation">Localisation chez le client</Label>
              <Input
                id="localisation"
                value={formData.localisation}
                onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                placeholder="Bureau Étage 2, Salle serveurs... (facultatif)"
              />
            </div>
          </div>

          {/* Row 3: Notes */}
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
              {isEditing ? 'Enregistrer' : 'Affecter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
