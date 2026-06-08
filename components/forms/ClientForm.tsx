'use client';

import { useState } from 'react';
import { Client, ClientEquipement } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ClientEquipementAssignForm } from '@/components/forms/ClientEquipementAssignForm';
import { mockClientEquipements } from '@/data/mock-client-equipements';
import { mockEquipments } from '@/data/mock-equipments';
import { EQUIPMENT_TYPE_LABELS, EQUIPMENT_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { Plus, Edit2, Trash2, PackageOpen } from 'lucide-react';

export type ClientFormPayload = {
  clientData: Omit<Client, 'id' | 'dateCreation' | 'nombreEquipements' | 'userId'>;
  assignments: ClientEquipement[];
};

interface ClientFormProps {
  open: boolean;
  client?: Client;
  onClose: () => void;
  onSubmit: (payload: ClientFormPayload) => void;
  isLoading?: boolean;
  clientEquipements?: ClientEquipement[];
}

export function ClientForm({ open, client, onClose, onSubmit, isLoading = false, clientEquipements = mockClientEquipements }: ClientFormProps) {
  const [formData, setFormData] = useState({
    societe: client?.societe ?? '',
    contact: client?.contact ?? '',
    email: client?.email ?? '',
    telephone: client?.telephone ?? '',
    adresse: client?.adresse ?? '',
    ville: client?.ville ?? '',
    codePostal: client?.codePostal ?? '',
  });

  // Initialize assignments from live session state for edit mode
  const [assignments, setAssignments] = useState<ClientEquipement[]>(() =>
    client
      ? clientEquipements.filter((ce) => ce.clientId === client.id)
      : []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAssignFormOpen, setIsAssignFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ClientEquipement | undefined>();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.societe.trim()) newErrors.societe = 'La société/nom est obligatoire';
    if (!formData.contact.trim()) newErrors.contact = 'Le contact est obligatoire';
    if (!formData.email.trim()) {
      newErrors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setFormData({ societe: '', contact: '', email: '', telephone: '', adresse: '', ville: '', codePostal: '' });
    setAssignments([]);
    setErrors({});
    setIsAssignFormOpen(false);
    setEditingAssignment(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({ clientData: formData, assignments });
    if (!client) reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAssignmentSubmit = (ce: ClientEquipement) => {
    setAssignments((prev) => {
      const exists = prev.find((a) => a.id === ce.id);
      return exists ? prev.map((a) => (a.id === ce.id ? ce : a)) : [...prev, ce];
    });
  };

  const handleRemoveAssignment = (id: string) => {
    if (!window.confirm('Retirer cet équipement de l\'affectation client ?')) return;
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleEditAssignment = (ce: ClientEquipement) => {
    setEditingAssignment(ce);
    setIsAssignFormOpen(true);
  };

  const openAddAssignment = () => {
    setEditingAssignment(undefined);
    setIsAssignFormOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Modifier le client' : 'Ajouter un client'}</DialogTitle>
          <DialogDescription>
            {client
              ? 'Modifiez les informations du client et ses équipements affectés'
              : 'Renseignez les informations du client et affectez des équipements si nécessaire'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Société */}
          <div className="space-y-2">
            <Label htmlFor="societe">Société/Nom *</Label>
            <Input
              id="societe"
              value={formData.societe}
              onChange={(e) => setFormData({ ...formData, societe: e.target.value })}
              disabled={isLoading}
              placeholder="Société Médina SARL"
            />
            {errors.societe && <p className="text-xs text-red-500">{errors.societe}</p>}
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <Label htmlFor="contact">Contact *</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              disabled={isLoading}
              placeholder="Ahmed Ben Salah"
            />
            {errors.contact && <p className="text-xs text-red-500">{errors.contact}</p>}
          </div>

          {/* Email / Téléphone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                placeholder="contact@example.tn"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                disabled={isLoading}
                placeholder="+216 71 234 567"
              />
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              disabled={isLoading}
              placeholder="Rue du Lac Biwa, Les Berges du Lac"
            />
          </div>

          {/* Ville / Code postal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input
                id="ville"
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                disabled={isLoading}
                placeholder="Tunis"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codePostal">Code postal</Label>
              <Input
                id="codePostal"
                value={formData.codePostal}
                onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                disabled={isLoading}
                placeholder="1001"
              />
            </div>
          </div>

          {/* ── Équipements affectés ── */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageOpen size={15} className="text-muted-foreground" />
                <span className="font-medium text-sm">
                  Équipements affectés
                  {assignments.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {assignments.length}
                    </Badge>
                  )}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 h-7 text-xs"
                onClick={openAddAssignment}
                disabled={isLoading}
              >
                <Plus size={12} />
                Ajouter un équipement
              </Button>
            </div>

            {assignments.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                Aucun équipement affecté. Cliquez sur « Ajouter un équipement » pour en assigner.
              </p>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Équipement</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Type</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Localisation</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Installation</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Statut</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((ce) => {
                      const eq = mockEquipments.find((e) => e.id === ce.equipementId);
                      return (
                        <tr key={ce.id} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 font-medium">
                            {eq ? `${eq.reference} — ${eq.modele}` : ce.equipementId}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {eq ? EQUIPMENT_TYPE_LABELS[eq.type] : '—'}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{ce.localisation}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {formatDate(ce.dateInstallation)}
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-[10px] h-4">
                              {EQUIPMENT_STATUS_LABELS[ce.statut]}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleEditAssignment(ce)}
                              >
                                <Edit2 size={11} />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveAssignment(ce.id)}
                              >
                                <Trash2 size={11} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Traitement...' : client ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>

      {/* Assignment sub-form */}
      <ClientEquipementAssignForm
        open={isAssignFormOpen}
        onOpenChange={(v) => {
          setIsAssignFormOpen(v);
          if (!v) setEditingAssignment(undefined);
        }}
        clientId={client?.id ?? ''}
        existingAssignments={assignments}
        equipments={mockEquipments}
        editingAssignment={editingAssignment}
        onSubmit={handleAssignmentSubmit}
      />
    </Dialog>
  );
}
