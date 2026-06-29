'use client';

import { Contract, Intervention, Client, ClientEquipement, Equipment } from '@/types';
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
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockClients } from '@/data/mock-clients';
import { mockClientEquipements } from '@/data/mock-client-equipements';
import { mockEquipments } from '@/data/mock-equipments';
import { mockInterventions } from '@/data/mock-interventions';
import { CONTRACT_FREQUENCY_LABELS } from '@/lib/constants';
import { formatDate, getClientDisplayName } from '@/lib/utils';
import { getTechnicianName } from '@/lib/interventions';
import { EquipmentThumbnail } from '@/components/shared/EquipmentThumbnail';
import { CalendarCheck2 } from 'lucide-react';

function calculateStatus(contract: Contract): 'ACTIF' | 'EXPIRE' | 'BIENTOT_EXPIRE' {
  const today = new Date();
  const dateFin = new Date(contract.dateFin);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  if (dateFin < today) return 'EXPIRE';
  if (dateFin < thirtyDaysFromNow) return 'BIENTOT_EXPIRE';
  return 'ACTIF';
}

interface ContractDetailProps {
  open: boolean;
  contract: Contract | null;
  onClose: () => void;
  interventions?: Intervention[];
  clients?: Client[];
  clientEquipements?: ClientEquipement[];
  equipments?: Equipment[];
}

export function ContractDetail({
  open,
  contract,
  onClose,
  interventions = mockInterventions,
  clients = mockClients,
  clientEquipements = mockClientEquipements,
  equipments = mockEquipments,
}: ContractDetailProps) {
  if (!contract) return null;

  const foundClient = clients.find((c) => c.id === contract.clientId);
  const clientName = foundClient ? getClientDisplayName(foundClient) : 'N/A';

  const coveredInstallations = contract.clientEquipementIds.map((ceId) => {
    const ce = clientEquipements.find((c) => c.id === ceId);
    const eq = ce ? equipments.find((e) => e.id === ce.equipementId) : undefined;
    return { ceId, ce, eq };
  });

  const preventiveInterventions = interventions.filter(
    (i) => i.contractId === contract.id && i.type === 'PREVENTIVE'
  );

  const statutLabel = (statut: string) => {
    switch (statut) {
      case 'PLANIFIEE': return 'Planifiée';
      case 'EN_COURS': return 'En cours';
      case 'REALISEE': return 'Réalisée';
      case 'ANNULEE': return 'Annulée';
      default: return statut;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-7xl sm:max-w-7xl h-[92vh] max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle>Fiche contrat</DialogTitle>
          <DialogDescription>Informations détaillées du contrat</DialogDescription>
        </DialogHeader>

        {/* Top info grid — always visible, never scrolls */}
        <div className="shrink-0 min-w-0 px-6 py-4 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Référence</p>
              <p className="font-semibold text-base mt-0.5">{contract.reference}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Client</p>
              <p className="font-medium mt-0.5">{clientName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Statut</p>
              <div className="mt-1.5">
                <StatusBadge status={calculateStatus(contract)} type="contract" />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Date de début</p>
              <p className="font-medium mt-0.5">{formatDate(contract.dateDebut)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Date de fin</p>
              <p className="font-medium mt-0.5">{formatDate(contract.dateFin)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Périodicité</p>
              <p className="font-medium mt-0.5">{CONTRACT_FREQUENCY_LABELS[contract.periodicite]}</p>
            </div>
            {contract.description && (
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Description</p>
                <p className="text-sm mt-0.5">{contract.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable main content */}
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto px-6 py-4 space-y-6">
          {/* Installations couvertes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Installations couvertes</p>
              {coveredInstallations.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {coveredInstallations.length}
                </Badge>
              )}
            </div>
            {coveredInstallations.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Aucune installation</p>
            ) : (
              <div className="space-y-2">
                {coveredInstallations.map(({ ceId, ce, eq }) => (
                  <div
                    key={ceId}
                    className="text-sm bg-muted/50 rounded p-2 flex items-center gap-3"
                  >
                    <EquipmentThumbnail equipment={eq} size="sm" />
                    <div>
                      <p className="font-medium">
                        {eq?.reference || 'N/A'} — {eq?.marque} {eq?.modele}
                      </p>
                      <p className="text-muted-foreground text-xs">{ce?.localisation || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interventions préventives */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <CalendarCheck2 size={15} className="text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Interventions préventives</p>
              {preventiveInterventions.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {preventiveInterventions.length}
                </Badge>
              )}
            </div>
            {preventiveInterventions.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Aucune intervention préventive liée à ce contrat.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[600px] text-xs">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Référence
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Date prévue
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Équipement
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Technicien
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {preventiveInterventions.map((i) => {
                      const ce = i.clientEquipementId
                        ? clientEquipements.find((c) => c.id === i.clientEquipementId)
                        : undefined;
                      const eq = ce
                        ? equipments.find((e) => e.id === ce.equipementId)
                        : undefined;
                      const eqLabel = eq ? `${eq.reference} — ${eq.modele}` : '—';
                      return (
                        <tr
                          key={i.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30"
                        >
                          <td className="px-3 py-2 font-mono">{i.reference}</td>
                          <td className="px-3 py-2">{formatDate(i.datePrevue)}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium">{eqLabel}</p>
                            {ce?.localisation && (
                              <p className="text-muted-foreground text-[10px]">
                                {ce.localisation}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {getTechnicianName(i.technicienId)}
                          </td>
                          <td className="px-3 py-2">
                            <Badge
                              variant={i.statut === 'REALISEE' ? 'default' : 'outline'}
                              className="text-[10px] h-5"
                            >
                              {statutLabel(i.statut)}
                            </Badge>
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

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
