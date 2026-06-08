'use client';

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
import { mockEquipments } from '@/data/mock-equipments';
import { mockContracts } from '@/data/mock-contracts';
import { EQUIPMENT_TYPE_LABELS } from '@/lib/constants';
import { formatDate, getClientDisplayName, getClientTypeLabel } from '@/lib/utils';
import { findActiveContractForClientEquipement } from '@/lib/interventions';
import { EquipmentThumbnail } from '@/components/shared/EquipmentThumbnail';
import { PackageOpen, MapPin, Calendar, Edit2 } from 'lucide-react';

interface ClientDetailProps {
  open: boolean;
  client: Client | null;
  onClose: () => void;
  clientEquipements?: ClientEquipement[];
  equipments?: Equipment[];
  onEdit?: () => void;
}

export function ClientDetail({
  open,
  client,
  onClose,
  clientEquipements = mockClientEquipements,
  equipments = mockEquipments,
  onEdit,
}: ClientDetailProps) {
  if (!client) return null;

  const affectations = clientEquipements
    .filter((ce) => ce.clientId === client.id)
    .map((ce) => ({
      ce,
      eq: equipments.find((e) => e.id === ce.equipementId),
    }));

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-7xl sm:max-w-7xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fiche client</DialogTitle>
          <DialogDescription>Informations détaillées du client</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informations générales */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {client.typeClient === 'PERSONNE_PHYSIQUE' ? 'Nom complet' : 'Société'}
              </p>
              <p className="font-semibold text-lg mt-0.5">{getClientDisplayName(client)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{getClientTypeLabel(client.typeClient)}</p>
            </div>
            {client.typeClient === 'SOCIETE' && client.contact && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Contact</p>
                <p className="font-medium mt-0.5">{client.contact}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
              <p className="font-medium text-sm mt-0.5">{client.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Téléphone</p>
              <p className="font-medium mt-0.5">{client.telephone || '—'}</p>
            </div>
          </div>

          {/* Adresse */}
          <div className="border-t border-border pt-4 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Adresse</p>
            <p className="text-sm">
              {[client.adresse, client.ville, 'Tunisie'].filter(Boolean).join(', ') || '—'}
            </p>
          </div>

          {/* Date d'ajout */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Client depuis</p>
            <p className="font-medium mt-0.5">{formatDate(client.dateCreation)}</p>
          </div>

          {/* Équipements affectés */}
          <div className="border-t border-border pt-4 space-y-3 min-w-0">
            {/* Section header with quick actions */}
            <div className="flex items-center gap-2">
              <PackageOpen size={15} className="text-muted-foreground" />
              <span className="font-semibold text-sm">
                Équipements affectés
                {affectations.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {affectations.length}
                  </Badge>
                )}
              </span>
            </div>

            {affectations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-3 text-center">
                Aucun équipement affecté à ce client.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-2 py-2" />
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                        Équipement
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                        Type
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
                          Installation
                        </span>
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">
                        Contrat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {affectations.map(({ ce, eq }) => {
                      const activeContract = findActiveContractForClientEquipement(
                        ce.id,
                        client.id,
                        mockContracts
                      );
                      return (
                        <tr
                          key={ce.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30"
                        >
                          <td className="px-2 py-1.5">
                            <EquipmentThumbnail equipment={eq} size="sm" />
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {eq ? `${eq.reference} — ${eq.modele}` : ce.equipementId}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground text-xs">
                            {eq ? EQUIPMENT_TYPE_LABELS[eq.type] : '—'}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{ce.localisation}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {formatDate(ce.dateInstallation)}
                          </td>
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-2 flex-row gap-2">
          {onEdit && (
            <Button variant="secondary" onClick={() => { onClose(); onEdit(); }} className="gap-1.5">
              <Edit2 size={14} />
              Modifier
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
