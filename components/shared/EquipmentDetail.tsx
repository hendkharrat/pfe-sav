'use client';

import { useState } from 'react';
import { Client, ClientEquipement, Equipment } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockClientEquipements } from '@/data/mock-client-equipements';
import { mockClients } from '@/data/mock-clients';
import { EQUIPMENT_TYPE_LABELS } from '@/lib/constants';
import { formatDate, getClientDisplayName } from '@/lib/utils';
import { ImageIcon, MapPin, Calendar, Building2, Plus, Trash2 } from 'lucide-react';
import { ClientEquipementAssignForm } from '@/components/forms/ClientEquipementAssignForm';

interface EquipmentDetailProps {
  open: boolean;
  equipment: Equipment | null;
  onClose: () => void;
  /** Live CE state from the parent page. Falls back to mockClientEquipements. */
  clientEquipements?: ClientEquipement[];
  /** Client list for the assign form. Falls back to mockClients. */
  clients?: Client[];
  /** Equipment list passed to the assign form. Falls back to []. */
  equipments?: Equipment[];
  /** Called when a new assignment is created. Omit to make the section read-only. */
  onAddClientEquipement?: (ce: ClientEquipement) => void;
  /** Called when an assignment row is removed. */
  onRemoveClientEquipement?: (ceId: number) => void;
}

export function EquipmentDetail({
  open,
  equipment,
  onClose,
  clientEquipements: clientEquipementsProp,
  clients: clientsProp,
  equipments: equipmentsProp,
  onAddClientEquipement,
  onRemoveClientEquipement,
}: EquipmentDetailProps) {
  const [isAssignFormOpen, setIsAssignFormOpen] = useState(false);

  if (!equipment) return null;

  const clientEquipements = clientEquipementsProp ?? mockClientEquipements;
  const clients = clientsProp ?? mockClients;
  const equipments = equipmentsProp ?? [];

  const mainImage = equipment.images?.find((img) => img.isMain);
  const otherImages = equipment.images?.filter((img) => !img.isMain) ?? [];

  const affectations = clientEquipements
    .filter((ce) => ce.equipementId === equipment.id)
    .map((ce) => ({
      ce,
      client: clients.find((c) => c.id === ce.clientId),
    }));

  const handleRemove = (ceId: number) => {
    if (!window.confirm('Retirer cette affectation client ?')) return;
    onRemoveClientEquipement?.(ceId);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="w-[96vw] max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fiche équipement</DialogTitle>
          <DialogDescription>Informations détaillées de l&apos;équipement catalogue</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Image gallery */}
          {mainImage ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainImage.previewUrl}
                alt={mainImage.filename}
                className="w-full max-h-52 object-cover rounded-lg border border-border"
              />
              {otherImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {otherImages.map((img) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={img.id}
                      src={img.previewUrl}
                      alt={img.filename}
                      className="h-16 w-24 object-cover rounded border border-border flex-shrink-0"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 py-4 px-4 rounded-lg border border-dashed border-border text-muted-foreground">
              <ImageIcon size={20} />
              <span className="text-sm">Aucune image disponible pour cet équipement</span>
            </div>
          )}

          {/* Informations générales */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Référence</p>
                <p className="font-semibold text-lg mt-0.5">{equipment.reference}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Type</p>
                <p className="font-medium mt-0.5">{EQUIPMENT_TYPE_LABELS[equipment.type]}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Marque</p>
                <p className="font-medium mt-0.5">{equipment.marque}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Modèle</p>
                <p className="font-medium mt-0.5">{equipment.modele}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Numéro de série</p>
              <p className="font-medium mt-0.5">{equipment.numeroSerie || 'N/A'}</p>
            </div>

            {equipment.description && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Description</p>
                <p className="text-sm mt-0.5 text-foreground leading-relaxed">
                  {equipment.description}
                </p>
              </div>
            )}
          </div>

          {/* Affectations clients */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-muted-foreground" />
                <h3 className="font-medium text-sm">
                  Affectations clients
                  {affectations.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {affectations.length}
                    </Badge>
                  )}
                </h3>
              </div>
              {onAddClientEquipement && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-7 text-xs"
                  onClick={() => setIsAssignFormOpen(true)}
                >
                  <Plus size={12} />
                  Affecter à un client
                </Button>
              )}
            </div>

            {affectations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-3 text-center">
                Cet équipement n&apos;est affecté à aucun client.
              </p>
            ) : (
              <div className="rounded-lg border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                        Client
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          Localisation
                        </span>
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          Achat
                        </span>
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          Installation
                        </span>
                      </th>
                      {onRemoveClientEquipement && (
                        <th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {affectations.map(({ ce, client }) => (
                      <tr key={ce.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium">
                          {client ? getClientDisplayName(client) : 'Client inconnu'}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {ce.localisation || (
                            <span className="text-xs italic text-muted-foreground">Non renseignée</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {ce.dateAchat ? formatDate(ce.dateAchat) : '—'}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {formatDate(ce.dateInstallation)}
                        </td>
                        {onRemoveClientEquipement && (
                          <td className="px-3 py-2 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              aria-label="Retirer l'affectation"
                              onClick={() => handleRemove(ce.id)}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-2">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Assignment sub-form — equipment-side mode */}
      {onAddClientEquipement && (
        <ClientEquipementAssignForm
          open={isAssignFormOpen}
          onOpenChange={(v) => setIsAssignFormOpen(v)}
          clientId={0}
          existingAssignments={affectations.map(({ ce }) => ce)}
          equipments={equipments}
          fixedEquipementId={equipment.id}
          clients={clients}
          onSubmit={(ce) => {
            onAddClientEquipement(ce);
          }}
        />
      )}
    </Dialog>
  );
}
