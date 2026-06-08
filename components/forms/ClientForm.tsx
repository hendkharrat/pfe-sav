'use client';

import { useState } from 'react';
import { Client, ClientEquipement, ClientType } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ClientEquipementAssignForm } from '@/components/forms/ClientEquipementAssignForm';
import { mockClientEquipements } from '@/data/mock-client-equipements';
import { mockEquipments } from '@/data/mock-equipments';
import { EQUIPMENT_TYPE_LABELS, TUNISIAN_CITIES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { findActiveContractForClientEquipement } from '@/lib/interventions';
import { mockContracts } from '@/data/mock-contracts';
import { EquipmentThumbnail } from '@/components/shared/EquipmentThumbnail';
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
    typeClient: (client?.typeClient ?? 'SOCIETE') as ClientType,
    societe: client?.societe ?? '',
    contact: client?.contact ?? '',
    prenom: client?.prenom ?? '',
    nom: client?.nom ?? '',
    email: client?.email ?? '',
    telephone: client?.telephone ?? '',
    adresse: client?.adresse ?? '',
    ville: client?.ville ?? '',
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

  const isCreating = !client?.id;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.typeClient === 'SOCIETE') {
      if (!formData.societe.trim()) newErrors.societe = 'La société est obligatoire';
    } else {
      if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est obligatoire';
      if (!formData.nom.trim()) newErrors.nom = 'Le nom est obligatoire';
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setFormData({ typeClient: 'SOCIETE', societe: '', contact: '', prenom: '', nom: '', email: '', telephone: '', adresse: '', ville: '' });
    setAssignments([]);
    setErrors({});
    setIsAssignFormOpen(false);
    setEditingAssignment(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const { typeClient, societe, contact, prenom, nom, ...shared } = formData;
    const clientData: Omit<Client, 'id' | 'dateCreation' | 'nombreEquipements' | 'userId'> =
      typeClient === 'SOCIETE'
        ? { typeClient, societe: societe || undefined, contact: contact || undefined, ...shared }
        : { typeClient, prenom: prenom || undefined, nom: nom || undefined, ...shared };
    onSubmit({ clientData, assignments });
    if (!client) reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleTypeChange = (value: ClientType) => {
    setFormData((prev) =>
      value === 'SOCIETE'
        ? { ...prev, typeClient: value, prenom: '', nom: '' }
        : { ...prev, typeClient: value, societe: '', contact: '' }
    );
    setErrors({});
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

  const isSociete = formData.typeClient === 'SOCIETE';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-7xl sm:max-w-7xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Modifier le client' : 'Ajouter un client'}</DialogTitle>
          <DialogDescription>
            {client
              ? 'Modifiez les informations du client et ses équipements affectés'
              : 'Renseignez les informations du client et affectez des équipements si nécessaire'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Type de client */}
          <div className="space-y-2">
            <Label htmlFor="typeClient">Type de client *</Label>
            <Select
              value={formData.typeClient}
              onValueChange={(v) => handleTypeChange(v as ClientType)}
              disabled={isLoading}
            >
              <SelectTrigger id="typeClient">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOCIETE">Société</SelectItem>
                <SelectItem value="PERSONNE_PHYSIQUE">Personne physique</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Société fields */}
          {isSociete ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="societe">Société *</Label>
                <Input
                  id="societe"
                  value={formData.societe}
                  onChange={(e) => setFormData({ ...formData, societe: e.target.value })}
                  disabled={isLoading}
                  placeholder="EDI Solutions SARL"
                />
                {errors.societe && <p className="text-xs text-red-500">{errors.societe}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  disabled={isLoading}
                  placeholder="Ahmed Ben Salah"
                />
              </div>
            </>
          ) : (
            /* Personne physique fields */
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  disabled={isLoading}
                  placeholder="Ahmed"
                />
                {errors.prenom && <p className="text-xs text-red-500">{errors.prenom}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  disabled={isLoading}
                  placeholder="Ben Salah"
                />
                {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
              </div>
            </div>
          )}

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

          {/* Ville / Pays */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ville</Label>
              <Select
                value={formData.ville}
                onValueChange={(v) => setFormData({ ...formData, ville: v })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une ville" />
                </SelectTrigger>
                <SelectContent>
                  {TUNISIAN_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pays</Label>
              <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
                Tunisie
              </div>
            </div>
          </div>

          {/* ── Équipements affectés ── */}
          <div className="border-t border-border pt-4 space-y-3 min-w-0">
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
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[720px] text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="px-2 py-2" />
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Équipement</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Type</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Localisation</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Installation</th>
                      {!isCreating && <th className="text-left px-3 py-2 font-medium text-muted-foreground">Contrat</th>}
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((ce) => {
                      const eq = mockEquipments.find((e) => e.id === ce.equipementId);
                      const activeContract = client?.id
                        ? findActiveContractForClientEquipement(ce.id, client.id, mockContracts)
                        : undefined;
                      return (
                        <tr key={ce.id} className="border-b border-border last:border-0">
                          <td className="px-2 py-1.5">
                            <EquipmentThumbnail equipment={eq} size="sm" />
                          </td>
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
                          {!isCreating && (
                            <td className="px-3 py-2">
                              {activeContract ? (
                                <div className="space-y-0.5">
                                  <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px] h-5 font-medium">
                                    Sous contrat
                                  </Badge>
                                  <p className="text-[10px] text-muted-foreground leading-none">
                                    {activeContract.reference}
                                  </p>
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground text-[10px] h-5">
                                  Hors contrat
                                </Badge>
                              )}
                            </td>
                          )}
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
